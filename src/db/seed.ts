import { db } from "@/db";
import {
  businessSettings,
  clients,
  servicesCatalog,
  projects,
  documents,
  payments,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Adds the activity series used by the turnover dashboard: settlements spread
 * over six months, an accepted quote, an expired quote and two extra paid
 * invoices. Idempotent so existing databases are topped up exactly once.
 */
async function ensureDashboardSampleData() {
  const marker = await db
    .select()
    .from(documents)
    .where(eq(documents.number, "FAC-2026-0009"));
  if (marker.length > 0) return;

  await db.execute(
    sql`UPDATE payments SET payment_date = '2026-06-26' WHERE reference = 'VIR-MA-7741200-SAMPLE'`
  );
  await db.execute(
    sql`UPDATE payments SET payment_date = '2026-09-30' WHERE reference = 'SWF-US-9920148-SAMPLE'`
  );
  await db.execute(
    sql`UPDATE payments SET payment_date = '2026-10-22' WHERE reference = 'SWF-CH-4481029-SAMPLE'`
  );

  const overdueTimeline = JSON.stringify([
    { step: "created", labelFr: "Créé et numéroté", timestamp: "20 oct. 2026 • 11:00", done: true },
    { step: "sent", labelFr: "Envoyé au client", timestamp: "20 oct. 2026 • 11:12", done: true },
    { step: "viewed", labelFr: "Consulté par le client", timestamp: "22 oct. 2026 • 10:04", done: true },
    { step: "paid", labelFr: "En attente de règlement", timestamp: null, done: false },
  ]);
  await db.execute(
    sql`UPDATE documents SET issue_date = '2026-10-20', due_date = '2026-11-08', timeline_json = ${overdueTimeline}::jsonb WHERE number = 'FAC-2026-0015'`
  );

  const sentTimeline = JSON.stringify([
    { step: "created", labelFr: "Créé et numéroté", timestamp: "04 nov. 2026 • 09:42", done: true },
    { step: "sent", labelFr: "Envoyé par e-mail au client", timestamp: "04 nov. 2026 • 09:45", done: true },
    { step: "viewed", labelFr: "Consulté par le client", timestamp: "05 nov. 2026 • 14:18", done: true },
    { step: "paid", labelFr: "Règlement attendu au 03 déc. 2026", timestamp: null, done: false },
  ]);
  await db.execute(
    sql`UPDATE documents SET issue_date = '2026-11-04', due_date = '2026-12-03', timeline_json = ${sentTimeline}::jsonb WHERE number = 'FAC-2026-0018'`
  );

  await db.execute(
    sql`UPDATE documents SET status = 'accepted', due_date = '2026-12-15' WHERE number = 'DEV-2026-0014'`
  );

  const clientRows = await db.select().from(clients);
  const projectRows = await db.select().from(projects);
  const maison = clientRows.find((c) => c.name.startsWith("Maison Lumière"));
  const koutoubia = clientRows.find((c) => c.name.startsWith("Koutoubia"));
  const prjMaison = projectRows.find((p) => p.name.includes("Portail"));
  const prjKoutoubia = projectRows.find((p) => p.name.includes("Flotte"));
  if (!maison || !koutoubia) return;

  const created = await db
    .insert(documents)
    .values([
      {
        docType: "facture",
        number: "FAC-2026-0009",
        isLocked: true,
        status: "paid",
        clientId: maison.id,
        projectId: prjMaison?.id ?? null,
        language: "FR",
        currency: "EUR",
        exchangeRateToMad: 10.76,
        issueDate: "2026-08-04",
        dueDate: "2026-09-03",
        itemsJson: [
          {
            id: "ln-70",
            designation: "Atelier de cadrage complémentaire (Exemple)",
            quantity: 1,
            unit: "jour",
            unitPrice: 500,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "export_hors_champ",
        legalMention:
          "Prestation de services à l'export exonérée de TVA marocaine (Article 92-I-1° du CGI).",
        paymentMethod: "Virement SEPA / SWIFT",
        paymentTerms: "30 jours nets",
        bankAccountKey: "eur_iban",
        notes: "Règlement SEPA reçu en août 2026 (Exemple).",
        subtotal: 500,
        discountAmount: 0,
        totalAmount: 500,
        indicativeMadAmount: 5380,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "04 août 2026 • 10:12", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "04 août 2026 • 10:18", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "05 août 2026 • 09:03", done: true },
          { step: "paid", labelFr: "Payé (5 380,00 MAD reçus)", timestamp: "20 août 2026 • 11:40", done: true },
        ],
      },
      {
        docType: "facture",
        number: "FAC-2026-0010",
        isLocked: true,
        status: "paid",
        clientId: koutoubia.id,
        projectId: prjKoutoubia?.id ?? null,
        language: "FR",
        currency: "MAD",
        exchangeRateToMad: 1,
        issueDate: "2026-10-28",
        dueDate: "2026-11-27",
        itemsJson: [
          {
            id: "ln-80",
            designation: "Maintenance évolutive écrans dispatch (Octobre, Exemple)",
            quantity: 1,
            unit: "forfait",
            unitPrice: 6600,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "franchise_ae",
        legalMention:
          "TVA non applicable — Régime de l'Auto-Entrepreneur (Article 89-I-12° du CGI).",
        paymentMethod: "Virement bancaire RIB Maroc",
        paymentTerms: "15 jours nets",
        bankAccountKey: "mad_rib",
        notes: "Réglée par virement national le 12 novembre 2026 (Exemple).",
        subtotal: 6600,
        discountAmount: 0,
        totalAmount: 6600,
        indicativeMadAmount: 6600,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "28 oct. 2026 • 09:20", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "28 oct. 2026 • 09:26", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "29 oct. 2026 • 15:11", done: true },
          { step: "paid", labelFr: "Payé (6 600,00 MAD reçus)", timestamp: "12 nov. 2026 • 10:05", done: true },
        ],
      },
      {
        docType: "devis",
        number: "DEV-2026-0013",
        isLocked: true,
        status: "pending",
        clientId: maison.id,
        projectId: null,
        language: "FR",
        currency: "EUR",
        exchangeRateToMad: 10.8,
        issueDate: "2026-09-20",
        dueDate: "2026-10-20",
        itemsJson: [
          {
            id: "ln-90",
            designation: "Refonte parcours d'onboarding — phase 1 (Exemple)",
            quantity: 2,
            unit: "jour",
            unitPrice: 600,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 30,
        vatMode: "export_hors_champ",
        legalMention:
          "Prestation de services à l'export exonérée de TVA marocaine (Article 92-I-1° du CGI).",
        paymentMethod: "Virement SEPA / SWIFT",
        paymentTerms: "À réception",
        bankAccountKey: "eur_iban",
        notes: "Relance à programmer — validité dépassée (Exemple).",
        subtotal: 1200,
        discountAmount: 0,
        totalAmount: 1200,
        indicativeMadAmount: 12960,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "20 sept. 2026 • 11:00", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "20 sept. 2026 • 11:06", done: true },
          { step: "viewed", labelFr: "Consulté — sans réponse", timestamp: "23 sept. 2026 • 08:42", done: true },
          { step: "paid", labelFr: "En attente de décision", timestamp: null, done: false },
        ],
      },
    ])
    .returning();

  const eurInvoice = created.find((d) => d.number === "FAC-2026-0009");
  const madInvoice = created.find((d) => d.number === "FAC-2026-0010");
  const inserts = [];
  if (eurInvoice) {
    inserts.push({
      documentId: eurInvoice.id,
      amountCurrency: 500,
      currency: "EUR",
      amountReceivedMad: 5380,
      bankFeesMad: 42,
      paymentDate: "2026-08-20",
      method: "Virement SEPA EUR",
      reference: "SEPA-EUR-5512038-SAMPLE",
      notes: "Frais SEPA déduits par la banque (Exemple).",
    });
  }
  if (madInvoice) {
    inserts.push({
      documentId: madInvoice.id,
      amountCurrency: 6600,
      currency: "MAD",
      amountReceivedMad: 6600,
      bankFeesMad: 0,
      paymentDate: "2026-11-12",
      method: "Virement bancaire RIB Maroc",
      reference: "VIR-MA-8820311-SAMPLE",
      notes: "Virement national reçu sans frais (Exemple).",
    });
  }
  if (inserts.length > 0) {
    await db.insert(payments).values(inserts);
  }
}

let schemaEnsured = false;

export async function ensureSeededData() {
  if (!schemaEnsured) {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS business_settings (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        trade_name TEXT NOT NULL,
        activity_label TEXT NOT NULL,
        activity_category TEXT NOT NULL,
        ice TEXT NOT NULL,
        auto_entrepreneur_number TEXT NOT NULL,
        identifiant_fiscal TEXT NOT NULL,
        taxe_professionnelle TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        annual_ceiling_mad DOUBLE PRECISION NOT NULL DEFAULT 200000,
        bank_accounts_json JSONB NOT NULL,
        numbering_json JSONB NOT NULL,
        legal_mentions_json JSONB NOT NULL,
        email_templates_json JSONB NOT NULL,
        signature_name TEXT NOT NULL,
        signature_role TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        client_type TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country_name TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT NOT NULL,
        ice_or_tax_id TEXT NOT NULL,
        tax_id_label TEXT NOT NULL,
        preferred_language TEXT NOT NULL DEFAULT 'FR',
        default_currency TEXT NOT NULL DEFAULT 'MAD',
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS services_catalog (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        title_fr TEXT NOT NULL,
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        description TEXT NOT NULL,
        unit TEXT NOT NULL DEFAULT 'jour',
        unit_price_mad DOUBLE PRECISION NOT NULL,
        category TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        client_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        currency TEXT NOT NULL DEFAULT 'MAD',
        budget_amount DOUBLE PRECISION NOT NULL,
        description TEXT NOT NULL,
        due_date TEXT NOT NULL,
        tasks_json JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        doc_type TEXT NOT NULL,
        number TEXT,
        is_locked BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'draft',
        client_id INTEGER NOT NULL,
        project_id INTEGER,
        language TEXT NOT NULL DEFAULT 'FR',
        currency TEXT NOT NULL DEFAULT 'MAD',
        exchange_rate_to_mad DOUBLE PRECISION NOT NULL DEFAULT 1,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        items_json JSONB NOT NULL,
        global_discount_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
        deposit_requested_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
        vat_mode TEXT NOT NULL,
        legal_mention TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        payment_terms TEXT NOT NULL,
        bank_account_key TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        subtotal DOUBLE PRECISION NOT NULL,
        discount_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_amount DOUBLE PRECISION NOT NULL,
        indicative_mad_amount DOUBLE PRECISION NOT NULL,
        timeline_json JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL,
        amount_currency DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL,
        amount_received_mad DOUBLE PRECISION NOT NULL,
        bank_fees_mad DOUBLE PRECISION NOT NULL DEFAULT 0,
        payment_date TEXT NOT NULL,
        method TEXT NOT NULL,
        reference TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    schemaEnsured = true;
  }

  const existingSettings = await db.select().from(businessSettings);
  if (existingSettings.length > 0) {
    await ensureDashboardSampleData();
    return;
  }

  await db.insert(businessSettings).values({
    fullName: "Youssef El Amrani (Exemple)",
    tradeName: "Atelier Zellige Numérique — Auto-Entrepreneur (Exemple)",
    activityLabel: "Conseil en design produit & ingénierie logicielle",
    activityCategory: "services",
    ice: "000000000000099 (Exemple)",
    autoEntrepreneurNumber: "AE-2026-009841 (Exemple)",
    identifiantFiscal: "IF-50991234 (Exemple)",
    taxeProfessionnelle: "TP-34900112 (Exemple)",
    address: "48 Bd d'Anfa, Quartier Gautier (Exemple)",
    city: "Casablanca 20060",
    country: "Maroc",
    email: "youssef.sample@atelier-exemple.ma",
    phone: "+212 6 00 00 00 99",
    annualCeilingMad: 200000,
    bankAccountsJson: [
      {
        key: "mad_rib",
        currency: "MAD",
        bankName: "Banque Atlantique Maroc (Exemple)",
        label: "Compte professionnel MAD (RIB 24 chiffres)",
        ribOrIban: "230 780 0000123456789000 44 (Exemple)",
        swiftBic: "BAMMAMCXXXX",
        accountHolder: "Youssef El Amrani (Exemple)",
      },
      {
        key: "eur_iban",
        currency: "EUR",
        bankName: "Compte Devises Export EUR (Exemple)",
        label: "IBAN Zone SEPA / Export Services",
        ribOrIban: "MA64 2307 8000 0098 7654 3210 0088 (Exemple)",
        swiftBic: "BAMMAMCXXXX",
        accountHolder: "Youssef El Amrani (Exemple)",
      },
      {
        key: "chf_iban",
        currency: "CHF",
        bankName: "Correspondant International CHF (Exemple)",
        label: "IBAN Virement International CHF",
        ribOrIban: "CH93 0000 0000 1234 5678 9 (Exemple)",
        swiftBic: "POFICHBEXXX",
        accountHolder: "Youssef El Amrani (Exemple)",
      },
      {
        key: "usd_iban",
        currency: "USD",
        bankName: "Compte Devises Export USD (Exemple)",
        label: "IBAN / SWIFT International USD",
        ribOrIban: "MA64 2307 8000 0055 4433 2211 0019 (Exemple)",
        swiftBic: "BAMMAMCXXXX",
        accountHolder: "Youssef El Amrani (Exemple)",
      },
    ],
    numberingJson: {
      devis: { prefix: "DEV", year: 2026, nextCounter: 15, padding: 4 },
      proforma: { prefix: "PRO", year: 2026, nextCounter: 6, padding: 4 },
      facture: { prefix: "FAC", year: 2026, nextCounter: 19, padding: 4 },
      acompte: { prefix: "ACO", year: 2026, nextCounter: 5, padding: 4 },
      avoir: { prefix: "AVO", year: 2026, nextCounter: 3, padding: 4 },
    },
    legalMentionsJson: {
      maFr: "TVA non applicable — Régime de l'Auto-Entrepreneur (Article 89-I-12° du Code Général des Impôts marocain). Dispense d'inscription au Registre du Commerce.",
      exportFr:
        "Prestation de services à l'export exonérée / hors champ de TVA marocaine (Article 92-I-1° du CGI). Règlement par virement international.",
      maEn: "VAT not applicable — Moroccan Auto-Entrepreneur tax regime (Article 89-I-12° of the Moroccan General Tax Code).",
      exportEn:
        "Export of digital services exempt from Moroccan VAT pursuant to Article 92-I-1° of the Moroccan General Tax Code.",
      maAr: "غير خاضع للضريبة على القيمة المضافة — نظام المقاول الذاتي طبقاً للمادة 89-I-12° من المدونة العامة للضرائب بالمغرب.",
      exportAr:
        "تصدير خدمات رقمية معفى من الضريبة على القيمة المضافة المغربية طبقاً للمادة 92-I-1° من المدونة العامة للضرائب.",
    },
    emailTemplatesJson: {
      fr: "Bonjour {client}, veuillez trouver ci-joint votre document {numero} d'un montant de {montant}. Cordialement,",
      en: "Hello {client}, please find attached document {numero} for a total of {montant}. Best regards,",
      ar: "مرحباً {client}، تجدون رفقته الوثيقة رقم {numero} بمبلغ إجمالي قدره {montant}. مع خالص التحيات،",
    },
    signatureName: "Youssef El Amrani (Exemple)",
    signatureRole: "Auto-Entrepreneur • Casablanca",
  });

  const insertedClients = await db
    .insert(clients)
    .values([
      {
        name: "Koutoubia Logistique SARL (Exemple)",
        contactName: "Salma Berrada (Exemple)",
        clientType: "company_ma",
        countryCode: "MA",
        countryName: "Maroc",
        city: "Casablanca",
        address: "112 Bd Zerktouni, Maarif, Casablanca (Exemple)",
        email: "compta@koutoubia-sample.ma",
        iceOrTaxId: "001599000012388 (Exemple)",
        taxIdLabel: "ICE",
        preferredLanguage: "FR",
        defaultCurrency: "MAD",
        notes: "Client récurrent au Maroc — règlement à 30 jours par virement RIB (Exemple).",
      },
      {
        name: "Maison Lumière Digital SAS (Exemple)",
        contactName: "Claire Moreau (Exemple)",
        clientType: "company_intl",
        countryCode: "FR",
        countryName: "France",
        city: "Paris",
        address: "24 Rue du Faubourg Saint-Martin, 75010 Paris (Exemple)",
        email: "finance@maisonlumiere-sample.fr",
        iceOrTaxId: "FR 44 899000112 (Exemple)",
        taxIdLabel: "TVA Intracom.",
        preferredLanguage: "FR",
        defaultCurrency: "EUR",
        notes: "Mission d'accompagnement UX/Design System facturée en EUR (Exemple).",
      },
      {
        name: "Helvetia Horlogerie Lab Sàrl (Exemple)",
        contactName: "Marc-Antoine Rochat (Exemple)",
        clientType: "company_intl",
        countryCode: "CH",
        countryName: "Suisse",
        city: "Genève",
        address: "Rue du Rhône 62, 1204 Genève (Exemple)",
        email: "ap@helvetialab-sample.ch",
        iceOrTaxId: "CHE-119.000.882 (Exemple)",
        taxIdLabel: "IDE / UID",
        preferredLanguage: "FR",
        defaultCurrency: "CHF",
        notes: "Facturation en CHF par virement SWIFT, frais partagés SHA (Exemple).",
      },
      {
        name: "Northstar Cloud Systems Inc. (Exemple)",
        contactName: "Hannah Brooks (Exemple)",
        clientType: "company_intl",
        countryCode: "US",
        countryName: "États-Unis",
        city: "Austin, TX",
        address: "600 Congress Ave, Suite 1400, Austin TX (Exemple)",
        email: "billing@northstar-sample.example",
        iceOrTaxId: "EIN 98-0004129 (Exemple)",
        taxIdLabel: "EIN",
        preferredLanguage: "EN",
        defaultCurrency: "USD",
        notes: "English PDF invoices in USD settled via international wire (Sample).",
      },
      {
        name: "شركة الأطلس للابتكار ش.م.م (نموذج)",
        contactName: "كريم المنصوري (نموذج)",
        clientType: "company_ma",
        countryCode: "MA",
        countryName: "المغرب",
        city: "الرباط",
        address: "شارع النخيل، حي الرياض، الرباط (نموذج)",
        email: "admin@atlas-arabic-sample.ma",
        iceOrTaxId: "002881000045601 (نموذج)",
        taxIdLabel: "ICE",
        preferredLanguage: "AR",
        defaultCurrency: "MAD",
        notes: "عميل يفضل استلام عروض الأثمان والفواتير باللغة العربية (نموذج).",
      },
    ])
    .returning();

  await db.insert(servicesCatalog).values([
    {
      code: "SRV-UX-01",
      titleFr: "Audit UX & Architecture d'interface (Exemple)",
      titleEn: "Product UX Audit & Interface Architecture (Sample)",
      titleAr: "تدقيق تجربة المستخدم وهندسة الواجهات (نموذج)",
      description: "Revue ergonomique, parcours critiques et recommandations priorisées.",
      unit: "jour",
      unitPriceMad: 4200,
      category: "Design Produit",
    },
    {
      code: "SRV-DS-02",
      titleFr: "Conception Design System & Composants UI (Exemple)",
      titleEn: "Design System Tokens & UI Component Library (Sample)",
      titleAr: "تصميم نظام الهوية البصرية ومكونات الواجهة (نموذج)",
      description: "Tokens typographiques, couleurs AA, états interactifs et documentation.",
      unit: "forfait",
      unitPriceMad: 16500,
      category: "Design System",
    },
    {
      code: "SRV-FE-03",
      titleFr: "Intégration Front-end & Prototypage Haute Fidélité (Exemple)",
      titleEn: "Front-end Engineering & High-Fidelity Prototyping (Sample)",
      titleAr: "تطوير الواجهات الأمامية والنماذج التفاعلية (نموذج)",
      description: "Développement accessible conforme WCAG AA et support RTL/LTR.",
      unit: "jour",
      unitPriceMad: 4500,
      category: "Ingénierie",
    },
    {
      code: "SRV-AC-04",
      titleFr: "Atelier Cadrage Produit & Spécifications (Exemple)",
      titleEn: "Product Discovery Workshop & Functional Spec (Sample)",
      titleAr: "ورشة تأطير المنتج ودفتر التحملات الوظيفي (نموذج)",
      description: "Animation d'atelier client et rédaction du cahier fonctionnel.",
      unit: "heure",
      unitPriceMad: 650,
      category: "Conseil",
    },
  ]);

  const insertedProjects = await db
    .insert(projects)
    .values([
      {
        code: "PRJ-2026-01",
        name: "Refonte Portail Client B2B — Maison Lumière (Exemple)",
        clientId: insertedClients[1].id,
        status: "active",
        currency: "EUR",
        budgetAmount: 5400,
        description:
          "Mission de refonte complète de l'espace client, système de design bilingue et prototypes desktop/mobile (Exemple).",
        dueDate: "2026-04-30",
        tasksJson: [
          {
            id: "tsk-1",
            title: "Audit parcours client & architecture d'information (Exemple)",
            unit: "jour",
            quantity: 3,
            unitPrice: 550,
            completed: true,
          },
          {
            id: "tsk-2",
            title: "Bibliothèque de composants UI & tokens accessibles AA (Exemple)",
            unit: "forfait",
            quantity: 1,
            unitPrice: 2200,
            completed: true,
          },
          {
            id: "tsk-3",
            title: "Maquettes haute fidélité Desktop & Mobile + recette (Exemple)",
            unit: "jour",
            quantity: 3,
            unitPrice: 550,
            completed: false,
          },
        ],
      },
      {
        code: "PRJ-2026-02",
        name: "Application Suivi Flotte — Koutoubia Logistique (Exemple)",
        clientId: insertedClients[0].id,
        status: "active",
        currency: "MAD",
        budgetAmount: 38000,
        description:
          "Conception des tableaux de bord opérationnels et écrans chauffeurs mobiles (Exemple).",
        dueDate: "2026-05-15",
        tasksJson: [
          {
            id: "tsk-21",
            title: "Atelier cadrage métier à Casablanca (Exemple)",
            unit: "jour",
            quantity: 2,
            unitPrice: 4000,
            completed: true,
          },
          {
            id: "tsk-22",
            title: "Maquettes écrans dispatch & suivi temps réel (Exemple)",
            unit: "forfait",
            quantity: 1,
            unitPrice: 18500,
            completed: true,
          },
          {
            id: "tsk-23",
            title: "Tests utilisateurs terrain & ajustements finaux (Exemple)",
            unit: "jour",
            quantity: 3,
            unitPrice: 3800,
            completed: false,
          },
        ],
      },
      {
        code: "PRJ-2026-03",
        name: "Design Configurateur Horloger — Helvetia Lab (Exemple)",
        clientId: insertedClients[2].id,
        status: "proposal",
        currency: "CHF",
        budgetAmount: 4200,
        description:
          "Conception de l'interface de personnalisation horlogère haute précision (Exemple).",
        dueDate: "2026-06-10",
        tasksJson: [
          {
            id: "tsk-31",
            title: "Direction artistique UI & maquettes configurateur (Exemple)",
            unit: "forfait",
            quantity: 1,
            unitPrice: 2800,
            completed: false,
          },
          {
            id: "tsk-32",
            title: "Spécifications d'interactions micro-animations (Exemple)",
            unit: "jour",
            quantity: 2,
            unitPrice: 700,
            completed: false,
          },
        ],
      },
    ])
    .returning();

  const insertedDocs = await db
    .insert(documents)
    .values([
      {
        docType: "facture",
        number: "FAC-2026-0018",
        isLocked: true,
        status: "sent",
        clientId: insertedClients[1].id,
        projectId: insertedProjects[0].id,
        language: "FR",
        currency: "EUR",
        exchangeRateToMad: 10.8,
        issueDate: "2026-03-04",
        dueDate: "2026-04-03",
        itemsJson: [
          {
            id: "ln-1",
            designation: "Audit parcours client & architecture d'information (Exemple)",
            quantity: 3,
            unit: "jour",
            unitPrice: 550,
            discountPct: 0,
          },
          {
            id: "ln-2",
            designation: "Bibliothèque de composants UI & tokens accessibles AA (Exemple)",
            quantity: 1,
            unit: "forfait",
            unitPrice: 2200,
            discountPct: 0,
          },
          {
            id: "ln-3",
            designation: "Maquettes haute fidélité Desktop & Mobile (Exemple)",
            quantity: 2,
            unit: "jour",
            unitPrice: 550,
            discountPct: 5,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "export_hors_champ",
        legalMention:
          "Prestation de services à l'export exonérée / hors champ de TVA marocaine (Article 92-I-1° du CGI).",
        paymentMethod: "Virement international SEPA / SWIFT",
        paymentTerms: "30 jours nets",
        bankAccountKey: "eur_iban",
        notes: "Merci d'indiquer la référence FAC-2026-0018 lors du virement (Exemple).",
        subtotal: 4895,
        discountAmount: 0,
        totalAmount: 4895,
        indicativeMadAmount: 52866,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "04 mars 2026 • 09:42", done: true },
          { step: "sent", labelFr: "Envoyé par e-mail au client", timestamp: "04 mars 2026 • 09:45", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "05 mars 2026 • 14:18", done: true },
          { step: "paid", labelFr: "Règlement complet reçu", timestamp: null, done: false },
        ],
      },
      {
        docType: "facture",
        number: "FAC-2026-0017",
        isLocked: true,
        status: "paid",
        clientId: insertedClients[0].id,
        projectId: insertedProjects[1].id,
        language: "FR",
        currency: "MAD",
        exchangeRateToMad: 1,
        issueDate: "2026-02-12",
        dueDate: "2026-03-14",
        itemsJson: [
          {
            id: "ln-10",
            designation: "Atelier cadrage métier & architecture écrans (Exemple)",
            quantity: 2,
            unit: "jour",
            unitPrice: 4000,
            discountPct: 0,
          },
          {
            id: "ln-11",
            designation: "Maquettes écrans dispatch & suivi flotte (Exemple)",
            quantity: 1,
            unit: "forfait",
            unitPrice: 36000,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "franchise_ae",
        legalMention:
          "TVA non applicable — Régime de l'Auto-Entrepreneur (Article 89-I-12° du CGI).",
        paymentMethod: "Virement bancaire RIB Maroc",
        paymentTerms: "30 jours date de facture",
        bankAccountKey: "mad_rib",
        notes: "Facture soldée intégralement par virement national (Exemple).",
        subtotal: 44000,
        discountAmount: 0,
        totalAmount: 44000,
        indicativeMadAmount: 44000,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "12 févr. 2026 • 10:15", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "12 févr. 2026 • 10:20", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "12 févr. 2026 • 16:05", done: true },
          { step: "paid", labelFr: "Payé (44 000,00 MAD reçus)", timestamp: "26 févr. 2026 • 11:30", done: true },
        ],
      },
      {
        docType: "facture",
        number: "FAC-2026-0016",
        isLocked: true,
        status: "paid",
        clientId: insertedClients[3].id,
        projectId: null,
        language: "EN",
        currency: "USD",
        exchangeRateToMad: 9.95,
        issueDate: "2026-01-18",
        dueDate: "2026-02-17",
        itemsJson: [
          {
            id: "ln-20",
            designation: "Product Design Sprint & Design System Architecture (Sample)",
            quantity: 1,
            unit: "forfait",
            unitPrice: 5800,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "export_hors_champ",
        legalMention:
          "Export of digital services exempt from Moroccan VAT pursuant to Article 92-I-1° of the CGI.",
        paymentMethod: "International SWIFT Wire",
        paymentTerms: "Net 30 days",
        bankAccountKey: "usd_iban",
        notes: "Sample USD export invoice settled in MAD on local account.",
        subtotal: 5800,
        discountAmount: 0,
        totalAmount: 5800,
        indicativeMadAmount: 57710,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "18 janv. 2026 • 15:00", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "18 janv. 2026 • 15:08", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "19 janv. 2026 • 09:12", done: true },
          { step: "paid", labelFr: "Payé (57 420,00 MAD reçus)", timestamp: "03 févr. 2026 • 17:40", done: true },
        ],
      },
      {
        docType: "acompte",
        number: "ACO-2026-0004",
        isLocked: true,
        status: "paid",
        clientId: insertedClients[2].id,
        projectId: insertedProjects[2].id,
        language: "FR",
        currency: "CHF",
        exchangeRateToMad: 11.35,
        issueDate: "2026-02-02",
        dueDate: "2026-02-16",
        itemsJson: [
          {
            id: "ln-30",
            designation: "Acompte de 40% au démarrage — Configurateur Horloger (Exemple)",
            quantity: 1,
            unit: "forfait",
            unitPrice: 3650,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 40,
        vatMode: "export_hors_champ",
        legalMention:
          "Prestation de services à l'export exonérée de TVA marocaine (Article 92-I-1° du CGI).",
        paymentMethod: "Virement SWIFT CHF",
        paymentTerms: "À réception",
        bankAccountKey: "chf_iban",
        notes: "Facture d'acompte de 40% réglée avant lancement (Exemple).",
        subtotal: 3650,
        discountAmount: 0,
        totalAmount: 3650,
        indicativeMadAmount: 41427.5,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "02 févr. 2026 • 09:00", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "02 févr. 2026 • 09:05", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "02 févr. 2026 • 11:22", done: true },
          { step: "paid", labelFr: "Payé (41 380,00 MAD reçus)", timestamp: "10 févr. 2026 • 14:15", done: true },
        ],
      },
      {
        docType: "facture",
        number: "FAC-2026-0015",
        isLocked: true,
        status: "overdue",
        clientId: insertedClients[0].id,
        projectId: null,
        language: "FR",
        currency: "MAD",
        exchangeRateToMad: 1,
        issueDate: "2026-01-20",
        dueDate: "2026-02-20",
        itemsJson: [
          {
            id: "ln-40",
            designation: "Maintenance évolutive composants UI — T1 (Exemple)",
            quantity: 3,
            unit: "jour",
            unitPrice: 4200,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "franchise_ae",
        legalMention:
          "TVA non applicable — Régime de l'Auto-Entrepreneur (Article 89-I-12° du CGI).",
        paymentMethod: "Virement bancaire RIB Maroc",
        paymentTerms: "30 jours nets",
        bankAccountKey: "mad_rib",
        notes: "Relance cordiale programmée (Exemple).",
        subtotal: 12600,
        discountAmount: 0,
        totalAmount: 12600,
        indicativeMadAmount: 12600,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "20 janv. 2026 • 11:00", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "20 janv. 2026 • 11:10", done: true },
          { step: "viewed", labelFr: "Consulté par le client", timestamp: "22 janv. 2026 • 10:04", done: true },
          { step: "paid", labelFr: "En attente de règlement", timestamp: null, done: false },
        ],
      },
      {
        docType: "devis",
        number: "DEV-2026-0014",
        isLocked: true,
        status: "accepted",
        clientId: insertedClients[4].id,
        projectId: null,
        language: "AR",
        currency: "MAD",
        exchangeRateToMad: 1,
        issueDate: "2026-03-06",
        dueDate: "2026-04-06",
        itemsJson: [
          {
            id: "ln-50",
            designation: "تصميم نظام الهوية البصرية ومكونات الواجهة (نموذج)",
            quantity: 1,
            unit: "forfait",
            unitPrice: 18500,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 30,
        vatMode: "franchise_ae",
        legalMention:
          "غير خاضع للضريبة على القيمة المضافة — نظام المقاول الذاتي طبقاً للمادة 89-I-12° من المدونة العامة للضرائب بالمغرب.",
        paymentMethod: "تحويل بنكي وطني (RIB)",
        paymentTerms: "تسبيق 30% عند الطلب",
        bankAccountKey: "mad_rib",
        notes: "عرض أثمان صالح لمدة 30 يوماً (نموذج).",
        subtotal: 18500,
        discountAmount: 0,
        totalAmount: 18500,
        indicativeMadAmount: 18500,
        timelineJson: [
          { step: "created", labelFr: "Créé et numéroté", timestamp: "06 mars 2026 • 14:20", done: true },
          { step: "sent", labelFr: "Envoyé au client", timestamp: "06 mars 2026 • 14:25", done: true },
          { step: "viewed", labelFr: "En attente d'acceptation", timestamp: null, done: false },
          { step: "paid", labelFr: "Conversion en facture", timestamp: null, done: false },
        ],
      },
      {
        docType: "proforma",
        number: null,
        isLocked: false,
        status: "draft",
        clientId: insertedClients[1].id,
        projectId: insertedProjects[0].id,
        language: "FR",
        currency: "EUR",
        exchangeRateToMad: 10.8,
        issueDate: "2026-03-08",
        dueDate: "2026-04-08",
        itemsJson: [
          {
            id: "ln-60",
            designation: "Phase 2 — Tests d'accessibilité WCAG AA & support lancement (Exemple)",
            quantity: 4,
            unit: "jour",
            unitPrice: 550,
            discountPct: 0,
          },
        ],
        globalDiscountPct: 0,
        depositRequestedPct: 0,
        vatMode: "export_hors_champ",
        legalMention:
          "Prestation de services à l'export exonérée de TVA marocaine (Article 92-I-1° du CGI).",
        paymentMethod: "Virement SEPA / SWIFT",
        paymentTerms: "À réception",
        bankAccountKey: "eur_iban",
        notes: "Brouillon proforma avant validation client (Exemple).",
        subtotal: 2200,
        discountAmount: 0,
        totalAmount: 2200,
        indicativeMadAmount: 23760,
        timelineJson: [
          { step: "created", labelFr: "Brouillon enregistré", timestamp: "08 mars 2026 • 16:10", done: true },
          { step: "sent", labelFr: "Émission en attente", timestamp: null, done: false },
          { step: "viewed", labelFr: "Consultation client", timestamp: null, done: false },
          { step: "paid", labelFr: "Règlement", timestamp: null, done: false },
        ],
      },
    ])
    .returning();

  // Seed MAD-received payments matching our paid documents (total = 142,800 MAD!)
  await db.insert(payments).values([
    {
      documentId: insertedDocs[2].id, // FAC-2026-0016 (5,800 USD)
      amountCurrency: 5800,
      currency: "USD",
      amountReceivedMad: 57420,
      bankFeesMad: 290,
      paymentDate: "2026-02-03",
      method: "Virement SWIFT USD",
      reference: "SWF-US-9920148-SAMPLE",
      notes: "Crédit net en MAD sur relevé bancaire après commission de change (Exemple).",
    },
    {
      documentId: insertedDocs[3].id, // ACO-2026-0004 (3,650 CHF)
      amountCurrency: 3650,
      currency: "CHF",
      amountReceivedMad: 41380,
      bankFeesMad: 185,
      paymentDate: "2026-02-10",
      method: "Virement SWIFT CHF",
      reference: "SWF-CH-4481029-SAMPLE",
      notes: "Acompte 40% crédité en dirhams marocains (Exemple).",
    },
    {
      documentId: insertedDocs[1].id, // FAC-2026-0017 (44,000 MAD)
      amountCurrency: 44000,
      currency: "MAD",
      amountReceivedMad: 44000,
      bankFeesMad: 0,
      paymentDate: "2026-06-26",
      method: "Virement national RIB",
      reference: "VIR-MA-7741200-SAMPLE",
      notes: "Virement national sans frais de change (Exemple).",
    },
  ]);

  await ensureDashboardSampleData();
}
