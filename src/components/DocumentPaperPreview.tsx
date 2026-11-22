"use client";

import React from "react";
import { Lock, Paperclip, ShieldCheck } from "lucide-react";
import {
  CountryFlag,
  CURRENCY_META,
  DOC_TYPE_META,
  formatAmount,
  IssuerEmblem,
  type CurrencyCode,
  type DocLang,
  type DocTypeCode,
} from "@/components/BrandPrimitives";
import type {
  BankAccountConfig,
  DocumentLineItem,
} from "@/db/schema";

export interface PreviewDocumentData {
  docType: DocTypeCode;
  number: string | null;
  isLocked: boolean;
  language: DocLang;
  currency: CurrencyCode;
  exchangeRateToMad: number;
  issueDate: string;
  dueDate: string;
  issuer: {
    fullName: string;
    tradeName: string;
    address: string;
    city: string;
    ice: string;
    autoEntrepreneurNumber: string;
    identifiantFiscal?: string;
    email: string;
    signatureName: string;
    signatureRole: string;
  };
  client: {
    name: string;
    contactName: string;
    address: string;
    city: string;
    countryCode: string;
    countryName: string;
    iceOrTaxId: string;
    taxIdLabel: string;
    email: string;
  };
  items: DocumentLineItem[];
  globalDiscountPct: number;
  depositRequestedPct: number;
  vatWording: string;
  legalMention: string;
  paymentMethod: string;
  paymentTerms: string;
  bankAccount?: BankAccountConfig;
  notes: string;
  showSignature?: boolean;
}

const LABELS = {
  FR: {
    docNo: "Numéro",
    draftPending: "Attribué à l'émission",
    billedBy: "Émis par",
    billedTo: "Adressé à",
    issueDate: "Date d'émission",
    dueDate: "Date d'échéance",
    validityDate: "Date de validité",
    itemsHeader: "Prestations / Lignes de service",
    colDesc: "Désignation",
    colQty: "Qté",
    colUnit: "Unité",
    colPrice: "P.U. HT",
    colDisc: "Rem.",
    colAmount: "Montant",
    subtotal: "Sous-total HT",
    discount: "Remise globale",
    vatLine: "TVA (0% — Régime AE)",
    depositLine: "Acompte demandé",
    grandTotal: "Total net à payer",
    creditTotal: "Net à déduire (Avoir)",
    indicativeMad: "Équivalent indicatif en dirhams",
    rateNote: "Taux indicatif",
    paymentBlock: "Règlement & Coordonnées bancaires",
    method: "Mode",
    terms: "Conditions",
    aeLabel: "N° Auto-Entrepreneur",
    signatureLabel: "Signature & Cachet",
    emailSubject: "Objet",
    emailAttachment: "Pièce jointe PDF",
  },
  EN: {
    docNo: "Document No.",
    draftPending: "Assigned upon issue",
    billedBy: "Issued by",
    billedTo: "Billed to",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    validityDate: "Valid Until",
    itemsHeader: "Services & Deliverables",
    colDesc: "Description",
    colQty: "Qty",
    colUnit: "Unit",
    colPrice: "Unit Price",
    colDisc: "Disc.",
    colAmount: "Amount",
    subtotal: "Subtotal",
    discount: "Global Discount",
    vatLine: "VAT (0% — AE Exempt)",
    depositLine: "Requested Deposit",
    grandTotal: "Grand Total Due",
    creditTotal: "Total Credit Note",
    indicativeMad: "Indicative MAD Equivalent",
    rateNote: "Indicative rate",
    paymentBlock: "Payment & Bank Wire Details",
    method: "Method",
    terms: "Terms",
    aeLabel: "Auto-Entrepreneur ID",
    signatureLabel: "Authorized Signature",
    emailSubject: "Subject",
    emailAttachment: "PDF Attachment",
  },
  AR: {
    docNo: "رقم الوثيقة",
    draftPending: "يُخصص عند الإصدار الرسمي",
    billedBy: "صادر عن (المقاول الذاتي)",
    billedTo: "موجّه إلى العميل",
    issueDate: "تاريخ الإصدار",
    dueDate: "تاريخ الاستحقاق",
    validityDate: "صالح إلى غاية",
    itemsHeader: "تفاصيل الخدمات والأشغال المنجزة",
    colDesc: "بيان الخدمة",
    colQty: "الكمية",
    colUnit: "الوحدة",
    colPrice: "ثمن الوحدة",
    colDisc: "تخفيض",
    colAmount: "المبلغ الصافي",
    subtotal: "المجموع الفرعي",
    discount: "تخفيض إجمالي",
    vatLine: "الضريبة على القيمة المضافة (0% — معفى)",
    depositLine: "التسبيق المطلوب",
    grandTotal: "المبلغ الإجمالي الواجب أداؤه",
    creditTotal: "المبلغ الصافي للإشعار الدائن",
    indicativeMad: "المقابل التقريبي بالدرهم المغربي",
    rateNote: "سعر الصرف الإرشادي",
    paymentBlock: "معلومات الأداء والتحويل البنكي",
    method: "طريقة الأداء",
    terms: "شروط الدفع",
    aeLabel: "رقم المقاول الذاتي",
    signatureLabel: "التوقيع والخاتم",
    emailSubject: "الموضوع",
    emailAttachment: "ملف PDF مرفق",
  },
};

