"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileMinus2,
  FilePlus2,
  Filter,
  Lock,
  Plus,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  CountryFlag,
  DOC_TYPE_META,
  formatAmount,
  NotchedField,
  StatusBadge,
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
  DocumentTimelineStep,
} from "@/db/schema";

export interface DocRow {
  id: number;
  docType: string;
  number: string | null;
  isLocked: boolean;
  status: string;
  clientId: number;
  projectId: number | null;
  language: string;
  currency: string;
  exchangeRateToMad: number;
  issueDate: string;
  dueDate: string;
  itemsJson: DocumentLineItem[];
  globalDiscountPct: number;
  depositRequestedPct: number;
  vatMode: string;
  legalMention: string;
  paymentMethod: string;
  paymentTerms: string;
  bankAccountKey: string;
  notes: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  indicativeMadAmount: number;
  timelineJson: DocumentTimelineStep[];
}

export interface PaymentRow {
  id: number;
  documentId: number;
  amountCurrency: number;
  currency: string;
  amountReceivedMad: number;
  bankFeesMad: number;
  paymentDate: string;
  method: string;
  reference: string;
  notes: string;
}

interface ClientShort {
  id: number;
  name: string;
  contactName: string;
  countryCode: string;
  countryName: string;
  city: string;
  address: string;
  email: string;
  iceOrTaxId: string;
  taxIdLabel: string;
}

interface SettingsShort {
  fullName: string;
  tradeName: string;
  address: string;
  city: string;
  ice: string;
  autoEntrepreneurNumber: string;
  identifiantFiscal: string;
  email: string;
  annualCeilingMad: number;
  activityCategory: string;
  signatureName: string;
  signatureRole: string;
  bankAccountsJson: BankAccountConfig[];
}

/* ============================================================================
   SCREEN 2 — DOCUMENTS LIST
   ============================================================================ */
