import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  doublePrecision,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export interface BankAccountConfig {
  key: string;
  currency: "MAD" | "EUR" | "CHF" | "USD";
  bankName: string;
  label: string;
  ribOrIban: string;
  swiftBic: string;
  accountHolder: string;
}

export interface NumberingRule {
  prefix: string;
  year: number;
  nextCounter: number;
  padding: number;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  unit: "jour" | "heure" | "forfait" | "unité";
  quantity: number;
  unitPrice: number;
  completed: boolean;
}

export interface DocumentLineItem {
  id: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: "jour" | "heure" | "forfait" | "unité";
  unitPrice: number;
  discountPct: number;
}

export interface DocumentTimelineStep {
  step: "created" | "sent" | "viewed" | "paid";
  labelFr: string;
  timestamp: string | null;
  done: boolean;
}

export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  tradeName: text("trade_name").notNull(),
  activityLabel: text("activity_label").notNull(),
  activityCategory: text("activity_category").notNull(), // 'services' | 'commercial'
  ice: text("ice").notNull(),
  autoEntrepreneurNumber: text("auto_entrepreneur_number").notNull(),
  identifiantFiscal: text("identifiant_fiscal").notNull(),
  taxeProfessionnelle: text("taxe_professionnelle").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  annualCeilingMad: doublePrecision("annual_ceiling_mad").notNull().default(200000),
  bankAccountsJson: jsonb("bank_accounts_json").$type<BankAccountConfig[]>().notNull(),
  numberingJson: jsonb("numbering_json")
    .$type<Record<"devis" | "proforma" | "facture" | "acompte" | "avoir", NumberingRule>>()
    .notNull(),
  legalMentionsJson: jsonb("legal_mentions_json")
    .$type<{
      maFr: string;
      exportFr: string;
      maEn: string;
      exportEn: string;
      maAr: string;
      exportAr: string;
    }>()
    .notNull(),
  emailTemplatesJson: jsonb("email_templates_json")
    .$type<{ fr: string; en: string; ar: string }>()
    .notNull(),
  signatureName: text("signature_name").notNull(),
  signatureRole: text("signature_role").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name").notNull(),
  clientType: text("client_type").notNull(), // 'company_ma' | 'company_intl' | 'individual'
  countryCode: text("country_code").notNull(), // 'MA' | 'FR' | 'CH' | 'US' | 'GB'
  countryName: text("country_name").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  email: text("email").notNull(),
  iceOrTaxId: text("ice_or_tax_id").notNull(),
  taxIdLabel: text("tax_id_label").notNull(), // 'ICE' | 'TVA Intracom.' | 'IDE / UID' | 'EIN' | 'CIN'
  preferredLanguage: text("preferred_language").notNull().default("FR"), // 'FR' | 'EN' | 'AR'
  defaultCurrency: text("default_currency").notNull().default("MAD"), // 'MAD' | 'EUR' | 'CHF' | 'USD'
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servicesCatalog = pgTable("services_catalog", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull().default("jour"),
  unitPriceMad: doublePrecision("unit_price_mad").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  clientId: integer("client_id").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'proposal' | 'completed'
  currency: text("currency").notNull().default("MAD"),
  budgetAmount: doublePrecision("budget_amount").notNull(),
  description: text("description").notNull(),
  dueDate: text("due_date").notNull(),
  tasksJson: jsonb("tasks_json").$type<ProjectTaskItem[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  docType: text("doc_type").notNull(), // 'devis' | 'proforma' | 'facture' | 'acompte' | 'avoir'
  number: text("number"), // null for drafts ("Attribué à l'émission"), locked sequential string when issued
  isLocked: boolean("is_locked").notNull().default(false),
  status: text("status").notNull().default("draft"), // 'draft' | 'sent' | 'pending' | 'paid' | 'overdue'
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"),
  language: text("language").notNull().default("FR"), // 'FR' | 'EN' | 'AR'
  currency: text("currency").notNull().default("MAD"), // 'MAD' | 'EUR' | 'CHF' | 'USD'
  exchangeRateToMad: doublePrecision("exchange_rate_to_mad").notNull().default(1),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  itemsJson: jsonb("items_json").$type<DocumentLineItem[]>().notNull(),
  globalDiscountPct: doublePrecision("global_discount_pct").notNull().default(0),
  depositRequestedPct: doublePrecision("deposit_requested_pct").notNull().default(0),
  vatMode: text("vat_mode").notNull(), // 'franchise_ae' | 'export_hors_champ'
  legalMention: text("legal_mention").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentTerms: text("payment_terms").notNull(),
  bankAccountKey: text("bank_account_key").notNull(),
  notes: text("notes").notNull().default(""),
  subtotal: doublePrecision("subtotal").notNull(),
  discountAmount: doublePrecision("discount_amount").notNull().default(0),
  totalAmount: doublePrecision("total_amount").notNull(),
  indicativeMadAmount: doublePrecision("indicative_mad_amount").notNull(),
  timelineJson: jsonb("timeline_json").$type<DocumentTimelineStep[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  amountCurrency: doublePrecision("amount_currency").notNull(),
  currency: text("currency").notNull(),
  amountReceivedMad: doublePrecision("amount_received_mad").notNull(),
  bankFeesMad: doublePrecision("bank_fees_mad").notNull().default(0),
  paymentDate: text("payment_date").notNull(),
  method: text("method").notNull(),
  reference: text("reference").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
