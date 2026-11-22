"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  FolderKanban,
  Hash,
  Lock,
  Mail,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Globe,
} from "lucide-react";
import {
  CountryFlag,
  CURRENCY_META,
  DOC_TYPE_META,
  formatAmount,
  NotchedField,
  type CurrencyCode,
  type DocLang,
  type DocTypeCode,
} from "@/components/BrandPrimitives";
import {
  DocumentPaperPreview,
  type PreviewDocumentData,
} from "@/components/DocumentPaperPreview";
import type {
  BankAccountConfig,
  DocumentLineItem,
} from "@/db/schema";

interface ClientRecord {
  id: number;
  name: string;
  contactName: string;
  clientType: string;
  countryCode: string;
  countryName: string;
  city: string;
  address: string;
  email: string;
  iceOrTaxId: string;
  taxIdLabel: string;
  preferredLanguage: string;
  defaultCurrency: string;
}

interface ProjectRecord {
  id: number;
  code: string;
  name: string;
  clientId: number;
  currency: string;
  tasksJson: {
    id: string;
    title: string;
    unit: "jour" | "heure" | "forfait" | "unité";
    quantity: number;
    unitPrice: number;
    completed: boolean;
  }[];
}

interface CatalogRecord {
  id: number;
  code: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  unit: string;
  unitPriceMad: number;
}

interface SettingsRecord {
  fullName: string;
  tradeName: string;
  address: string;
  city: string;
  ice: string;
  autoEntrepreneurNumber: string;
  identifiantFiscal: string;
  email: string;
  signatureName: string;
  signatureRole: string;
  bankAccountsJson: BankAccountConfig[];
  numberingJson: Record<
    DocTypeCode,
    { prefix: string; year: number; nextCounter: number; padding: number }
  >;
  legalMentionsJson: {
    maFr: string;
    exportFr: string;
    maEn: string;
    exportEn: string;
    maAr: string;
    exportAr: string;
  };
}

export interface InitialComposerPreset {
  docType?: DocTypeCode;
  clientId?: number;
  projectId?: number | null;
  currency?: CurrencyCode;
  language?: DocLang;
  items?: DocumentLineItem[];
  openConfirmModal?: boolean;
  forceRtlChrome?: boolean;
  forceValidationError?: boolean;
}

