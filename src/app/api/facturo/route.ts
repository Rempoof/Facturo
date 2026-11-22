import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  businessSettings,
  clients,
  servicesCatalog,
  projects,
  documents,
  payments,
  type DocumentLineItem,
  type DocumentTimelineStep,
} from "@/db/schema";
import { ensureSeededData } from "@/db/seed";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function loadAllState() {
  await ensureSeededData();
  const [settingsRows, clientRows, catalogRows, projectRows, documentRows, paymentRows] =
    await Promise.all([
      db.select().from(businessSettings),
      db.select().from(clients).orderBy(desc(clients.id)),
      db.select().from(servicesCatalog).orderBy(servicesCatalog.id),
      db.select().from(projects).orderBy(desc(projects.id)),
      db.select().from(documents).orderBy(desc(documents.id)),
      db.select().from(payments).orderBy(desc(payments.id)),
    ]);

  return {
    settings: settingsRows[0],
    clients: clientRows,
    catalog: catalogRows,
    projects: projectRows,
    documents: documentRows,
    payments: paymentRows,
  };
}

export async function GET() {
  try {
    const state = await loadAllState();
    return NextResponse.json(state);
  } catch (err) {
    console.error("GET /api/facturo error:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des données Facturo." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeededData();
    const body = await req.json();
    const { action } = body;

    if (action === "save_document") {
      const {
        id,
        issueNow,
        docType,
        clientId,
        projectId,
        language,
        currency,
        exchangeRateToMad,
        issueDate,
        dueDate,
        items,
        globalDiscountPct,
        depositRequestedPct,
        vatMode,
        legalMention,
        paymentMethod,
        paymentTerms,
        bankAccountKey,
        notes,
      } = body;

      const parsedItems: DocumentLineItem[] = Array.isArray(items) ? items : [];
      const rawSubtotal = parsedItems.reduce((acc, item) => {
        const lineGross = Number(item.quantity || 0) * Number(item.unitPrice || 0);
        const lineNet = lineGross * (1 - Number(item.discountPct || 0) / 100);
        return acc + lineNet;
      }, 0);
      const discountAmt = rawSubtotal * (Number(globalDiscountPct || 0) / 100);
      const afterDiscount = Math.max(0, rawSubtotal - discountAmt);
      const finalTotal =
        docType === "acompte" && Number(depositRequestedPct || 0) > 0
          ? afterDiscount * (Number(depositRequestedPct) / 100)
          : afterDiscount;
      const rate = currency === "MAD" ? 1 : Number(exchangeRateToMad || 10.8);
      const indicativeMad = Math.round(finalTotal * rate * 100) / 100;

      let assignedNumber: string | null = null;
      let locked = false;
      let status = "draft";

      if (issueNow) {
        const [settings] = await db.select().from(businessSettings);
        const docKey = (docType || "facture") as
          | "devis"
          | "proforma"
          | "facture"
          | "acompte"
          | "avoir";
        const rule = settings.numberingJson[docKey] || {
          prefix: "FAC",
          year: 2026,
          nextCounter: 20,
          padding: 4,
        };
        assignedNumber = `${rule.prefix}-${rule.year}-${String(rule.nextCounter).padStart(
          rule.padding,
          "0"
        )}`;
        locked = true;
        status = docType === "devis" || docType === "proforma" ? "pending" : "sent";

        const updatedNumbering = {
          ...settings.numberingJson,
          [docKey]: { ...rule, nextCounter: rule.nextCounter + 1 },
        };
        await db
          .update(businessSettings)
          .set({ numberingJson: updatedNumbering, updatedAt: new Date() })
          .where(eq(businessSettings.id, settings.id));
      }

      const nowLabel = new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeline: DocumentTimelineStep[] = issueNow
        ? [
            { step: "created", labelFr: `Créé et verrouillé (${assignedNumber})`, timestamp: nowLabel, done: true },
            { step: "sent", labelFr: "Envoyé au client", timestamp: nowLabel, done: true },
            { step: "viewed", labelFr: "En attente de lecture", timestamp: null, done: false },
            { step: "paid", labelFr: "En attente de règlement", timestamp: null, done: false },
          ]
        : [
            { step: "created", labelFr: "Brouillon enregistré", timestamp: nowLabel, done: true },
            { step: "sent", labelFr: "Émission en attente", timestamp: null, done: false },
            { step: "viewed", labelFr: "Consultation client", timestamp: null, done: false },
            { step: "paid", labelFr: "Règlement", timestamp: null, done: false },
          ];

      if (id) {
        const [existing] = await db.select().from(documents).where(eq(documents.id, Number(id)));
        if (existing?.isLocked) {
          return NextResponse.json(
            { error: "Ce document est déjà émis et verrouillé. Créez un avoir pour le corriger." },
            { status: 400 }
          );
        }
        await db
          .update(documents)
          .set({
            docType,
            number: assignedNumber,
            isLocked: locked,
            status,
            clientId: Number(clientId),
            projectId: projectId ? Number(projectId) : null,
            language,
            currency,
            exchangeRateToMad: rate,
            issueDate,
            dueDate,
            itemsJson: parsedItems,
            globalDiscountPct: Number(globalDiscountPct || 0),
            depositRequestedPct: Number(depositRequestedPct || 0),
            vatMode,
            legalMention,
            paymentMethod,
            paymentTerms,
            bankAccountKey,
            notes: notes || "",
            subtotal: Math.round(rawSubtotal * 100) / 100,
            discountAmount: Math.round(discountAmt * 100) / 100,
            totalAmount: Math.round(finalTotal * 100) / 100,
            indicativeMadAmount: indicativeMad,
            timelineJson: timeline,
          })
          .where(eq(documents.id, Number(id)));
      } else {
        await db.insert(documents).values({
          docType,
          number: assignedNumber,
          isLocked: locked,
          status,
          clientId: Number(clientId),
          projectId: projectId ? Number(projectId) : null,
          language,
          currency,
          exchangeRateToMad: rate,
          issueDate,
          dueDate,
          itemsJson: parsedItems,
          globalDiscountPct: Number(globalDiscountPct || 0),
          depositRequestedPct: Number(depositRequestedPct || 0),
          vatMode,
          legalMention,
          paymentMethod,
          paymentTerms,
          bankAccountKey,
          notes: notes || "",
          subtotal: Math.round(rawSubtotal * 100) / 100,
          discountAmount: Math.round(discountAmt * 100) / 100,
          totalAmount: Math.round(finalTotal * 100) / 100,
          indicativeMadAmount: indicativeMad,
          timelineJson: timeline,
        });
      }

      const state = await loadAllState();
      return NextResponse.json({ ...state, assignedNumber });
    }

    if (action === "record_payment") {
      const {
        documentId,
        amountCurrency,
        currency,
        amountReceivedMad,
        bankFeesMad,
        paymentDate,
        method,
        reference,
        notes,
      } = body;

      await db.insert(payments).values({
        documentId: Number(documentId),
        amountCurrency: Number(amountCurrency),
        currency,
        amountReceivedMad: Number(amountReceivedMad),
        bankFeesMad: Number(bankFeesMad || 0),
        paymentDate,
        method,
        reference,
        notes: notes || "",
      });

      const [doc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, Number(documentId)));

      if (doc) {
        const updatedTimeline: DocumentTimelineStep[] = doc.timelineJson.map((t) =>
          t.step === "paid" || t.step === "viewed"
            ? {
                ...t,
                done: true,
                timestamp: t.timestamp || paymentDate,
                labelFr:
                  t.step === "paid"
                    ? `Payé (${Number(amountReceivedMad).toLocaleString("fr-FR")} MAD reçus)`
                    : t.labelFr,
              }
            : t
        );
        await db
          .update(documents)
          .set({ status: "paid", timelineJson: updatedTimeline })
          .where(eq(documents.id, doc.id));
      }

      const state = await loadAllState();
      return NextResponse.json(state);
    }

    if (action === "duplicate_or_convert") {
      const { sourceId, targetType } = body;
      const [src] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, Number(sourceId)));
      if (!src) {
        return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
      }
      const nextDocType = targetType || src.docType;
      const multiplier = nextDocType === "avoir" ? -1 : 1;
      await db.insert(documents).values({
        docType: nextDocType,
        number: null,
        isLocked: false,
        status: "draft",
        clientId: src.clientId,
        projectId: src.projectId,
        language: src.language,
        currency: src.currency,
        exchangeRateToMad: src.exchangeRateToMad,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: src.dueDate,
        itemsJson: src.itemsJson.map((it) => ({
          ...it,
          id: `${it.id}-copy-${Date.now()}`,
          unitPrice: Math.abs(it.unitPrice) * (nextDocType === "avoir" ? 1 : 1),
        })),
        globalDiscountPct: src.globalDiscountPct,
        depositRequestedPct: src.depositRequestedPct,
        vatMode: src.vatMode,
        legalMention: src.legalMention,
        paymentMethod: src.paymentMethod,
        paymentTerms: src.paymentTerms,
        bankAccountKey: src.bankAccountKey,
        notes:
          nextDocType === "avoir"
            ? `Avoir relatif au document ${src.number || "brouillon"} (Exemple).`
            : nextDocType === "facture" && src.docType === "devis"
            ? `Facture issue du devis ${src.number || ""} (Exemple).`
            : src.notes,
        subtotal: src.subtotal * multiplier,
        discountAmount: src.discountAmount,
        totalAmount: src.totalAmount * multiplier,
        indicativeMadAmount: src.indicativeMadAmount * multiplier,
        timelineJson: [
          {
            step: "created",
            labelFr: "Brouillon créé par conversion/duplication",
            timestamp: "Aujourd'hui",
            done: true,
          },
          { step: "sent", labelFr: "Émission en attente", timestamp: null, done: false },
          { step: "viewed", labelFr: "Consultation client", timestamp: null, done: false },
          { step: "paid", labelFr: "Règlement", timestamp: null, done: false },
        ],
      });

      const state = await loadAllState();
      return NextResponse.json(state);
    }

    if (action === "create_client") {
      const {
        name,
        contactName,
        clientType,
        countryCode,
        countryName,
        city,
        address,
        email,
        iceOrTaxId,
        taxIdLabel,
        preferredLanguage,
        defaultCurrency,
        notes,
      } = body;

      await db.insert(clients).values({
        name,
        contactName,
        clientType,
        countryCode,
        countryName,
        city,
        address,
        email,
        iceOrTaxId,
        taxIdLabel,
        preferredLanguage,
        defaultCurrency,
        notes: notes || "",
      });

      const state = await loadAllState();
      return NextResponse.json(state);
    }

    if (action === "toggle_project_task") {
      const { projectId, taskId } = body;
      const [proj] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, Number(projectId)));
      if (proj) {
        const nextTasks = proj.tasksJson.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        await db
          .update(projects)
          .set({ tasksJson: nextTasks })
          .where(eq(projects.id, proj.id));
      }
      const state = await loadAllState();
      return NextResponse.json(state);
    }

    if (action === "update_settings") {
      const [existing] = await db.select().from(businessSettings);
      if (existing) {
        await db
          .update(businessSettings)
          .set({
            fullName: body.fullName ?? existing.fullName,
            tradeName: body.tradeName ?? existing.tradeName,
            activityLabel: body.activityLabel ?? existing.activityLabel,
            activityCategory: body.activityCategory ?? existing.activityCategory,
            ice: body.ice ?? existing.ice,
            autoEntrepreneurNumber:
              body.autoEntrepreneurNumber ?? existing.autoEntrepreneurNumber,
            annualCeilingMad:
              body.annualCeilingMad !== undefined
                ? Number(body.annualCeilingMad)
                : existing.annualCeilingMad,
            updatedAt: new Date(),
          })
          .where(eq(businessSettings.id, existing.id));
      }
      const state = await loadAllState();
      return NextResponse.json(state);
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
  } catch (err) {
    console.error("POST /api/facturo error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'opération." },
      { status: 500 }
    );
  }
}