const UNIT_TRANSLATIONS: Record<string, { FR: string; EN: string; AR: string }> = {
  jour: { FR: "jour", EN: "day", AR: "يوم" },
  heure: { FR: "heure", EN: "hr", AR: "ساعة" },
  forfait: { FR: "forfait", EN: "flat", AR: "جزافي" },
  unité: { FR: "unité", EN: "unit", AR: "وحدة" },
};

export function DocumentPaperPreview({
  data,
  mode = "pdf",
  compact = false,
}: {
  data: PreviewDocumentData;
  mode?: "pdf" | "email";
  compact?: boolean;
}) {
  const lang = data.language || "FR";
  const isRtl = lang === "AR";
  const t = LABELS[lang];
  const docMeta = DOC_TYPE_META[data.docType] || DOC_TYPE_META.facture;

  const docHeading =
    lang === "AR"
      ? docMeta.upperAr
      : lang === "EN"
      ? docMeta.upperEn
      : docMeta.upperFr;

  const rawSubtotal = data.items.reduce((sum, item) => {
    const gross = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    const net = gross * (1 - Number(item.discountPct || 0) / 100);
    return sum + net;
  }, 0);

  const globalDiscAmount = rawSubtotal * (Number(data.globalDiscountPct || 0) / 100);
  const netAfterDiscount = Math.max(0, rawSubtotal - globalDiscAmount);
  const sign = data.docType === "avoir" ? -1 : 1;
  const grandTotal =
    (data.docType === "acompte" && data.depositRequestedPct > 0
      ? netAfterDiscount * (data.depositRequestedPct / 100)
      : netAfterDiscount) * sign;

  const rate = data.currency === "MAD" ? 1 : Number(data.exchangeRateToMad || CURRENCY_META[data.currency].defaultRateToMad);
  const indicativeMad = grandTotal * rate;

  if (mode === "email") {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`paper-light mx-auto w-full max-w-[540px] rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-[0_18px_40px_rgba(20,23,31,0.06)] ${
          isRtl ? "font-arabic text-right" : ""
        }`}
      >
        <div className="border-b border-[#E3E6EC] pb-4 text-[12.5px] text-[#525866] space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#14171F]">{data.issuer.fullName}</span>
            <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] tabular-nums">
              {data.client.email}
            </span>
          </div>
          <div>
            <span className="text-[#667085]">{t.emailSubject} : </span>
            <span className="font-semibold text-[#14171F]">
              {docHeading} {data.number || `(${t.draftPending})`} — {data.issuer.tradeName}
            </span>
          </div>
        </div>

        <div className="py-5 space-y-4 text-[13px] leading-relaxed text-[#2C3240]">
          <p>
            {lang === "AR"
              ? `مرحباً ${data.client.contactName}،`
              : lang === "EN"
              ? `Hello ${data.client.contactName},`
              : `Bonjour ${data.client.contactName},`}
          </p>
          <p>
            {lang === "AR"
              ? `يرجى إيجاد نسختكم من ${docHeading} بمبلغ إجمالي قدره ${formatAmount(
                  grandTotal,
                  data.currency
                )} رفقة هذه الرسالة الإلكترونية.`
              : lang === "EN"
              ? `Please find attached your ${docHeading.toLowerCase()} for a total amount of ${formatAmount(
                  grandTotal,
                  data.currency
                )}, due on ${data.dueDate}.`
              : `Veuillez trouver ci-joint votre ${docHeading.toLowerCase()} d'un montant net de ${formatAmount(
                  grandTotal,
                  data.currency
                )}, à échéance du ${data.dueDate}.`}
          </p>

          <div className="rounded-[14px] border border-[#E3E6EC] bg-[#F3F4F6]/65 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2457F5]/10 text-[#2457F5]">
                <Paperclip className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-[#14171F] tabular-nums">
                  {(data.number || `${docMeta.prefix}-BROUILLON`) + `_${lang}.pdf`}
                </p>
                <p className="text-[11px] text-[#667085]">
                  {t.emailAttachment} • A4 • {formatAmount(grandTotal, data.currency)}
                </p>
              </div>
            </div>
            <CountryFlag code={data.currency} size={20} />
          </div>

          <p className="pt-2 text-[12px] text-[#667085]">
            {data.issuer.fullName} — {data.issuer.signatureRole}
            <br />
            ICE : {data.issuer.ice}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[560px] pt-2">
      {/* Subtle stacked back-sheet directly modeled on create-invoice-reference.png */}
      {!compact && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 -top-0.5 bottom-3 -rotate-[1.35deg] rounded-[14px] border border-[#DDE1E8] bg-[#EAECEF]/90"
        />
      )}

      <article
        dir={isRtl ? "rtl" : "ltr"}
        aria-label="Aperçu du document A4"
        className={`paper-light relative rounded-[14px] border border-[#E3E6EC] bg-white ${
          compact ? "p-4 text-[10.5px]" : "p-7 text-[11.5px]"
        } text-[#14171F] shadow-[0_20px_48px_rgba(20,23,31,0.07)] ${
          isRtl ? "font-arabic text-right" : ""
        }`}
      >
        {/* Header: Document Type + Number vs. Deep Green / Mint Circular Emblem */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className={`${
                compact ? "text-[16px]" : "text-[21px]"
              } font-bold tracking-[-0.02em] text-[#14171F]`}
            >
              {docHeading}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-[#667085]">{t.docNo} :</span>
              {data.number ? (
                <span className="inline-flex items-center gap-1 font-semibold text-[#14171F] tabular-nums">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0B6B3A]" strokeWidth={2} />
                  #{data.number}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#E8EAEE] px-2 py-0.5 text-[10.5px] font-medium text-[#3F4654]">
                  <Lock className="h-3 w-3" strokeWidth={2} />
                  {t.draftPending}
                </span>
              )}
            </div>
          </div>

          <IssuerEmblem size={compact ? 36 : 44} />
        </div>

        {/* Issuer & Client 2-column block */}
        <div className="mt-5 grid grid-cols-2 gap-5 border-t border-[#ECEEF2] pt-4">
          <div className="space-y-0.5">
            <p className="text-[10.5px] font-medium text-[#667085]">{t.billedBy}</p>
            <p className="text-[12px] font-semibold text-[#14171F]">{data.issuer.fullName}</p>
            <p className="text-[10.5px] text-[#525866]">{data.issuer.tradeName}</p>
            <p className="text-[10.5px] text-[#667085]">
              {data.issuer.address}, {data.issuer.city}
            </p>
            <div className="pt-1 text-[10px] text-[#3F4654] space-y-0.5 tabular-nums">
              <p>
                <span className="font-semibold">ICE :</span> {data.issuer.ice}
              </p>
              <p>
                <span className="font-semibold">{t.aeLabel} :</span>{" "}
                {data.issuer.autoEntrepreneurNumber}
              </p>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-[10.5px] font-medium text-[#667085]">{t.billedTo}</p>
            <div className="flex items-center gap-1.5">
              <CountryFlag code={data.client.countryCode} size={14} />
              <p className="text-[12px] font-semibold text-[#14171F]">{data.client.name}</p>
            </div>
            <p className="text-[10.5px] text-[#525866]">{data.client.contactName}</p>
            <p className="text-[10.5px] text-[#667085]">
              {data.client.address} • {data.client.countryName}
            </p>
            <p className="pt-1 text-[10px] text-[#3F4654] tabular-nums">
              <span className="font-semibold">{data.client.taxIdLabel} :</span>{" "}
              {data.client.iceOrTaxId}
            </p>
          </div>
        </div>

        {/* Dates row */}
        <div className="mt-4 grid grid-cols-2 gap-5">
          <div>
            <p className="text-[10.5px] text-[#667085]">{t.issueDate}</p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-[#14171F] tabular-nums">
              {data.issueDate || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] text-[#667085]">
              {data.docType === "devis" ? t.validityDate : t.dueDate}
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-[#14171F] tabular-nums">
              {data.dueDate || "—"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-5">
          <p className="mb-2 text-[10.5px] font-medium text-[#667085]">{t.itemsHeader}</p>
          <div className="overflow-hidden rounded-[10px] border border-[#ECEEF2]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] text-[10px] font-semibold text-[#667085]">
                  <th className={`px-3 py-2 ${isRtl ? "text-right" : "text-left"}`}>
                    {t.colDesc}
                  </th>
                  <th className="px-2 py-2 text-center">{t.colQty}</th>
                  <th className="px-2 py-2 text-center">{t.colUnit}</th>
                  <th className={`px-2 py-2 ${isRtl ? "text-left" : "text-right"}`}>
                    {t.colPrice}
                  </th>
                  <th className={`px-3 py-2 ${isRtl ? "text-left" : "text-right"}`}>
                    {t.colAmount}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5] text-[11px]">
                {data.items.map((item, idx) => {
                  const lineGross = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                  const lineNet =
                    lineGross * (1 - Number(item.discountPct || 0) / 100) * sign;
                  const unitLabel =
                    UNIT_TRANSLATIONS[item.unit]?.[lang] || item.unit;

                  return (
                    <tr key={item.id || idx}>
                      <td className="px-3 py-2.5 font-medium text-[#14171F]">
                        <div>{item.designation || "—"}</div>
                        {Number(item.discountPct) > 0 && (
                          <span className="text-[9.5px] text-[#2457F5]">
                            ({t.colDisc} -{item.discountPct}%)
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-center text-[#3F4654] tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-2.5 text-center text-[#667085]">
                        {unitLabel}
                      </td>
                      <td
                        className={`px-2 py-2.5 text-[#3F4654] tabular-nums ${
                          isRtl ? "text-left" : "text-right"
                        }`}
                      >
                        {new Intl.NumberFormat("fr-FR", {
                          minimumFractionDigits: 2,
                        }).format(Number(item.unitPrice || 0))}
                      </td>
                      <td
                        className={`px-3 py-2.5 font-semibold text-[#14171F] tabular-nums ${
                          isRtl ? "text-left" : "text-right"
                        }`}
                      >
                        {formatAmount(lineNet, data.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Block */}
        <div className="mt-4 space-y-1.5 border-t border-[#ECEEF2] pt-3 text-[11px]">
          <div className="flex items-center justify-between text-[#525866]">
            <span>{t.subtotal}</span>
            <span className="font-medium text-[#14171F] tabular-nums">
              {formatAmount(rawSubtotal * sign, data.currency)}
            </span>
          </div>

          {globalDiscAmount > 0 && (
            <div className="flex items-center justify-between text-[#525866]">
              <span>
                {t.discount} ({data.globalDiscountPct}%)
              </span>
              <span className="font-medium text-[#A31D1D] tabular-nums">
                -{formatAmount(globalDiscAmount, data.currency)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10.5px] text-[#667085]">
            <span>{t.vatLine}</span>
            <span className="tabular-nums">0,00 {data.currency}</span>
          </div>

          {data.docType === "devis" && data.depositRequestedPct > 0 && (
            <div className="flex items-center justify-between text-[10.5px] text-[#1B45C9]">
              <span>
                {t.depositLine} ({data.depositRequestedPct}%)
              </span>
              <span className="font-medium tabular-nums">
                {formatAmount(
                  netAfterDiscount * (data.depositRequestedPct / 100),
                  data.currency
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#E3E6EC] pt-2 text-[13px] font-bold text-[#14171F]">
            <span>{data.docType === "avoir" ? t.creditTotal : t.grandTotal}</span>
            <span className="tabular-nums">{formatAmount(grandTotal, data.currency)}</span>
          </div>

          {data.currency !== "MAD" && (
            <div className="flex items-center justify-between rounded-[8px] bg-[#F3F4F6] px-2.5 py-1.5 text-[10px] text-[#525866]">
              <span>
                {t.indicativeMad} ({t.rateNote} : 1 {data.currency} ={" "}
                {rate.toFixed(2).replace(".", ",")} MAD)
              </span>
              <span className="font-semibold text-[#0F3D3A] tabular-nums">
                ≈ {formatAmount(indicativeMad, "MAD")}
              </span>
            </div>
          )}
        </div>

        {/* Legal Mention & Note Pill */}
        <div className="mt-4 rounded-[10px] border border-[#E3E6EC] bg-[#F8F9FB] px-3 py-2 text-[9.8px] leading-relaxed text-[#525866]">
          <p className="font-medium text-[#3F4654]">{data.legalMention || data.vatWording}</p>
          {data.notes && <p className="mt-1 text-[#667085]">{data.notes}</p>}
        </div>

        {/* Footer: Bank Details + Signature */}
        <div className="mt-5 flex items-end justify-between gap-4 pt-2">
          <div className="space-y-0.5 text-[10px] text-[#525866]">
            <p className="font-semibold text-[#14171F]">{t.paymentBlock}</p>
            <p>
              {t.method} : {data.paymentMethod} • {t.terms} : {data.paymentTerms}
            </p>
            {data.bankAccount && (
              <>
                <p className="text-[#667085]">{data.bankAccount.bankName}</p>
                <p className="font-medium text-[#14171F] tabular-nums">
                  {data.bankAccount.currency === "MAD" ? "RIB : " : "IBAN : "}
                  {data.bankAccount.ribOrIban}
                </p>
                {data.bankAccount.currency !== "MAD" && (
                  <p className="text-[#667085] tabular-nums">
                    BIC / SWIFT : {data.bankAccount.swiftBic}
                  </p>
                )}
              </>
            )}
          </div>

          {data.showSignature !== false && (
            <div className="shrink-0 text-center">
              <svg
                width="108"
                height="34"
                viewBox="0 0 120 38"
                fill="none"
                aria-label="Signature manuscrite exemple"
                className="mx-auto text-[#14171F]"
              >
                <path
                  d="M12 28C22 14 29 6 33 6C37 6 31 31 36 31C41 31 50 13 56 13C60 13 57 25 62 25C68 25 76 10 81 10C84 10 82 24 89 23C96 22 103 16 112 18"
                  stroke="currentColor"
                  strokeWidth="1.65"
                  strokeLinecap="round"
                />
                <path
                  d="M18 32C44 29 78 27 108 28"
                  stroke="#2457F5"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeOpacity="0.65"
                />
              </svg>
              <p className="mt-0.5 text-[10.5px] font-semibold text-[#14171F]">
                {data.issuer.signatureName}
              </p>
              <p className="text-[9px] text-[#667085]">{t.signatureLabel}</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