export function ScreenCreateDocument({
  settings,
  clients,
  projects,
  catalog,
  preset,
  onDocumentSaved,
}: {
  settings: SettingsRecord;
  clients: ClientRecord[];
  projects: ProjectRecord[];
  catalog: CatalogRecord[];
  preset?: InitialComposerPreset;
  onDocumentSaved: (newState: unknown, issuedNumber?: string | null) => void;
}) {
  const defaultClient =
    clients.find((c) =>
      preset?.forceRtlChrome ? c.preferredLanguage === "AR" : c.countryCode === "FR"
    ) || clients[0];

  const [docType, setDocType] = useState<DocTypeCode>(preset?.docType || "facture");
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<"pdf" | "email">("pdf");
  const [rtlChrome, setRtlChrome] = useState<boolean>(Boolean(preset?.forceRtlChrome));

  const [selectedClientId, setSelectedClientId] = useState<number>(
    preset?.clientId || defaultClient?.id || 1
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">(
    preset?.projectId ?? (projects[0]?.id || "")
  );
  const [language, setLanguage] = useState<DocLang>(
    preset?.forceRtlChrome ? "AR" : preset?.language || "FR"
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    preset?.forceRtlChrome
      ? "MAD"
      : preset?.currency || ((defaultClient?.defaultCurrency as CurrencyCode) ?? "EUR")
  );
  const [exchangeRateToMad, setExchangeRateToMad] = useState<number>(
    preset?.forceRtlChrome ? 1 : 10.8
  );
  const [issueDate, setIssueDate] = useState<string>("2026-03-10");
  const [dueDate, setDueDate] = useState<string>("2026-04-09");

  const [items, setItems] = useState<DocumentLineItem[]>(
    preset?.items ||
      (preset?.forceRtlChrome
        ? [
            {
              id: "ar-1",
              designation: "تصميم نظام الهوية البصرية ومكونات الواجهة (نموذج)",
              quantity: 1,
              unit: "forfait",
              unitPrice: 16500,
              discountPct: 0,
            },
            {
              id: "ar-2",
              designation: "تدقيق تجربة المستخدم وهندسة الواجهات (نموذج)",
              quantity: 3,
              unit: "jour",
              unitPrice: 4200,
              discountPct: 0,
            },
          ]
        : [
            {
              id: "it-1",
              designation: "Architecture Design System & Tokens UI AA (Exemple)",
              quantity: 1,
              unit: "forfait",
              unitPrice: 2200,
              discountPct: 0,
            },
            {
              id: "it-2",
              designation: "Maquettes haute fidélité Desktop & Mobile (Exemple)",
              quantity: 4,
              unit: "jour",
              unitPrice: 550,
              discountPct: 5,
            },
          ])
  );

  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [enableGlobalDiscount, setEnableGlobalDiscount] = useState<boolean>(false);
  const [globalDiscountPct, setGlobalDiscountPct] = useState<number>(5);
  const [depositRequestedPct, setDepositRequestedPct] = useState<number>(30);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === Number(selectedClientId)) || clients[0],
    [clients, selectedClientId]
  );

  const isExportClient = selectedClient?.countryCode !== "MA";
  const [vatMode, setVatMode] = useState<"franchise_ae" | "export_hors_champ">(
    isExportClient ? "export_hors_champ" : "franchise_ae"
  );

  const computedLegalMention = useMemo(() => {
    const m = settings.legalMentionsJson;
    if (language === "AR") {
      return vatMode === "export_hors_champ" ? m.exportAr : m.maAr;
    }
    if (language === "EN") {
      return vatMode === "export_hors_champ" ? m.exportEn : m.maEn;
    }
    return vatMode === "export_hors_champ" ? m.exportFr : m.maFr;
  }, [language, settings.legalMentionsJson, vatMode]);

  const [customLegalMention, setCustomLegalMention] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    preset?.forceRtlChrome ? "تحويل بنكي وطني (RIB)" : "Virement bancaire SEPA / SWIFT"
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    preset?.forceRtlChrome ? "30 يوماً من تاريخ الفاتورة" : "30 jours nets"
  );
  const [notes, setNotes] = useState<string>(
    preset?.forceRtlChrome
      ? "وثيقة نموذجية تجريبية — جميع البيانات المعروضة افتراضية (نموذج)."
      : "Merci d'indiquer le numéro de document en référence de virement (Exemple)."
  );
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(
    Boolean(preset?.openConfirmModal)
  );
  const [validationTriggered, setValidationTriggered] = useState<boolean>(
    Boolean(preset?.forceValidationError)
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Match bank account automatically to currency
  const matchedBankAccount = useMemo(
    () =>
      settings.bankAccountsJson.find((b) => b.currency === currency) ||
      settings.bankAccountsJson[0],
    [currency, settings.bankAccountsJson]
  );

  const nextNumberPreview = useMemo(() => {
    const rule = settings.numberingJson[docType] || {
      prefix: "FAC",
      year: 2026,
      nextCounter: 19,
      padding: 4,
    };
    return `${rule.prefix}-${rule.year}-${String(rule.nextCounter).padStart(
      rule.padding,
      "0"
    )}`;
  }, [docType, settings.numberingJson]);

  const handleClientChange = (newClientId: number) => {
    setSelectedClientId(newClientId);
    const found = clients.find((c) => c.id === newClientId);
    if (found) {
      const nextCurr = (found.defaultCurrency as CurrencyCode) || "MAD";
      setCurrency(nextCurr);
      setExchangeRateToMad(CURRENCY_META[nextCurr].defaultRateToMad);
      const nextLang = (found.preferredLanguage as DocLang) || "FR";
      setLanguage(nextLang);
      setRtlChrome(nextLang === "AR");
      setVatMode(found.countryCode === "MA" ? "franchise_ae" : "export_hors_champ");
    }
  };

  const handleCurrencyChange = (nextCurr: CurrencyCode) => {
    setCurrency(nextCurr);
    setExchangeRateToMad(CURRENCY_META[nextCurr].defaultRateToMad);
  };

  const handleLanguageChange = (nextLang: DocLang) => {
    setLanguage(nextLang);
    if (nextLang === "AR") {
      setRtlChrome(true);
    } else {
      setRtlChrome(false);
    }
  };

  const addBlankLine = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `ln-${Date.now()}`,
        designation:
          language === "AR"
            ? "خدمة استشارية إضافية (نموذج)"
            : "Atelier de suivi & recette fonctionnelle (Exemple)",
        quantity: 1,
        unit: "jour",
        unitPrice: currency === "MAD" ? 4000 : 500,
        discountPct: 0,
      },
    ]);
  };

  const importFromSelectedProject = () => {
    const proj =
      projects.find((p) => p.id === Number(selectedProjectId)) || projects[0];
    if (!proj) return;
    setItems(
      proj.tasksJson.map((t) => ({
        id: `imp-${t.id}-${Date.now()}`,
        designation: t.title,
        quantity: t.quantity,
        unit: t.unit,
        unitPrice: t.unitPrice,
        discountPct: 0,
      }))
    );
    setBannerFeedback(
      `${proj.tasksJson.length} lignes importées depuis « ${proj.name} ».`
    );
    setTimeout(() => setBannerFeedback(null), 4000);
  };

  const updateLine = (
    id: string,
    patch: Partial<DocumentLineItem>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeLine = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!issueDate) errs.issueDate = "La date d'émission est obligatoire.";
    if (!dueDate) errs.dueDate = "La date d'échéance est obligatoire.";
    if (dueDate && issueDate && dueDate < issueDate) {
      errs.dueDate = "L'échéance ne peut pas être antérieure à la date d'émission.";
    }
    items.forEach((it, idx) => {
      if (!it.designation.trim()) {
        errs[`item_${idx}`] = "Veuillez saisir une désignation de prestation.";
      }
      if (Number(it.quantity) <= 0 || Number(it.unitPrice) <= 0) {
        errs[`item_price_${idx}`] = "La quantité et le prix unitaire doivent être > 0.";
      }
    });
    return errs;
  }, [dueDate, issueDate, items]);

  const hasValidationErrors =
    validationTriggered && Object.keys(validationErrors).length > 0;

  const persistDocument = async (issueNow: boolean) => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationTriggered(true);
      setConfirmModalOpen(false);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/facturo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_document",
          issueNow,
          docType,
          clientId: selectedClient.id,
          projectId: selectedProjectId || null,
          language,
          currency,
          exchangeRateToMad,
          issueDate,
          dueDate,
          items,
          globalDiscountPct: enableGlobalDiscount ? globalDiscountPct : 0,
          depositRequestedPct:
            docType === "devis" || docType === "acompte"
              ? depositRequestedPct
              : 0,
          vatMode,
          legalMention: customLegalMention || computedLegalMention,
          paymentMethod,
          paymentTerms,
          bankAccountKey: matchedBankAccount.key,
          notes,
        }),
      });
      const json = await res.json();
      setConfirmModalOpen(false);
      onDocumentSaved(json, json.assignedNumber);
      setBannerFeedback(
        issueNow
          ? `Document émis et verrouillé sous le numéro ${json.assignedNumber} !`
          : "Brouillon enregistré avec succès (sans attribution de numéro)."
      );
      setTimeout(() => setBannerFeedback(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const previewData: PreviewDocumentData = {
    docType,
    number: null,
    isLocked: false,
    language,
    currency,
    exchangeRateToMad,
    issueDate,
    dueDate,
    issuer: {
      fullName: settings.fullName,
      tradeName: settings.tradeName,
      address: settings.address,
      city: settings.city,
      ice: settings.ice,
      autoEntrepreneurNumber: settings.autoEntrepreneurNumber,
      identifiantFiscal: settings.identifiantFiscal,
      email: settings.email,
      signatureName: settings.signatureName,
      signatureRole: settings.signatureRole,
    },
    client: {
      name: selectedClient?.name || "Client (Exemple)",
      contactName: selectedClient?.contactName || "",
      address: selectedClient?.address || "",
      city: selectedClient?.city || "",
      countryCode: selectedClient?.countryCode || "MA",
      countryName: selectedClient?.countryName || "Maroc",
      iceOrTaxId: selectedClient?.iceOrTaxId || "",
      taxIdLabel: selectedClient?.taxIdLabel || "ICE",
      email: selectedClient?.email || "",
    },
    items,
    globalDiscountPct: enableGlobalDiscount ? globalDiscountPct : 0,
    depositRequestedPct:
      docType === "devis" || docType === "acompte" ? depositRequestedPct : 0,
    vatWording: computedLegalMention,
    legalMention: customLegalMention || computedLegalMention,
    paymentMethod,
    paymentTerms,
    bankAccount: matchedBankAccount,
    notes,
    showSignature,
  };

  const clientTypeBadgeLabel =
    selectedClient?.clientType === "company_ma"
      ? rtlChrome
        ? "شركة مغربية (ICE)"
        : "Société Maroc (ICE)"
      : selectedClient?.clientType === "company_intl"
      ? rtlChrome
        ? "عميل دولي (تصدير)"
        : "Client Export"
      : rtlChrome
      ? "فرد ذاتي"
      : "Particulier";

  return (
    <div
      dir={rtlChrome ? "rtl" : "ltr"}
      className={`flex h-full min-h-[820px] flex-col lg:flex-row ${
        rtlChrome ? "font-arabic" : ""
      }`}
    >
      {/* LEFT PANE: FORM */}
      <div
        className={`flex-1 bg-white px-6 py-5 lg:px-7 lg:py-6 ${
          showPreview
            ? rtlChrome
              ? "lg:max-w-[540px] lg:border-l lg:border-[#E3E6EC]"
              : "lg:max-w-[540px] lg:border-r lg:border-[#E3E6EC]"
            : "max-w-4xl mx-auto"
        }`}
      >
        {/* Breadcrumb + RTL & Modal quick triggers */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#667085]">
          <div className="flex items-center gap-1.5">
            <span>{rtlChrome ? "الوثائق" : "Documents"}</span>
            <ChevronRight
              className={`h-3.5 w-3.5 text-[#98A2B3] ${rtlChrome ? "rotate-180" : ""}`}
            />
            <span className="font-semibold text-[#14171F]">
              {rtlChrome ? "إنشاء وثيقة" : DOC_TYPE_META[docType].titleFr}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = !rtlChrome;
                setRtlChrome(next);
                setLanguage(next ? "AR" : "FR");
              }}
              className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-1 text-[11px] font-medium transition-colors ${
                rtlChrome
                  ? "border-[#0F3D3A] bg-[#0F3D3A] text-[#BFF0D4]"
                  : "border-[#E3E6EC] bg-[#F8F9FB] text-[#3F4654] hover:border-[#C5CBD6]"
              }`}
            >
              <Globe className="h-3 w-3" />
              {rtlChrome ? "واجهة عربية RTL ✓" : "Vue Arabe RTL"}
            </button>
          </div>
        </div>

        {/* Title Row + Show Preview Toggle (modeled directly on create-invoice-reference.png) */}
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#14171F]">
              {rtlChrome ? "إنشاء وثيقة محاسبية جديدة" : DOC_TYPE_META[docType].titleFr}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[#667085]">
              {rtlChrome
                ? "إعداد الوثيقة ومعاينتها مباشرة بصيغة A4 قبل الترقيم الرسمي."
                : "Préparez votre document conforme AE Maroc avec aperçu A4 instantané."}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showPreview}
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-[12px] border border-[#E3E6EC] bg-white px-3 py-2 text-[12px] font-medium text-[#14171F] hover:border-[#C5CBD6]"
          >
            <span>{rtlChrome ? "إظهار المعاينة" : "Aperçu A4"}</span>
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showPreview ? "bg-[#2457F5]" : "bg-[#D0D5DD]"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                  showPreview
                    ? rtlChrome
                      ? "-translate-x-4"
                      : "translate-x-4"
                    : rtlChrome
                    ? "-translate-x-1"
                    : "translate-x-1"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Feedback Banner */}
        {bannerFeedback && (
          <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[#0B6B3A]/20 bg-[#DDF5E6] px-3.5 py-2.5 text-[12.5px] font-medium text-[#0B6B3A]">
            <Check className="h-4 w-4 shrink-0" />
            <span>{bannerFeedback}</span>
          </div>
        )}

        {/* Accessible Validation Summary */}
        {hasValidationErrors && (
          <div
            role="alert"
            className="mt-3 rounded-[12px] border border-[#A31D1D]/30 bg-[#FDE3E3] px-3.5 py-2.5 text-[12px] text-[#A31D1D]"
          >
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Veuillez corriger les champs signalés avant l&apos;émission :</span>
            </div>
            <ul className="mt-1 list-disc ps-5 space-y-0.5">
              {Object.values(validationErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Segmented Document Type Tabs: Devis | Proforma | Facture | Facture d'acompte | Avoir */}
        <div
          role="tablist"
          aria-label="Type de document"
          className="mt-4 grid grid-cols-5 gap-1 rounded-[12px] bg-[#F3F4F6] p-1"
        >
          {(
            ["devis", "proforma", "facture", "acompte", "avoir"] as DocTypeCode[]
          ).map((key) => {
            const active = docType === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDocType(key)}
                className={`rounded-[9px] px-2 py-2 text-center text-[11.5px] font-medium transition-all leading-tight ${
                  active
                    ? "bg-white font-semibold text-[#14171F] shadow-[0_1px_3px_rgba(20,23,31,0.08)]"
                    : "text-[#667085] hover:text-[#14171F]"
                }`}
              >
                {rtlChrome
                  ? DOC_TYPE_META[key].tabAr
                  : key === "acompte"
                  ? "Acompte"
                  : DOC_TYPE_META[key].tabFr}
              </button>
            );
          })}
        </div>

        {/* SECTION 1: INFORMATIONS */}
        <section className="mt-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#14171F]">
              {rtlChrome ? "المعلومات الأساسية" : "Informations"}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-medium text-[#3F4654]">
              <CountryFlag code={selectedClient?.countryCode || "MA"} size={13} />
              <span>{clientTypeBadgeLabel}</span>
              <span className="text-[#98A2B3]">•</span>
              <span className="tabular-nums">
                {selectedClient?.taxIdLabel}: {selectedClient?.iceOrTaxId?.split(" ")[0]}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Client Select with Flag */}
            <NotchedField
              label={rtlChrome ? "العميل" : "Client"}
              required
              focused
              rtl={rtlChrome}
            >
              <div className="flex w-full items-center gap-2">
                <CountryFlag code={selectedClient?.countryCode || "MA"} size={20} />
                <select
                  aria-label="Sélectionner le client"
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(Number(e.target.value))}
                  className="w-full bg-transparent text-[13px] font-medium text-[#14171F] focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </NotchedField>

            {/* Optional Project */}
            <NotchedField
              label={rtlChrome ? "المشروع / المهمة (اختياري)" : "Projet / Mission (optionnel)"}
              rtl={rtlChrome}
            >
              <div className="flex w-full items-center gap-2">
                <FolderKanban className="h-4 w-4 shrink-0 text-[#667085]" strokeWidth={1.75} />
                <select
                  aria-label="Sélectionner un projet"
                  value={selectedProjectId}
                  onChange={(e) =>
                    setSelectedProjectId(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] focus:outline-none"
                >
                  <option value="">
                    {rtlChrome ? "بدون مشروع مرتبط" : "Aucun projet lié"}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </NotchedField>
          </div>

          {/* Issue Date & Due Date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NotchedField
              label={rtlChrome ? "تاريخ الإصدار" : "Date d'émission"}
              required
              rtl={rtlChrome}
              error={validationTriggered ? validationErrors.issueDate : undefined}
            >
              <div className="flex w-full items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-[#667085]" strokeWidth={1.75} />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium text-[#14171F] tabular-nums focus:outline-none"
                />
              </div>
            </NotchedField>

            <NotchedField
              label={
                rtlChrome
                  ? "تاريخ الاستحقاق"
                  : docType === "devis"
                  ? "Date de validité"
                  : "Date d'échéance"
              }
              required
              rtl={rtlChrome}
              error={validationTriggered ? validationErrors.dueDate : undefined}
            >
              <div className="flex w-full items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-[#667085]" strokeWidth={1.75} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium text-[#14171F] tabular-nums focus:outline-none"
                />
              </div>
            </NotchedField>
          </div>

          {/* Read-only Sequential Number + Document Language FR / EN / AR */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-7">
              <NotchedField
                label={rtlChrome ? "الرقم التسلسلي" : "Numéro séquentiel"}
                disabled
                rtl={rtlChrome}
              >
                <div className="flex w-full items-center justify-between gap-2 text-[#525866]">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 shrink-0 text-[#667085]" strokeWidth={1.75} />
                    <span className="text-[12.5px] font-medium">
                      {rtlChrome ? "يُخصص عند الإصدار" : "Attribué à l'émission"}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-[#3F4654] border border-[#E3E6EC] tabular-nums">
                    <Lock className="h-3 w-3 text-[#667085]" />
                    {nextNumberPreview}
                  </span>
                </div>
              </NotchedField>
            </div>

            <div className="sm:col-span-5">
              <NotchedField
                label={rtlChrome ? "لغة الوثيقة PDF" : "Langue du PDF"}
                rtl={rtlChrome}
              >
                <div className="grid w-full grid-cols-3 gap-1">
                  {(["FR", "EN", "AR"] as DocLang[]).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => handleLanguageChange(lng)}
                      className={`rounded-[8px] py-1 text-[11.5px] font-semibold transition-colors ${
                        language === lng
                          ? "bg-[#2457F5] text-white"
                          : "bg-[#F3F4F6] text-[#525866] hover:text-[#14171F]"
                      }`}
                    >
                      {lng === "AR" ? "AR عربي" : lng}
                    </button>
                  ))}
                </div>
              </NotchedField>
            </div>
          </div>
        </section>

        {/* SECTION 2: LIGNES DE SERVICE */}
        <section className="mt-6 space-y-3.5 border-t border-[#ECEEF2] pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#14171F]">
              {rtlChrome ? "بنود الخدمات والأشغال" : "Lignes de service"}
            </h2>
            <button
              type="button"
              onClick={importFromSelectedProject}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#E3E6EC] bg-[#F8F9FB] px-2.5 py-1.5 text-[11.5px] font-medium text-[#14171F] hover:border-[#2457F5] hover:text-[#2457F5]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2457F5]" strokeWidth={1.8} />
              <span>
                {rtlChrome ? "استيراد من المشروع" : "Importer depuis le projet"}
              </span>
            </button>
          </div>

          {/* Currency Select with Flag + Indicative MAD Rate */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className={currency === "MAD" ? "sm:col-span-12" : "sm:col-span-7"}>
              <NotchedField
                label={rtlChrome ? "عملة الفوترة" : "Devise"}
                required
                rtl={rtlChrome}
              >
                <div className="flex w-full items-center gap-2.5">
                  <CountryFlag code={CURRENCY_META[currency].flag} size={20} />
                  <select
                    aria-label="Devise du document"
                    value={currency}
                    onChange={(e) =>
                      handleCurrencyChange(e.target.value as CurrencyCode)
                    }
                    className="w-full bg-transparent text-[13px] font-medium text-[#14171F] focus:outline-none"
                  >
                    {(["MAD", "EUR", "CHF", "USD"] as CurrencyCode[]).map((c) => (
                      <option key={c} value={c}>
                        {rtlChrome
                          ? CURRENCY_META[c].labelAr
                          : CURRENCY_META[c].labelFr}
                      </option>
                    ))}
                  </select>
                </div>
              </NotchedField>
            </div>

            {currency !== "MAD" && (
              <div className="sm:col-span-5">
                <NotchedField
                  label={rtlChrome ? "سعر الصرف الإرشادي (MAD)" : `Taux indicatif (1 ${currency})`}
                  rtl={rtlChrome}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={exchangeRateToMad}
                      onChange={(e) => setExchangeRateToMad(Number(e.target.value))}
                      className="w-full bg-transparent text-[13px] font-semibold text-[#0F3D3A] tabular-nums focus:outline-none"
                    />
                    <span className="text-[11.5px] font-semibold text-[#667085]">
                      MAD
                    </span>
                  </div>
                </NotchedField>
              </div>
            )}
          </div>

          {/* Item Cards (modeled on Item 1 card in create-invoice-reference.png) */}
          <div className="space-y-3">
            {items.map((item, idx) => {
              const isCollapsed = Boolean(collapsedIds[item.id]);
              const lineNet =
                Number(item.quantity || 0) *
                Number(item.unitPrice || 0) *
                (1 - Number(item.discountPct || 0) / 100);
              const itemErr =
                validationTriggered &&
                (validationErrors[`item_${idx}`] ||
                  validationErrors[`item_price_${idx}`]);

              return (
                <div
                  key={item.id}
                  className={`rounded-[18px] border bg-white p-4 transition-colors ${
                    itemErr ? "border-[#A31D1D]" : "border-[#E3E6EC]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-semibold text-[#14171F]">
                        {rtlChrome ? `البند ${idx + 1}` : `Ligne ${idx + 1}`}
                      </span>
                      <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#14171F] tabular-nums">
                        {formatAmount(lineNet, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <select
                        aria-label="Insérer depuis le catalogue"
                        value=""
                        onChange={(e) => {
                          const cat = catalog.find(
                            (c) => c.id === Number(e.target.value)
                          );
                          if (!cat) return;
                          const convertedPrice =
                            currency === "MAD"
                              ? cat.unitPriceMad
                              : Math.round(
                                  (cat.unitPriceMad / exchangeRateToMad) * 100
                                ) / 100;
                          updateLine(item.id, {
                            designation:
                              language === "AR"
                                ? cat.titleAr
                                : language === "EN"
                                ? cat.titleEn
                                : cat.titleFr,
                            unit: cat.unit as DocumentLineItem["unit"],
                            unitPrice: convertedPrice,
                          });
                        }}
                        className="rounded-[8px] border border-[#E3E6EC] bg-[#F8F9FB] px-2 py-1 text-[11px] font-medium text-[#525866] focus:outline-none"
                      >
                        <option value="">
                          {rtlChrome ? "+ من الكتالوج" : "+ Catalogue"}
                        </option>
                        {catalog.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} — {c.titleFr}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        aria-label="Supprimer la ligne"
                        onClick={() => removeLine(item.id)}
                        disabled={items.length <= 1}
                        className="rounded-[8px] p-1.5 text-[#667085] hover:bg-[#FDE3E3]/50 hover:text-[#A31D1D] disabled:opacity-35"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        aria-label="Plier ou déplier la ligne"
                        onClick={() =>
                          setCollapsedIds((p) => ({
                            ...p,
                            [item.id]: !p[item.id],
                          }))
                        }
                        className="rounded-[8px] p-1.5 text-[#667085] hover:bg-[#F3F4F6] hover:text-[#14171F]"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="mt-3 space-y-2.5">
                      <NotchedField
                        label={rtlChrome ? "بيان الخدمة" : "Désignation"}
                        required
                        rtl={rtlChrome}
                        error={
                          validationTriggered
                            ? validationErrors[`item_${idx}`]
                            : undefined
                        }
                      >
                        <input
                          type="text"
                          value={item.designation}
                          onChange={(e) =>
                            updateLine(item.id, { designation: e.target.value })
                          }
                          placeholder="Ex: Conception Design System (Exemple)"
                          className="w-full bg-transparent text-[13px] font-medium text-[#14171F] focus:outline-none"
                        />
                      </NotchedField>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <NotchedField
                            label={rtlChrome ? "الكمية" : "Qté"}
                            rtl={rtlChrome}
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLine(item.id, {
                                  quantity: Number(e.target.value),
                                })
                              }
                              className="w-full bg-transparent text-[12.5px] font-semibold text-[#14171F] tabular-nums focus:outline-none"
                            />
                          </NotchedField>
                        </div>

                        <div className="col-span-3">
                          <NotchedField
                            label={rtlChrome ? "الوحدة" : "Unité"}
                            rtl={rtlChrome}
                          >
                            <select
                              aria-label="Unité"
                              value={item.unit}
                              onChange={(e) =>
                                updateLine(item.id, {
                                  unit: e.target.value as DocumentLineItem["unit"],
                                })
                              }
                              className="w-full bg-transparent text-[12px] font-medium text-[#14171F] focus:outline-none"
                            >
                              <option value="jour">jour</option>
                              <option value="heure">heure</option>
                              <option value="forfait">forfait</option>
                              <option value="unité">unité</option>
                            </select>
                          </NotchedField>
                        </div>

                        <div className="col-span-4">
                          <NotchedField
                            label={rtlChrome ? "ثمن الوحدة" : `Prix unitaire (${currency})`}
                            rtl={rtlChrome}
                          >
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateLine(item.id, {
                                  unitPrice: Number(e.target.value),
                                })
                              }
                              className="w-full bg-transparent text-[12.5px] font-semibold text-[#14171F] tabular-nums focus:outline-none"
                            />
                          </NotchedField>
                        </div>

                        <div className="col-span-2">
                          <NotchedField
                            label={rtlChrome ? "تخفيض%" : "Rem. %"}
                            rtl={rtlChrome}
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPct}
                              onChange={(e) =>
                                updateLine(item.id, {
                                  discountPct: Number(e.target.value),
                                })
                              }
                              className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] tabular-nums focus:outline-none"
                            />
                          </NotchedField>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Line Button */}
          <button
            type="button"
            onClick={addBlankLine}
            className="flex w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#E3E6EC] bg-white py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:border-[#2457F5] hover:text-[#2457F5] transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>{rtlChrome ? "إضافة سطر خدمة جديد" : "Ajouter une ligne"}</span>
          </button>

          {/* Global Discount + Requested Deposit Row */}
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-2.5">
              <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#14171F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGlobalDiscount}
                  onChange={(e) => setEnableGlobalDiscount(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#2457F5]"
                />
                <span>{rtlChrome ? "تخفيض إجمالي" : "Remise globale"}</span>
              </label>
              {enableGlobalDiscount && (
                <div className="flex items-center gap-1 rounded-[8px] border border-[#E3E6EC] bg-white px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={globalDiscountPct}
                    onChange={(e) => setGlobalDiscountPct(Number(e.target.value))}
                    className="w-10 text-right text-[12px] font-semibold tabular-nums focus:outline-none"
                  />
                  <span className="text-[11px] text-[#667085]">%</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-2.5">
              <span className="text-[12.5px] font-medium text-[#14171F]">
                {rtlChrome ? "التسبيق المطلوب" : "Acompte demandé"}
              </span>
              <div className="flex items-center gap-1 rounded-[8px] border border-[#E3E6EC] bg-white px-2 py-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={depositRequestedPct}
                  onChange={(e) => setDepositRequestedPct(Number(e.target.value))}
                  className="w-10 text-right text-[12px] font-semibold tabular-nums focus:outline-none"
                />
                <span className="text-[11px] text-[#667085]">%</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: MENTIONS ET PAIEMENT */}
        <section className="mt-6 space-y-3.5 border-t border-[#ECEEF2] pt-5">
          <h2 className="text-[14px] font-semibold text-[#14171F]">
            {rtlChrome ? "المقتضيات القانونية والأداء" : "Mentions et paiement"}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NotchedField
              label={rtlChrome ? "نظام الضريبة (TVA)" : "Régime TVA"}
              rtl={rtlChrome}
            >
              <select
                aria-label="Régime TVA"
                value={vatMode}
                onChange={(e) =>
                  setVatMode(e.target.value as "franchise_ae" | "export_hors_champ")
                }
                className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] focus:outline-none"
              >
                <option value="franchise_ae">
                  Franchise TVA — Art. 89-I-12° CGI (Maroc)
                </option>
                <option value="export_hors_champ">
                  Export services — Art. 92-I-1° CGI (0%)
                </option>
              </select>
            </NotchedField>

            <NotchedField
              label={rtlChrome ? "الحساب البنكي المطابق للعملة" : `Compte bancaire (${currency})`}
              rtl={rtlChrome}
            >
              <div className="flex w-full items-center justify-between text-[12px]">
                <span className="truncate font-medium text-[#14171F]">
                  {matchedBankAccount?.bankName}
                </span>
                <span className="shrink-0 rounded bg-[#DDF5E6] px-1.5 py-0.5 text-[10px] font-semibold text-[#0B6B3A]">
                  {currency === "MAD" ? "RIB" : "IBAN+BIC"}
                </span>
              </div>
            </NotchedField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NotchedField
              label={rtlChrome ? "طريقة الأداء" : "Mode de paiement"}
              rtl={rtlChrome}
            >
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] focus:outline-none"
              />
            </NotchedField>

            <NotchedField
              label={rtlChrome ? "شروط الأداء" : "Conditions de règlement"}
              rtl={rtlChrome}
            >
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] focus:outline-none"
              />
            </NotchedField>
          </div>

          <NotchedField
            label={rtlChrome ? "المقتضى القانوني التلقائي" : "Mention légale auto-insérée"}
            rtl={rtlChrome}
          >
            <textarea
              rows={2}
              value={customLegalMention || computedLegalMention}
              onChange={(e) => setCustomLegalMention(e.target.value)}
              className="w-full resize-none bg-transparent text-[11.5px] leading-relaxed text-[#3F4654] focus:outline-none"
            />
          </NotchedField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <NotchedField
                label={rtlChrome ? "ملاحظات أسفل الوثيقة" : "Notes pied de document"}
                rtl={rtlChrome}
              >
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent text-[12px] text-[#3F4654] focus:outline-none"
                />
              </NotchedField>
            </div>
            <div className="sm:col-span-4 pt-2">
              <button
                type="button"
                onClick={() => setShowSignature((s) => !s)}
                className={`flex h-[44px] w-full items-center justify-center gap-1.5 rounded-[12px] border px-3 text-[12px] font-medium transition-colors ${
                  showSignature
                    ? "border-[#0F3D3A] bg-[#0F3D3A]/5 text-[#0F3D3A]"
                    : "border-[#E3E6EC] bg-white text-[#667085]"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{showSignature ? "Signature active" : "Sans signature"}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT PANE: LIVE A4 PREVIEW ON SOFT GRAY STAGE (#F3F4F6) */}
      {showPreview && (
        <div className="flex flex-1 flex-col bg-[#F3F4F6]">
          {/* Preview Action Header (modeled directly on create-invoice-reference.png) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E6EC] bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[17px] font-bold tracking-[-0.015em] text-[#14171F]">
                {rtlChrome ? "معاينة مباشرة" : "Aperçu"}
              </h2>

              {/* Email | PDF Toggle */}
              <div className="inline-flex rounded-[10px] border border-[#E3E6EC] bg-[#F3F4F6] p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("email")}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12px] font-medium transition-all ${
                    previewMode === "email"
                      ? "bg-white text-[#14171F] shadow-xs"
                      : "text-[#667085] hover:text-[#14171F]"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("pdf")}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12px] font-medium transition-all ${
                    previewMode === "pdf"
                      ? "bg-white text-[#14171F] shadow-xs"
                      : "text-[#667085] hover:text-[#14171F]"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => persistDocument(false)}
                className="rounded-[12px] border border-[#E3E6EC] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB] disabled:opacity-50"
              >
                {rtlChrome ? "حفظ كمسودة" : "Enregistrer le brouillon"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  if (Object.keys(validationErrors).length > 0) {
                    setValidationTriggered(true);
                    return;
                  }
                  setConfirmModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_6px_18px_rgba(36,87,245,0.24)] hover:bg-[#1B45C9] transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{rtlChrome ? "إصدار وإرسال" : "Émettre et envoyer"}</span>
              </button>
            </div>
          </div>

          {/* Soft Gray Stage #F3F4F6 with Live A4 Paper */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <DocumentPaperPreview data={previewData} mode={previewMode} />
          </div>
        </div>
      )}

      {/* CONFIRM & SEQUENTIAL LOCK MODAL */}
      {confirmModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lock-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14171F]/45 p-4 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-[460px] rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-[0_24px_60px_rgba(20,23,31,0.18)]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E4EBFF] text-[#2457F5]">
                <ShieldAlert className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3
                  id="lock-modal-title"
                  className="text-[16px] font-bold text-[#14171F]"
                >
                  Émettre verrouille le document et attribue le numéro
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#525866]">
                  Conformément aux règles de facturation séquentielle sans rupture,
                  l&apos;émission va attribuer définitivement le numéro suivant :
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-4 space-y-2">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-[#667085]">Numéro séquentiel attribué</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0F3D3A] px-2.5 py-1 text-[12px] font-bold text-[#BFF0D4] tabular-nums">
                  <Lock className="h-3 w-3" />
                  {nextNumberPreview}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-[#667085]">Destinataire</span>
                <span className="font-semibold text-[#14171F]">
                  {selectedClient?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-[#667085]">Langue du PDF généré</span>
                <span className="font-semibold text-[#14171F]">
                  {language === "AR"
                    ? "العربية (RTL)"
                    : language === "EN"
                    ? "English"
                    : "Français"}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11.5px] leading-relaxed text-[#667085]">
              Une fois émis, ce document ne pourra plus être modifié ni supprimé.
              Toute rectification ultérieure devra faire l&apos;objet d&apos;un{" "}
              <strong className="text-[#14171F]">Avoir</strong>.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="rounded-[12px] border border-[#E3E6EC] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#3F4654] hover:bg-[#F3F4F6]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => persistDocument(true)}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Confirmer et verrouiller ({nextNumberPreview})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