export function ScreenDocumentsList({
  documents,
  clients,
  onSelectDoc,
  onCreateNew,
  onMutateState,
  initialTypeFilter = "all",
}: {
  documents: DocRow[];
  clients: ClientShort[];
  onSelectDoc: (doc: DocRow, openPayModal?: boolean) => void;
  onCreateNew: () => void;
  onMutateState: (nextState: unknown) => void;
  initialTypeFilter?: string;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("2026");
  const [busyId, setBusyId] = useState<number | null>(null);

  const clientMap = useMemo(() => {
    const map: Record<number, ClientShort> = {};
    clients.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [clients]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (typeFilter !== "all" && d.docType !== typeFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (clientFilter !== "all" && d.clientId !== Number(clientFilter))
        return false;
      if (currencyFilter !== "all" && d.currency !== currencyFilter)
        return false;
      if (periodFilter === "2026-03" && !d.issueDate.startsWith("2026-03"))
        return false;
      if (periodFilter === "2026-02" && !d.issueDate.startsWith("2026-02"))
        return false;
      if (periodFilter === "2026-01" && !d.issueDate.startsWith("2026-01"))
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const cl = clientMap[d.clientId]?.name.toLowerCase() || "";
        const num = (d.number || "brouillon").toLowerCase();
        if (!cl.includes(q) && !num.includes(q)) return false;
      }
      return true;
    });
  }, [
    clientFilter,
    clientMap,
    currencyFilter,
    documents,
    periodFilter,
    search,
    statusFilter,
    typeFilter,
  ]);

  const triggerRowConversion = async (
    sourceId: number,
    targetType: DocTypeCode
  ) => {
    setBusyId(sourceId);
    try {
      const res = await fetch("/api/facturo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "duplicate_or_convert",
          sourceId,
          targetType,
        }),
      });
      const next = await res.json();
      onMutateState(next);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Facturation & Suivi • Numérotation séquentielle verrouillée
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Documents commerciaux
          </h1>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9] transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          <span>Nouveau document</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Quick Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "Tous" },
              { key: "devis", label: "Devis" },
              { key: "proforma", label: "Proformas" },
              { key: "facture", label: "Factures" },
              { key: "acompte", label: "Acomptes" },
              { key: "avoir", label: "Avoirs" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key)}
                className={`rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  typeFilter === tab.key
                    ? "bg-[#14171F] text-white"
                    : "bg-[#F3F4F6] text-[#525866] hover:text-[#14171F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[250px] flex-1 sm:max-w-[300px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
              strokeWidth={1.8}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher N° FAC-2026, client..."
              className="w-full rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] py-2 pl-9 pr-3 text-[12.5px] text-[#14171F] placeholder:text-[#98A2B3] focus:border-[#2457F5] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Secondary Filter Selects: Status, Client, Currency, Period */}
        <div className="grid grid-cols-2 gap-2.5 border-t border-[#F0F2F5] pt-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]">
            <Filter className="h-3.5 w-3.5 text-[#667085]" />
            <select
              aria-label="Filtrer par statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent font-medium text-[#14171F] focus:outline-none"
            >
              <option value="all">Statut : Tous</option>
              <option value="paid">Payée</option>
              <option value="accepted">Accepté</option>
              <option value="sent">Envoyée</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]">
            <select
              aria-label="Filtrer par client"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full bg-transparent font-medium text-[#14171F] focus:outline-none"
            >
              <option value="all">Client : Tous ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]">
            <select
              aria-label="Filtrer par devise"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full bg-transparent font-medium text-[#14171F] focus:outline-none"
            >
              <option value="all">Devise : Toutes (MAD/EUR/CHF/USD)</option>
              <option value="MAD">MAD — Dirham</option>
              <option value="EUR">EUR — Euro</option>
              <option value="CHF">CHF — Franc suisse</option>
              <option value="USD">USD — Dollar US</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[12px]">
            <select
              aria-label="Filtrer par période"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full bg-transparent font-medium text-[#14171F] focus:outline-none"
            >
              <option value="2026">Période : Année 2026</option>
              <option value="2026-03">Mars 2026</option>
              <option value="2026-02">Février 2026</option>
              <option value="2026-01">Janvier 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-[20px] border border-[#E3E6EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E3E6EC] bg-[#F8F9FB] text-[11.5px] font-semibold uppercase tracking-wider text-[#667085]">
                <th className="px-5 py-3.5">Numéro & Type</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Émission / Échéance</th>
                <th className="px-4 py-3.5">Langue</th>
                <th className="px-4 py-3.5 text-right">Montant & Équiv. MAD</th>
                <th className="px-4 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF2] text-[13px]">
              {filteredDocs.map((doc) => {
                const cl = clientMap[doc.clientId];
                const meta =
                  DOC_TYPE_META[doc.docType as DocTypeCode] ||
                  DOC_TYPE_META.facture;

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-[#F8F9FB]/80 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {doc.isLocked ? (
                          <Lock
                            className="h-3.5 w-3.5 shrink-0 text-[#0F3D3A]"
                            strokeWidth={2}
                          />
                        ) : (
                          <FilePlus2
                            className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]"
                            strokeWidth={1.8}
                          />
                        )}
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectDoc(doc, false)}
                            className="font-semibold text-[#14171F] hover:text-[#2457F5] tabular-nums"
                          >
                            {doc.number || "Attribué à l'émission"}
                          </button>
                          <p className="text-[11px] text-[#667085]">
                            {meta.tabFr}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <CountryFlag code={cl?.countryCode || "MA"} size={18} />
                        <div>
                          <p className="font-medium text-[#14171F]">
                            {cl?.name || "Client"}
                          </p>
                          <p className="text-[11px] text-[#667085] tabular-nums">
                            {cl?.taxIdLabel} : {cl?.iceOrTaxId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[12px] tabular-nums">
                      <p className="font-medium text-[#14171F]">{doc.issueDate}</p>
                      <p className="text-[#667085]">Éch. {doc.dueDate}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-md border border-[#E3E6EC] bg-[#F8F9FB] px-2 py-0.5 text-[11px] font-semibold text-[#3F4654]">
                        {doc.language === "AR" ? "AR (RTL)" : doc.language}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right tabular-nums">
                      <p className="font-bold text-[#14171F]">
                        {formatAmount(doc.totalAmount, doc.currency)}
                      </p>
                      {doc.currency !== "MAD" && (
                        <p className="text-[11px] text-[#0F3D3A]">
                          ≈ {formatAmount(doc.indicativeMadAmount, "MAD")}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Voir le détail"
                          onClick={() => onSelectDoc(doc, false)}
                          className="rounded-[9px] border border-[#E3E6EC] bg-white p-1.5 text-[#3F4654] hover:border-[#2457F5] hover:text-[#2457F5]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Dupliquer en brouillon"
                          disabled={busyId === doc.id}
                          onClick={() =>
                            triggerRowConversion(
                              doc.id,
                              doc.docType as DocTypeCode
                            )
                          }
                          className="rounded-[9px] border border-[#E3E6EC] bg-white p-1.5 text-[#3F4654] hover:border-[#2457F5] hover:text-[#2457F5]"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        {(doc.docType === "devis" ||
                          doc.docType === "proforma") && (
                          <button
                            type="button"
                            title="Convertir en facture"
                            disabled={busyId === doc.id}
                            onClick={() => triggerRowConversion(doc.id, "facture")}
                            className="inline-flex items-center gap-1 rounded-[9px] border border-[#E3E6EC] bg-[#F8F9FB] px-2 py-1 text-[11px] font-semibold text-[#1B45C9] hover:border-[#2457F5]"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            <span>Facturer</span>
                          </button>
                        )}

                        {doc.docType === "facture" && doc.isLocked && (
                          <button
                            type="button"
                            title="Créer un avoir"
                            disabled={busyId === doc.id}
                            onClick={() => triggerRowConversion(doc.id, "avoir")}
                            className="rounded-[9px] border border-[#E3E6EC] bg-white p-1.5 text-[#3F4654] hover:border-[#A31D1D] hover:text-[#A31D1D]"
                          >
                            <FileMinus2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          title="Aperçu / Export PDF"
                          onClick={() => onSelectDoc(doc, false)}
                          className="rounded-[9px] border border-[#E3E6EC] bg-white p-1.5 text-[#3F4654] hover:border-[#14171F] hover:text-[#14171F]"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        {doc.status !== "paid" &&
                          doc.isLocked &&
                          (doc.docType === "facture" ||
                            doc.docType === "acompte") && (
                            <button
                              type="button"
                              title="Enregistrer un paiement en MAD"
                              onClick={() => onSelectDoc(doc, true)}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#0F3D3A] px-2.5 py-1.5 text-[11px] font-semibold text-[#BFF0D4] hover:opacity-95"
                            >
                              <Banknote className="h-3.5 w-3.5" />
                              <span>Paiement</span>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SCREEN 3 — DOCUMENT DETAIL + TIMELINE + ENREGISTRER UN PAIEMENT MODAL
   ============================================================================ */
export function ScreenDocumentDetail({
  doc,
  client,
  settings,
  payments,
  defaultOpenPayModal = false,
  onBack,
  onMutateState,
}: {
  doc: DocRow;
  client: ClientShort;
  settings: SettingsShort;
  payments: PaymentRow[];
  defaultOpenPayModal?: boolean;
  onBack: () => void;
  onMutateState: (nextState: unknown) => void;
}) {
  const [payModalOpen, setPayModalOpen] = useState(defaultOpenPayModal);
  const [amountCurrency, setAmountCurrency] = useState<number>(doc.totalAmount);
  const [amountReceivedMad, setAmountReceivedMad] = useState<number>(
    doc.currency === "MAD"
      ? doc.totalAmount
      : Math.round((doc.indicativeMadAmount - 180) * 100) / 100
  );
  const [bankFeesMad, setBankFeesMad] = useState<number>(
    doc.currency === "MAD" ? 0 : 180
  );
  const [paymentDate, setPaymentDate] = useState<string>("2026-03-10");
  const [method, setMethod] = useState<string>(
    doc.currency === "MAD"
      ? "Virement bancaire RIB Maroc"
      : `Virement SWIFT ${doc.currency}`
  );
  const [reference, setReference] = useState<string>("VIR-2026-883920-SAMPLE");
  const [saving, setSaving] = useState(false);

  const docPayments = useMemo(
    () => payments.filter((p) => p.documentId === doc.id),
    [doc.id, payments]
  );

  const matchedBank =
    settings.bankAccountsJson.find((b) => b.key === doc.bankAccountKey) ||
    settings.bankAccountsJson[0];

  const previewData: PreviewDocumentData = {
    docType: doc.docType as DocTypeCode,
    number: doc.number,
    isLocked: doc.isLocked,
    language: (doc.language as DocLang) || "FR",
    currency: (doc.currency as CurrencyCode) || "MAD",
    exchangeRateToMad: doc.exchangeRateToMad,
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
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
      name: client.name,
      contactName: client.contactName,
      address: client.address,
      city: client.city,
      countryCode: client.countryCode,
      countryName: client.countryName,
      iceOrTaxId: client.iceOrTaxId,
      taxIdLabel: client.taxIdLabel,
      email: client.email,
    },
    items: doc.itemsJson,
    globalDiscountPct: doc.globalDiscountPct,
    depositRequestedPct: doc.depositRequestedPct,
    vatWording: doc.legalMention,
    legalMention: doc.legalMention,
    paymentMethod: doc.paymentMethod,
    paymentTerms: doc.paymentTerms,
    bankAccount: matchedBank,
    notes: doc.notes,
    showSignature: true,
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/facturo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          documentId: doc.id,
          amountCurrency,
          currency: doc.currency,
          amountReceivedMad,
          bankFeesMad,
          paymentDate,
          method,
          reference,
        }),
      });
      const next = await res.json();
      onMutateState(next);
      setPayModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#E3E6EC] bg-white px-5 py-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-[10px] border border-[#E3E6EC] p-2 text-[#3F4654] hover:bg-[#F3F4F6]"
            aria-label="Retour à la liste"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[19px] font-bold text-[#14171F] tabular-nums">
                {doc.number || "Brouillon non numéroté"}
              </h1>
              <StatusBadge status={doc.status} />
              {doc.isLocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0F3D3A]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0F3D3A]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Document émis verrouillé (lecture seule)
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12.5px] text-[#667085]">
              Client : {client.name} • Langue PDF : {doc.language} • Total :{" "}
              <strong className="text-[#14171F] tabular-nums">
                {formatAmount(doc.totalAmount, doc.currency)}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-[12px] border border-[#E3E6EC] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB]"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF ({doc.language})</span>
          </button>

          {doc.status !== "paid" && (
            <button
              type="button"
              onClick={() => setPayModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]"
            >
              <Banknote className="h-4 w-4" />
              <span>Enregistrer un paiement</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Read-only A4 Paper vs. Timeline & MAD Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DocumentPaperPreview data={previewData} mode="pdf" />
        </div>

        <div className="lg:col-span-5 space-y-5">
          {/* Document Lifecycle Timeline */}
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <h2 className="text-[15px] font-bold text-[#14171F]">
              Historique & Cycle de vie
            </h2>
            <ol className="mt-4 space-y-4">
              {doc.timelineJson.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-[#DDF5E6] text-[#0B6B3A]"
                        : "bg-[#F3F4F6] text-[#98A2B3]"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
                    ) : (
                      <Clock className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="flex-1 border-b border-[#F0F2F5] pb-3 last:border-none last:pb-0">
                    <p
                      className={`text-[13px] font-semibold ${
                        step.done ? "text-[#14171F]" : "text-[#667085]"
                      }`}
                    >
                      {step.labelFr}
                    </p>
                    <p className="text-[11.5px] text-[#667085] tabular-nums">
                      {step.timestamp || "En attente"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Recorded Payments List (with Net MAD Received!) */}
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#14171F]">
                Règlements & Montants reçus en MAD
              </h2>
              <button
                type="button"
                onClick={() => setPayModalOpen(true)}
                className="text-[12px] font-semibold text-[#2457F5] hover:underline"
              >
                + Ajouter
              </button>
            </div>

            {docPayments.length === 0 ? (
              <div className="mt-4 rounded-[14px] border border-dashed border-[#E3E6EC] bg-[#F8F9FB] p-5 text-center">
                <Receipt className="mx-auto h-6 w-6 text-[#98A2B3]" />
                <p className="mt-2 text-[13px] font-semibold text-[#14171F]">
                  Aucun paiement enregistré
                </p>
                <p className="mt-0.5 text-[12px] text-[#667085]">
                  Saisissez le montant crédité en MAD sur votre relevé bancaire
                  pour mettre à jour votre plafond Auto-Entrepreneur.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {docPayments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#14171F] tabular-nums">
                        Payé : {formatAmount(p.amountCurrency, p.currency)}
                      </span>
                      <span className="rounded-full bg-[#DDF5E6] px-2.5 py-0.5 text-[11.5px] font-bold text-[#0B6B3A] tabular-nums">
                        +{formatAmount(p.amountReceivedMad, "MAD")} net reçus
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-[#667085] tabular-nums">
                      <span>
                        {p.paymentDate} • {p.method}
                      </span>
                      <span>Réf: {p.reference}</span>
                    </div>
                    {p.bankFeesMad > 0 && (
                      <p className="text-[11px] text-[#8A4B00] tabular-nums">
                        Frais bancaires / commission de change :{" "}
                        {formatAmount(p.bankFeesMad, "MAD")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ENREGISTRER UN PAIEMENT */}
      {payModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14171F]/45 p-4 backdrop-blur-[2px]"
        >
          <form
            onSubmit={submitPayment}
            className="w-full max-w-[490px] rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-[0_24px_60px_rgba(20,23,31,0.18)] space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="pay-modal-title"
                  className="text-[17px] font-bold text-[#14171F]"
                >
                  Enregistrer un paiement
                </h3>
                <p className="mt-0.5 text-[12.5px] text-[#667085]">
                  Document {doc.number || "Brouillon"} • Client : {client.name}
                </p>
              </div>
              <CountryFlag code={doc.currency} size={22} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NotchedField
                label={`Montant payé (${doc.currency})`}
                required
              >
                <input
                  type="number"
                  step="0.01"
                  value={amountCurrency}
                  onChange={(e) => setAmountCurrency(Number(e.target.value))}
                  className="w-full bg-transparent text-[13px] font-bold text-[#14171F] tabular-nums focus:outline-none"
                />
              </NotchedField>

              <NotchedField
                label="Montant net reçu en MAD"
                required
                focused
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={amountReceivedMad}
                    onChange={(e) => setAmountReceivedMad(Number(e.target.value))}
                    className="w-full bg-transparent text-[13px] font-bold text-[#0B6B3A] tabular-nums focus:outline-none"
                  />
                  <span className="text-[11px] font-bold text-[#0F3D3A]">MAD</span>
                </div>
              </NotchedField>
            </div>

            <div className="rounded-[12px] bg-[#0F3D3A]/6 px-3.5 py-2.5 text-[11.5px] text-[#0F3D3A]">
              <strong>Règle fiscale Auto-Entrepreneur :</strong> seul le{" "}
              <span className="underline">montant effectivement encaissé en MAD</span>{" "}
              sur votre compte marocain est comptabilisé dans votre déclaration
              trimestrielle et le plafond annuel.
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NotchedField label="Frais bancaires / change (MAD)">
                <input
                  type="number"
                  step="0.01"
                  value={bankFeesMad}
                  onChange={(e) => setBankFeesMad(Number(e.target.value))}
                  className="w-full bg-transparent text-[13px] font-medium text-[#14171F] tabular-nums focus:outline-none"
                />
              </NotchedField>

              <NotchedField label="Date de réception" required>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium text-[#14171F] tabular-nums focus:outline-none"
                />
              </NotchedField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NotchedField label="Mode de règlement">
                <select
                  aria-label="Mode de règlement"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] focus:outline-none"
                >
                  <option value="Virement bancaire RIB Maroc">
                    Virement RIB Maroc
                  </option>
                  <option value={`Virement SWIFT ${doc.currency}`}>
                    Virement SWIFT {doc.currency}
                  </option>
                  <option value="Chèque bancaire">Chèque bancaire</option>
                  <option value="Espèces (plafond légal)">Espèces</option>
                </select>
              </NotchedField>

              <NotchedField label="Référence de virement" required>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#14171F] tabular-nums focus:outline-none"
                />
              </NotchedField>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="rounded-[12px] border border-[#E3E6EC] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#3F4654] hover:bg-[#F3F4F6]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
              >
                <CreditCard className="h-4 w-4" />
                <span>Valider l&apos;encaissement MAD</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   SCREEN 4 — TURNOVER DASHBOARD WITH ANNUAL AUTO-ENTREPRENEUR CEILING
   ============================================================================ */
export function ScreenDashboard({
  documents,
  payments,
  clients,
  settings,
  onSelectDoc,
  onCreateNew,
}: {
  documents: DocRow[];
  payments: PaymentRow[];
  clients: ClientShort[];
  settings: SettingsShort;
  onSelectDoc: (doc: DocRow) => void;
  onCreateNew: () => void;
}) {
  const totalCollectedMad = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amountReceivedMad || 0), 0),
    [payments]
  );

  const pendingMad = useMemo(
    () =>
      documents
        .filter(
          (d) =>
            (d.docType === "facture" || d.docType === "acompte") &&
            (d.status === "sent" || d.status === "pending")
        )
        .reduce((sum, d) => sum + Number(d.indicativeMadAmount || 0), 0),
    [documents]
  );

  const overdueDocs = useMemo(
    () => documents.filter((d) => d.status === "overdue"),
    [documents]
  );

  const overdueMad = useMemo(
    () => overdueDocs.reduce((s, d) => s + d.indicativeMadAmount, 0),
    [overdueDocs]
  );

  const ceiling = settings.annualCeilingMad || 200000;
  const ceilingPct = Math.min(100, Math.round((totalCollectedMad / ceiling) * 1000) / 10);
  const remainingMad = Math.max(0, ceiling - totalCollectedMad);

  const monthlyBars = [
    { month: "Jan", collected: 38400, projected: 42000 },
    { month: "Fév", collected: 64400, projected: 64400 },
    { month: "Mar", collected: Math.max(40000, totalCollectedMad - 102800), projected: 72000 },
    { month: "Avr", collected: 0, projected: 52866 },
    { month: "Mai", collected: 0, projected: 38000 },
    { month: "Juin", collected: 0, projected: 24000 },
  ];

  const maxBar = Math.max(
    ...monthlyBars.map((b) => Math.max(b.collected, b.projected)),
    75000
  );

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6">
      {/* Top Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Exercice fiscal 2026 • Déclaration CNSS / DGI Auto-Entrepreneur
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Tableau de bord du chiffre d&apos;affaires
          </h1>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          <span>Créer un document</span>
        </button>
      </div>

      {/* 4 KPI Cards in MAD */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[12.5px] font-medium">CA encaissé net (MAD)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#DDF5E6] text-[#0B6B3A]">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[22px] font-bold text-[#14171F] tabular-nums">
            {formatAmount(totalCollectedMad, "MAD")}
          </p>
          <p className="mt-1 text-[11.5px] text-[#0B6B3A] font-medium">
            {payments.length} règlements encaissés en 2026
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[12.5px] font-medium">En attente (équiv. MAD)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#E4EBFF] text-[#1B45C9]">
              <Send className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[22px] font-bold text-[#14171F] tabular-nums">
            {formatAmount(pendingMad, "MAD")}
          </p>
          <p className="mt-1 text-[11.5px] text-[#667085]">
            Factures émises non encore créditées
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[12.5px] font-medium">Factures en retard</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FDE3E3] text-[#A31D1D]">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[22px] font-bold text-[#A31D1D] tabular-nums">
            {formatAmount(overdueMad, "MAD")}
          </p>
          <p className="mt-1 text-[11.5px] text-[#A31D1D] font-medium">
            {overdueDocs.length} facture(s) échue(s) à relancer
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[12.5px] font-medium">Impôt IR estimé (1%)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFF0D6] text-[#8A4B00]">
              <Banknote className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-[22px] font-bold text-[#14171F] tabular-nums">
            {formatAmount(totalCollectedMad * 0.01, "MAD")}
          </p>
          <p className="mt-1 text-[11.5px] text-[#667085]">
            Prestations de services (taux libératoire 1%)
          </p>
        </div>
      </div>

      {/* Middle Row: Monthly Collections Chart + Annual Ceiling Tracker (#0F3D3A + #BFF0D4) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Monthly Collections Bar Chart */}
        <div className="lg:col-span-7 rounded-[20px] border border-[#E3E6EC] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[15.5px] font-bold text-[#14171F]">
                Encaissements mensuels reçus en MAD (S1 2026)
              </h2>
              <p className="text-[12px] text-[#667085]">
                Comparaison entre montants nets encaissés et prévisionnel facturé
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#14171F]">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#2457F5]" />
                Encaissé MAD
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-[#667085]">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#E4EBFF]" />
                Facturé / Attendu
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-4 items-end h-[200px] pt-4 border-b border-[#ECEEF2] pb-3">
            {monthlyBars.map((bar) => {
              const colH = Math.round((bar.collected / maxBar) * 155);
              const projH = Math.round((bar.projected / maxBar) * 155);
              return (
                <div
                  key={bar.month}
                  className="flex flex-col items-center justify-end h-full gap-2"
                >
                  <span className="text-[10.5px] font-semibold text-[#525866] tabular-nums">
                    {bar.collected > 0
                      ? `${Math.round(bar.collected / 1000)}k`
                      : "—"}
                  </span>
                  <div className="flex items-end gap-1.5 w-full justify-center">
                    <div
                      style={{ height: `${Math.max(colH, 4)}px` }}
                      className="w-5 rounded-t-[6px] bg-[#2457F5] transition-all"
                      title={`Encaissé: ${formatAmount(bar.collected, "MAD")}`}
                    />
                    <div
                      style={{ height: `${Math.max(projH, 4)}px` }}
                      className="w-5 rounded-t-[6px] bg-[#E4EBFF]"
                      title={`Prévu: ${formatAmount(bar.projected, "MAD")}`}
                    />
                  </div>
                  <span className="text-[11.5px] font-medium text-[#667085]">
                    {bar.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Annual Auto-Entrepreneur Ceiling Tracker Card */}
        <div className="lg:col-span-5 rounded-[20px] bg-[#0F3D3A] p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#BFF0D4]/15 px-3 py-1 text-[11px] font-semibold text-[#BFF0D4]">
                Plafond annuel Auto-Entrepreneur
              </span>
              <span className="text-[12px] font-semibold text-[#BFF0D4] tabular-nums">
                {ceilingPct}% utilisé
              </span>
            </div>

            <h2 className="mt-4 text-[24px] font-bold tracking-[-0.02em] text-white tabular-nums">
              {formatAmount(totalCollectedMad, "MAD")}
            </h2>
            <p className="text-[12.5px] text-[#BFF0D4]/85 tabular-nums">
              sur {formatAmount(ceiling, "MAD")} ({settings.activityCategory === "services" ? "Prestations de services" : "Activité commerciale"})
            </p>

            {/* Progress Bar */}
            <div className="mt-5 h-3.5 w-full overflow-hidden rounded-full bg-white/12">
              <div
                style={{ width: `${ceilingPct}%` }}
                className="h-full rounded-full bg-[#BFF0D4] transition-all"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-[14px] bg-white/8 p-3.5 text-[12px]">
              <div>
                <p className="text-white/70">Marge restante 2026</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#BFF0D4] tabular-nums">
                  {formatAmount(remainingMad, "MAD")}
                </p>
              </div>
              <div>
                <p className="text-white/70">Après encaissement en cours</p>
                <p className="mt-0.5 text-[14px] font-bold text-white tabular-nums">
                  {Math.min(
                    999,
                    Math.round(((totalCollectedMad + pendingMad) / ceiling) * 100)
                  )}
                  % du plafond
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11.5px] leading-relaxed text-white/75">
            Attention : le dépassement du seuil de{" "}
            <strong className="text-[#BFF0D4]">200 000 MAD</strong> deux années
            consécutives entraîne le changement de régime fiscal.
          </p>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15.5px] font-bold text-[#14171F]">
            Documents récents
          </h2>
          <span className="text-[12px] text-[#667085]">
            Cliquez sur une ligne pour consulter la timeline ou enregistrer un règlement
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#ECEEF2] text-[11px] font-semibold uppercase text-[#667085]">
                <th className="py-2.5 pr-4">Document</th>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 pl-4 text-right">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {documents.slice(0, 5).map((d) => {
                const cl = clients.find((c) => c.id === d.clientId);
                return (
                  <tr key={d.id} className="hover:bg-[#F8F9FB]">
                    <td className="py-3 pr-4 font-semibold text-[#14171F] tabular-nums">
                      {d.number || "Brouillon"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CountryFlag code={cl?.countryCode || "MA"} size={16} />
                        <span>{cl?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#667085] tabular-nums">
                      {d.issueDate}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#14171F] tabular-nums">
                      {formatAmount(d.totalAmount, d.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectDoc(d)}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2457F5] hover:underline"
                      >
                        <span>Ouvrir</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
