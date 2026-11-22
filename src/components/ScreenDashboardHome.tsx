"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  ReceiptText,
  Send,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import {
  CountryFlag,
  CURRENCY_META,
  formatAmount,
  type CurrencyCode,
  type DocTypeCode,
} from "@/components/BrandPrimitives";
import type { DocRow, PaymentRow } from "@/components/ScreensDocsAndDashboard";
import type { FullClientRow, FullProjectRow } from "@/components/ScreensManagement";

const SAMPLE_TODAY = new Date(Date.UTC(2026, 10, 20));
const SAMPLE_TODAY_ISO = "2026-11-20";

type Zone = "safe" | "vigilance" | "limit";

const ZONES: Record<Zone, { label: string; pct: string; dot: string }> = {
  safe: { label: "Sûr", pct: "0–60 %", dot: "#34D399" },
  vigilance: { label: "Vigilance", pct: "60–85 %", dot: "#F5B544" },
  limit: { label: "Limite", pct: "85 % et plus", dot: "#F87171" },
};

function fmtInt(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    Math.round(value)
  );
}

function fmtMad(value: number) {
  return `${fmtInt(value)} MAD`;
}

function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export interface DashboardSettings {
  fullName: string;
  annualCeilingMad: number;
  activityCategory: string;
}

export function ScreenDashboardHome({
  documents,
  payments,
  clients,
  projects,
  settings,
  onOpenDoc,
  onConvertDoc,
  onCreateDoc,
  onGoDocuments,
  onGoSettings,
  onGoDeclarations,
}: {
  documents: DocRow[];
  payments: PaymentRow[];
  clients: FullClientRow[];
  projects: FullProjectRow[];
  settings: DashboardSettings;
  onOpenDoc: (doc: DocRow, openPayment?: boolean) => void;
  onConvertDoc: (doc: DocRow, target: DocTypeCode) => void;
  onCreateDoc: (type: DocTypeCode) => void;
  onGoDocuments: (type: "devis" | "facture") => void;
  onGoSettings: () => void;
  onGoDeclarations: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  const clientById = useMemo(() => {
    const map: Record<number, FullClientRow> = {};
    clients.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [clients]);

  const madEquivalent = (doc: DocRow) =>
    doc.currency === "MAD"
      ? doc.totalAmount
      : doc.totalAmount * (doc.exchangeRateToMad || CURRENCY_META[doc.currency as CurrencyCode].defaultRateToMad);

  const metrics = useMemo(() => {
    const collected = payments.reduce((s, p) => s + Number(p.amountReceivedMad || 0), 0);
    const ceiling = settings.annualCeilingMad || 200000;
    const pct = Math.min(100, (collected / ceiling) * 100);
    const zone: Zone = pct < 60 ? "safe" : pct < 85 ? "vigilance" : "limit";
    const remaining = Math.max(0, ceiling - collected);
    const monthsElapsed = SAMPLE_TODAY.getUTCMonth() + 1;
    const runRate = collected / Math.max(1, monthsElapsed);
    const monthsToCeiling = runRate > 0 ? remaining / runRate : Infinity;
    const projection = new Date(SAMPLE_TODAY);
    projection.setUTCMonth(projection.getUTCMonth() + Math.ceil(monthsToCeiling));

    const toCollectDocs = documents.filter(
      (d) =>
        d.isLocked &&
        (d.docType === "facture" || d.docType === "acompte") &&
        ["sent", "pending", "overdue"].includes(d.status)
    );
    const toCollect = toCollectDocs.reduce((s, d) => s + d.indicativeMadAmount, 0);
    const overdueDocs = documents.filter((d) => d.status === "overdue");

    const devisDocs = documents.filter((d) => d.docType === "devis" && d.isLocked);
    const acceptedDevis = documents.filter(
      (d) => d.docType === "devis" && d.status === "accepted"
    );
    const unbilledTasks = projects.flatMap((p) =>
      p.tasksJson
        .filter((t) => t.completed)
        .map((t) => ({
          project: p,
          task: t,
          mad:
            t.quantity *
            t.unitPrice *
            (p.currency === "MAD"
              ? 1
              : CURRENCY_META[p.currency as CurrencyCode]?.defaultRateToMad || 1),
        }))
    );
    const unbilledMad = unbilledTasks.reduce((s, t) => s + t.mad, 0);
    const acceptedMad = acceptedDevis.reduce((s, d) => s + madEquivalent(d), 0);
    const toInvoice = acceptedMad + unbilledMad;

    const issuedInvoices = documents.filter(
      (d) => d.isLocked && ["facture", "acompte", "avoir"].includes(d.docType)
    );
    const paidThisMonth = payments.filter(
      (p) => monthKey(p.paymentDate) === monthKey(SAMPLE_TODAY_ISO)
    );

    return {
      collected,
      ceiling,
      pct,
      zone,
      remaining,
      runRate,
      projectionLabel: projection.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      toCollect,
      toCollectCount: toCollectDocs.length,
      overdueCount: overdueDocs.length,
      devisCount: devisDocs.length,
      devisTotal: devisDocs.reduce((s, d) => s + madEquivalent(d), 0),
      acceptedCount: acceptedDevis.length,
      acceptedTotal: acceptedMad,
      issuedCount: issuedInvoices.length,
      issuedTotal: issuedInvoices.reduce((s, d) => s + madEquivalent(d), 0),
      paidMonthCount: paidThisMonth.length,
      paidMonthTotal: paidThisMonth.reduce((s, p) => s + p.amountReceivedMad, 0),
      toInvoice,
      acceptedDevis,
      unbilledTasks,
      overdueDocs,
    };
  }, [documents, payments, projects, settings.annualCeilingMad]);

  const actions = useMemo(() => {
    type Action = {
      id: string;
      tone: "red" | "blue" | "amber" | "green";
      title: string;
      meta: string;
      cta: string;
      primary?: boolean;
      docId?: number;
      kind: "relance" | "convert" | "invoice" | "payment";
    };
    const list: Action[] = [];

    metrics.overdueDocs.slice(0, 1).forEach((doc) => {
      list.push({
        id: `overdue-${doc.id}`,
        tone: "red",
        title: `${doc.number || "Facture"} · ${clientById[doc.clientId]?.name || "Client"}`,
        meta: `En retard de ${daysBetween(doc.dueDate, SAMPLE_TODAY_ISO)} jours · ${formatAmount(
          doc.totalAmount,
          doc.currency
        )}`,
        cta: "Relancer",
        docId: doc.id,
        kind: "relance",
      });
    });

    metrics.acceptedDevis.slice(0, 1).forEach((doc) => {
      list.push({
        id: `accepted-${doc.id}`,
        tone: "blue",
        title: `${doc.number} accepté · ${clientById[doc.clientId]?.name || "Client"}`,
        meta: `${fmtMad(madEquivalent(doc))} prêts à facturer`,
        cta: "Convertir en facture",
        primary: true,
        docId: doc.id,
        kind: "convert",
      });
    });

    documents
      .filter(
        (d) =>
          d.docType === "devis" &&
          d.isLocked &&
          d.status === "pending" &&
          d.dueDate < SAMPLE_TODAY_ISO
      )
      .slice(0, 1)
      .forEach((doc) => {
        list.push({
          id: `expiring-${doc.id}`,
          tone: "amber",
          title: `${doc.number} · validité dépassée`,
          meta: `${clientById[doc.clientId]?.name || "Client"} · ${fmtMad(
            madEquivalent(doc)
          )} · sans réponse`,
          cta: "Relancer",
          docId: doc.id,
          kind: "relance",
        });
      });

    const projectAction = metrics.unbilledTasks[0];
    if (projectAction) {
      const doneCount = metrics.unbilledTasks.filter(
        (t) => t.project.id === projectAction.project.id
      ).length;
      list.push({
        id: `project-${projectAction.project.id}`,
        tone: "amber",
        title: `Mission « ${projectAction.project.name} » · ${
          clientById[projectAction.project.clientId]?.name || "Client"
        }`,
        meta: `${doneCount} tâche${doneCount > 1 ? "s" : ""} terminée${
          doneCount > 1 ? "s" : ""
        }, non facturée${doneCount > 1 ? "s" : ""} · ${fmtMad(projectAction.mad)}`,
        cta: "Créer la facture",
        kind: "invoice",
      });
    }

    const waitingPayment = documents.find(
      (d) =>
        d.isLocked &&
        ["facture", "acompte"].includes(d.docType) &&
        d.status === "sent"
    );
    if (waitingPayment) {
      list.push({
        id: `payment-${waitingPayment.id}`,
        tone: "green",
        title: `Règlement attendu · ${waitingPayment.number}`,
        meta: `${formatAmount(waitingPayment.totalAmount, waitingPayment.currency)} · saisir le montant reçu en MAD`,
        cta: "Enregistrer",
        docId: waitingPayment.id,
        kind: "payment",
      });
    }

    return list.slice(0, 5);
  }, [clientById, documents, metrics]);

  const declaration = useMemo(() => {
    const sorted = [...payments].sort((a, b) => (a.paymentDate < b.paymentDate ? 1 : -1));
    const latest = sorted[0];
    const baseDate = latest ? new Date(`${latest.paymentDate}T00:00:00Z`) : SAMPLE_TODAY;
    const quarter = Math.floor(baseDate.getUTCMonth() / 3) + 1;
    const year = baseDate.getUTCFullYear();
    const startMonth = (quarter - 1) * 3;
    const start = new Date(Date.UTC(year, startMonth, 1));
    const startIso = start.toISOString().slice(0, 10);
    const end = new Date(Date.UTC(year, startMonth + 3, 1));
    const endIso = end.toISOString().slice(0, 10);
    const total = payments
      .filter((p) => p.paymentDate >= startIso && p.paymentDate < endIso)
      .reduce((s, p) => s + p.amountReceivedMad, 0);

    return {
      label: `T${quarter} ${year}`,
      startLabel: start.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }),
      total,
    };
  }, [payments]);

  const upcoming = useMemo(() => {
    return documents
      .filter(
        (d) =>
          d.isLocked &&
          d.dueDate >= SAMPLE_TODAY_ISO &&
          ["sent", "pending", "accepted"].includes(d.status)
      )
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
      .slice(0, 3)
      .map((d) => {
        const date = new Date(`${d.dueDate}T00:00:00Z`);
        return {
          doc: d,
          day: date.toLocaleDateString("fr-FR", { day: "2-digit", timeZone: "UTC" }),
          month: date
            .toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" })
            .replace(".", "")
            .toUpperCase(),
          title:
            d.docType === "devis"
              ? `Fin de validité ${d.number}`
              : `Échéance de paiement ${d.number}`,
          client: clientById[d.clientId]?.name || "Client",
        };
      });
  }, [clientById, documents]);

  const monthly = useMemo(() => {
    const months: { key: string; label: string; total: number; current: boolean }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(2026, 10 - i, 1));
      months.push({
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }).replace(".", i === 0 ? "" : "."),
        total: 0,
        current: i === 0,
      });
    }
    payments.forEach((p) => {
      const bucket = months.find((m) => m.key === monthKey(p.paymentDate));
      if (bucket) bucket.total += p.amountReceivedMad;
    });
    const max = Math.max(...months.map((m) => m.total), 1);
    return { months, max };
  }, [payments]);

  const origin = useMemo(() => {
    const totals: Record<string, number> = {};
    payments.forEach((p) => {
      totals[p.currency] = (totals[p.currency] || 0) + p.amountReceivedMad;
    });
    const grand = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
    const palette = ["#2457F5", "#0F3D3A", "#BFF0D4", "#8A4B00"];
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([currency, amount], idx) => ({
        currency,
        pct: Math.round((amount / grand) * 100),
        color: palette[idx % palette.length],
      }));
  }, [payments]);

  const firstName = settings.fullName.split(" ")[0];
  const zoneCfg = ZONES[metrics.zone];
  const todayLabel = SAMPLE_TODAY.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex-1 bg-white px-6 py-6 lg:px-8 lg:py-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] text-[#667085]">
            {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
          </p>
          <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-[-0.025em] text-[#14171F] lg:text-[28px]">
            Bonjour {firstName}, voici ce qui compte aujourd&apos;hui
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#FFF0D6] px-3 py-1.5 text-[12px] font-semibold text-[#8A4B00]">
            Données d&apos;exemple
          </span>
          <button
            type="button"
            onClick={() => onCreateDoc("devis")}
            className="rounded-[12px] border border-[#E3E6EC] bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB]"
          >
            Nouveau devis
          </button>
          <button
            type="button"
            onClick={() => onCreateDoc("facture")}
            className="rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]"
          >
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* Hero + cashflow cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[20px] bg-[#0F3D3A] p-6 text-white lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-[12.5px] text-[#D6EFE1]">
              Chiffre d&apos;affaires encaissé en 2026 · activité de{" "}
              {settings.activityCategory === "commercial" ? "commerce" : "services"}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE7B6] px-3 py-1 text-[11.5px] font-bold text-[#7A3E00]">
              {Math.round(metrics.pct)} % · {zoneCfg.label}
            </span>
          </div>

          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[38px] font-bold leading-none tracking-[-0.03em] tabular-nums lg:text-[42px]">
              {fmtInt(metrics.collected)}
            </span>
            <span className="text-[18px] font-semibold text-[#D6EFE1]">MAD</span>
          </p>

          {/* Segmented traffic-light ceiling gauge */}
          <div className="relative mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="absolute inset-y-0 left-0 w-[60%] bg-[#34D399]/45" />
            <div className="absolute inset-y-0 left-[60%] w-[25%] bg-[#F5B544]/45" />
            <div className="absolute inset-y-0 left-[85%] w-[15%] bg-[#F87171]/50" />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#EAFBF1]"
              style={{ width: `${Math.max(2, metrics.pct)}%` }}
            />
            <div className="absolute inset-y-0 left-[60%] w-px bg-[#0F3D3A]/35" />
            <div className="absolute inset-y-0 left-[85%] w-px bg-[#0F3D3A]/35" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[#D6EFE1]">
            {(Object.keys(ZONES) as Zone[]).map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ZONES[key].dot }}
                />
                {ZONES[key].label} · {ZONES[key].pct}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-white">
              Reste {fmtMad(metrics.remaining)} avant le plafond
            </span>
            <button
              type="button"
              onClick={onGoSettings}
              className="text-[#D6EFE1] underline decoration-[#D6EFE1]/40 underline-offset-4 hover:text-white"
            >
              Plafond configuré · {fmtMad(metrics.ceiling)} (modifiable)
            </button>
          </div>

          <p className="mt-5 rounded-[12px] bg-white/10 px-4 py-3 text-[12.5px] leading-relaxed text-[#EAFBF1]">
            Au rythme actuel (≈ {fmtMad(metrics.runRate)}/mois), le plafond serait
            atteint vers {metrics.projectionLabel}. Les factures à encaisser
            ci-dessous ne comptent qu&apos;une fois payées.
          </p>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <section className="flex-1 rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <p className="text-[12.5px] font-medium text-[#525866]">À encaisser</p>
            <p className="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#14171F] tabular-nums">
              {fmtInt(metrics.toCollect)} <span className="text-[15px]">MAD</span>
            </p>
            <p className="mt-2 text-[12px] text-[#667085]">
              {metrics.toCollectCount} facture{metrics.toCollectCount > 1 ? "s" : ""}
              {metrics.overdueCount > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-[#A31D1D]">
                    dont {metrics.overdueCount} en retard
                  </span>
                </>
              )}
            </p>
          </section>

          <section className="flex-1 rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <p className="text-[12.5px] font-medium text-[#525866]">À facturer</p>
            <p className="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#14171F] tabular-nums">
              {fmtInt(metrics.toInvoice)} <span className="text-[15px]">MAD</span>
            </p>
            <p className="mt-2 text-[12px] text-[#667085]">
              {metrics.acceptedCount} devis accepté{metrics.acceptedCount > 1 ? "s" : ""}{" "}
              + {metrics.unbilledTasks.length} tâche
              {metrics.unbilledTasks.length > 1 ? "s" : ""} non facturée
              {metrics.unbilledTasks.length > 1 ? "s" : ""}
            </p>
          </section>
        </div>
      </div>

      {/* Billing cycle */}
      <section className="mt-4 rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold text-[#14171F]">Votre cycle de facturation</h2>
          <span className="text-[12px] text-[#667085]">Du devis au paiement reçu</span>
        </div>

        <div className="mt-4 grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {[
            {
              label: "Devis envoyés",
              count: metrics.devisCount,
              amount: `${fmtInt(metrics.devisTotal)} MAD`,
              accent: false,
            },
            {
              label: "Acceptés",
              count: metrics.acceptedCount,
              amount: `${fmtInt(metrics.acceptedTotal)} MAD`,
              accent: false,
            },
            {
              label: "Factures émises",
              count: metrics.issuedCount,
              amount: `${fmtInt(metrics.issuedTotal)} MAD`,
              accent: false,
            },
            {
              label: "Payées ce mois",
              count: metrics.paidMonthCount,
              amount: `${fmtInt(metrics.paidMonthTotal)} MAD reçus`,
              accent: true,
            },
          ].map((step, idx, all) => (
            <React.Fragment key={step.label}>
              <div
                className={`rounded-[14px] px-4 py-3 ${
                  step.accent
                    ? "bg-[#E7F7EE]"
                    : "bg-[#F7F8FA]"
                }`}
              >
                <p
                  className={`text-[12px] ${
                    step.accent ? "text-[#0B6B3A]" : "text-[#667085]"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-1 text-[20px] font-bold leading-none tabular-nums ${
                    step.accent ? "text-[#0B6B3A]" : "text-[#14171F]"
                  }`}
                >
                  {step.count}
                </p>
                <p
                  className={`mt-1.5 text-[11.5px] tabular-nums ${
                    step.accent ? "text-[#0B6B3A]" : "text-[#525866]"
                  }`}
                >
                  {step.amount}
                </p>
              </div>
              {idx < all.length - 1 && (
                <div className="hidden items-center justify-center text-[#98A2B3] lg:flex">
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Action queue + declaration / deadlines */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-8 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold text-[#14171F]">À faire maintenant</h2>
            <span className="rounded-full bg-[#FDE3E3] px-2.5 py-1 text-[11.5px] font-semibold text-[#A31D1D]">
              {actions.length} action{actions.length > 1 ? "s" : ""}
            </span>
          </div>

          <ul className="mt-2 divide-y divide-[#F0F2F5]">
            {actions.map((action) => {
              const dot =
                action.tone === "red"
                  ? "#E5534B"
                  : action.tone === "blue"
                  ? "#2457F5"
                  : action.tone === "amber"
                  ? "#F0A32A"
                  : "#12A05C";
              return (
                <li
                  key={action.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: dot }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[#14171F]">
                        {action.title}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[#667085]">{action.meta}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (action.kind === "convert" && action.docId) {
                        const doc = documents.find((d) => d.id === action.docId);
                        if (doc) onConvertDoc(doc, "facture");
                        notify("Facture brouillon créée depuis le devis accepté.");
                        return;
                      }
                      if (action.kind === "payment" && action.docId) {
                        const doc = documents.find((d) => d.id === action.docId);
                        if (doc) onOpenDoc(doc, true);
                        return;
                      }
                      if (action.kind === "invoice") {
                        onCreateDoc("facture");
                        return;
                      }
                      notify("Relance préparée : e-mail de rappel prêt à envoyer.");
                    }}
                    className={`shrink-0 rounded-[10px] px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                      action.primary
                        ? "bg-[#2457F5] text-white hover:bg-[#1B45C9]"
                        : "border border-[#E3E6EC] bg-[#F7F8FA] text-[#14171F] hover:bg-[#EFF1F4]"
                    }`}
                  >
                    {action.cta}
                  </button>
                </li>
              );
            })}
            {actions.length === 0 && (
              <li className="py-8 text-center text-[12.5px] text-[#667085]">
                Rien à faire : tout est à jour.
              </li>
            )}
          </ul>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#14171F]">
              Déclaration du chiffre d&apos;affaires
            </h2>
            <p className="mt-0.5 text-[12px] text-[#667085]">
              {declaration.label} · rythme trimestriel
            </p>
            <p className="mt-2 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#14171F] tabular-nums">
              {fmtInt(declaration.total)} <span className="text-[15px]">MAD</span>
            </p>
            <p className="mt-1 text-[12px] text-[#667085]">
              encaissés depuis le {declaration.startLabel}, à déclarer
            </p>

            <div className="mt-3 rounded-[12px] bg-[#F7F8FA] px-3.5 py-3 text-[12px] leading-relaxed text-[#525866]">
              Contribution estimée : [taux à configurer]
              <br />
              Échéance : [date à configurer]
            </div>

            <button
              type="button"
              onClick={onGoDeclarations}
              className="mt-3 w-full rounded-[10px] bg-[#2457F5] py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]"
            >
              Préparer ma déclaration
            </button>
          </section>

          <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#14171F]">Prochaines échéances</h2>
            <ul className="mt-3 space-y-3">
              {upcoming.map((item) => (
                <li key={item.doc.id} className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#F7F8FA]">
                    <span className="text-[13px] font-bold leading-none text-[#14171F] tabular-nums">
                      {item.day}
                    </span>
                    <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#667085]">
                      {item.month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 border-b border-[#F0F2F5] pb-3 last:border-none last:pb-0">
                    <button
                      type="button"
                      onClick={() => onOpenDoc(item.doc)}
                      className="truncate text-[12.5px] font-semibold text-[#14171F] hover:text-[#2457F5]"
                    >
                      {item.title}
                    </button>
                    <p className="text-[11.5px] text-[#667085]">{item.client}</p>
                  </div>
                </li>
              ))}
              {upcoming.length === 0 && (
                <li className="text-[12.5px] text-[#667085]">Aucune échéance à venir.</li>
              )}
            </ul>
          </section>
        </div>
      </div>

      {/* Collections chart + origin */}
      <div className="mt-4 grid grid-cols-1 gap-4 pb-2 lg:grid-cols-12">
        <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-8 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold text-[#14171F]">Encaissements par mois</h2>
            <span className="text-[12px] text-[#667085]">MAD reçus</span>
          </div>

          <div className="mt-5 flex h-[180px] items-end justify-between gap-4 border-b border-[#ECEEF2] pb-2">
            {monthly.months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10.5px] font-semibold text-[#525866] tabular-nums">
                  {m.total > 0 ? `${Math.round(m.total / 1000)}k` : ""}
                </span>
                <div
                  className={`w-full max-w-[56px] rounded-t-[8px] ${
                    m.current ? "bg-[#2457F5]" : "bg-[#DCE3FF]"
                  }`}
                  style={{ height: `${Math.max(6, (m.total / monthly.max) * 140)}px` }}
                  title={fmtMad(m.total)}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-4">
            {monthly.months.map((m) => (
              <span key={m.key} className="flex-1 text-center text-[11.5px] text-[#667085]">
                {m.label}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-4">
          <h2 className="text-[16px] font-bold text-[#14171F]">
            Origine des encaissements
          </h2>
          <p className="mt-0.5 text-[12px] text-[#667085]">Par devise, converti en MAD reçus</p>

          <div className="mt-4 space-y-4">
            {origin.map((row) => (
              <div key={row.currency}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 font-semibold text-[#14171F]">
                    <CountryFlag code={row.currency} size={16} />
                    {row.currency}
                  </span>
                  <span className="font-semibold text-[#14171F] tabular-nums">{row.pct} %</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#EFF1F4]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            ))}
            {origin.length === 0 && (
              <p className="text-[12.5px] text-[#667085]">Aucun encaissement pour le moment.</p>
            )}
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-[12px] bg-[#F7F8FA] px-3.5 py-3 text-[11.5px] leading-relaxed text-[#525866]">
            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0F3D3A]" />
            <span>
              Seuls les montants reçus en MAD comptent dans votre plafond
              Auto-Entrepreneur.
            </span>
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-[14px] border border-[#E3E6EC] bg-white px-4 py-3 shadow-[0_20px_48px_rgba(20,23,31,0.16)]"
        >
          <CheckCircle2 className="h-4 w-4 text-[#0B6B3A]" />
          <span className="text-[12.5px] font-medium text-[#14171F]">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded p-1 text-[#667085] hover:bg-[#F3F4F6]"
            aria-label="Fermer la notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export const DashboardIconSet = {
  FileText,
  ReceiptText,
  Send,
  Sparkles,
  CalendarDays,
  ArrowRight,
};
