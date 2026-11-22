"use client";

import React, { useMemo, useState } from "react";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Landmark,
  Mail,
  MessageSquare,
  Search,
  Settings2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  CountryFlag,
  formatAmount,
  StatusBadge,
} from "@/components/BrandPrimitives";
import type { DocRow, PaymentRow } from "@/components/ScreensDocsAndDashboard";
import type { FullClientRow } from "@/components/ScreensManagement";

function fmtInt(v: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(v));
}

/* ============================== PAIEMENTS ============================== */
export function ScreenPayments({
  payments,
  documents,
  clients,
  onOpenDoc,
}: {
  payments: PaymentRow[];
  documents: DocRow[];
  clients: FullClientRow[];
  onOpenDoc: (doc: DocRow) => void;
}) {
  const [query, setQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("all");

  const docById = useMemo(() => {
    const map: Record<number, DocRow> = {};
    documents.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [documents]);

  const clientById = useMemo(() => {
    const map: Record<number, FullClientRow> = {};
    clients.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [clients]);

  const filtered = useMemo(() => {
    return [...payments]
      .sort((a, b) => (a.paymentDate < b.paymentDate ? 1 : -1))
      .filter((p) => {
        if (currencyFilter !== "all" && p.currency !== currencyFilter) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        const doc = docById[p.documentId];
        const cl = doc ? clientById[doc.clientId] : undefined;
        return (
          p.reference.toLowerCase().includes(q) ||
          (doc?.number || "").toLowerCase().includes(q) ||
          (cl?.name || "").toLowerCase().includes(q)
        );
      });
  }, [clientById, currencyFilter, docById, payments, query]);

  const totalMad = payments.reduce((s, p) => s + p.amountReceivedMad, 0);
  const totalFees = payments.reduce((s, p) => s + p.bankFeesMad, 0);

  return (
    <div className="flex-1 bg-white p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] text-[#667085]">
            Tous les règlements reçus, avec le montant crédité en dirhams
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-[-0.025em] text-[#14171F]">
            Paiements
          </h1>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB]"
        >
          <Download className="h-4 w-4" />
          Exporter (CSV)
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[20px] bg-[#0F3D3A] p-5 text-white">
          <p className="text-[12.5px] text-[#D6EFE1]">Total net reçu en MAD</p>
          <p className="mt-2 text-[24px] font-bold tabular-nums">{fmtInt(totalMad)} MAD</p>
          <p className="mt-1 text-[11.5px] text-[#D6EFE1]">
            {payments.length} règlement{payments.length > 1 ? "s" : ""} enregistré
            {payments.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <p className="text-[12.5px] text-[#667085]">Frais bancaires / change</p>
          <p className="mt-2 text-[24px] font-bold text-[#14171F] tabular-nums">
            {fmtInt(totalFees)} MAD
          </p>
          <p className="mt-1 text-[11.5px] text-[#667085]">
            Déduits des montants étrangers crédités
          </p>
        </div>
        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
          <p className="text-[12.5px] text-[#667085]">Devises encaissées</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {Array.from(new Set(payments.map((p) => p.currency))).map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E6EC] bg-[#F8F9FB] px-2.5 py-1 text-[11.5px] font-semibold text-[#14171F]"
              >
                <CountryFlag code={c} size={14} />
                {c}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-[#667085]">
            Conversion indicative vers le dirham
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-[340px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher référence, facture, client..."
            className="w-full rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] py-2.5 pl-9 pr-3 text-[12.5px] text-[#14171F] placeholder:text-[#98A2B3] focus:border-[#2457F5] focus:bg-white focus:outline-none"
          />
        </div>
        <select
          aria-label="Filtrer par devise"
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="rounded-[12px] border border-[#E3E6EC] bg-white px-3 py-2.5 text-[12.5px] font-medium text-[#14171F] focus:border-[#2457F5] focus:outline-none"
        >
          <option value="all">Toutes les devises</option>
          <option value="MAD">MAD</option>
          <option value="EUR">EUR</option>
          <option value="CHF">CHF</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] border border-[#E3E6EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E3E6EC] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                <th className="px-5 py-3">Date</th>
                <th className="px-4 py-3">Document & client</th>
                <th className="px-4 py-3">Mode / référence</th>
                <th className="px-4 py-3 text-right">Montant devisé</th>
                <th className="px-4 py-3 text-right">Reçu en MAD</th>
                <th className="px-5 py-3 text-right">Frais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5] text-[12.5px]">
              {filtered.map((p) => {
                const doc = docById[p.documentId];
                const client = doc ? clientById[doc.clientId] : undefined;
                return (
                  <tr key={p.id} className="hover:bg-[#F8F9FB]">
                    <td className="px-5 py-3.5 text-[#525866] tabular-nums">{p.paymentDate}</td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => doc && onOpenDoc(doc)}
                        className="font-semibold text-[#14171F] hover:text-[#2457F5] tabular-nums"
                      >
                        {doc?.number || "Brouillon"}
                      </button>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[#667085]">
                        <CountryFlag code={client?.countryCode || "MA"} size={13} />
                        {client?.name || "Client"}
                        {doc && <StatusBadge status={doc.status} />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#14171F]">{p.method}</p>
                      <p className="text-[11px] text-[#667085] tabular-nums">{p.reference}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-[#14171F] tabular-nums">
                      {formatAmount(p.amountCurrency, p.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#0B6B3A] tabular-nums">
                      {formatAmount(p.amountReceivedMad, "MAD")}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[#8A4B00] tabular-nums">
                      {p.bankFeesMad > 0 ? formatAmount(p.bankFeesMad, "MAD") : "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[12.5px] text-[#667085]">
                    Aucun paiement ne correspond à cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-[#F7F8FA] px-4 py-3 text-[11.5px] leading-relaxed text-[#525866]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0F3D3A]" />
        Le montant reçu en MAD est la seule base prise en compte pour votre plafond
        annuel et vos déclarations trimestrielles.
      </p>
    </div>
  );
}

/* ============================== DÉCLARATIONS ============================== */
export function ScreenDeclarations({
  payments,
  settings,
  onGoSettings,
}: {
  payments: PaymentRow[];
  settings: { annualCeilingMad: number; activityCategory: string };
  onGoSettings: () => void;
}) {
  const [prepared, setPrepared] = useState(false);

  const quarters = useMemo(() => {
    return [1, 2, 3, 4].map((q) => {
      const start = new Date(Date.UTC(2026, (q - 1) * 3, 1)).toISOString().slice(0, 10);
      const end = new Date(Date.UTC(2026, q * 3, 1)).toISOString().slice(0, 10);
      const total = payments
        .filter((p) => p.paymentDate >= start && p.paymentDate < end)
        .reduce((s, p) => s + p.amountReceivedMad, 0);
      const deadline = new Date(Date.UTC(2026, q * 3, 31));
      return {
        q,
        total,
        start,
        status: total > 0 ? "Encaissé" : "Aucun encaissement",
        deadline: deadline.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
      };
    });
  }, [payments]);

  const yearTotal = quarters.reduce((s, q) => s + q.total, 0);
  const rate = settings.activityCategory === "commercial" ? 0.005 : 0.01;
  const contribution = yearTotal * rate;

  return (
    <div className="flex-1 bg-white p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] text-[#667085]">
            Chiffre d&apos;affaires encaissé · régime Auto-Entrepreneur
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-[-0.025em] text-[#14171F]">
            Déclarations
          </h1>
        </div>
        <button
          type="button"
          onClick={onGoSettings}
          className="inline-flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB]"
        >
          <Settings2 className="h-4 w-4" />
          Configurer le taux
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[20px] bg-[#0F3D3A] p-6 text-white lg:col-span-5">
          <p className="text-[12.5px] text-[#D6EFE1]">Chiffre d&apos;affaires 2026 encaissé</p>
          <p className="mt-2 text-[32px] font-bold leading-none tabular-nums">
            {fmtInt(yearTotal)} <span className="text-[16px]">MAD</span>
          </p>
          <p className="mt-2 text-[12px] text-[#D6EFE1]">
            Plafond {fmtInt(settings.annualCeilingMad)} MAD · taux indicatif{" "}
            {(rate * 100).toFixed(1)} %
          </p>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#BFF0D4]"
              style={{
                width: `${Math.min(100, (yearTotal / settings.annualCeilingMad) * 100)}%`,
              }}
            />
          </div>

          <p className="mt-5 rounded-[12px] bg-white/10 px-4 py-3 text-[12.5px] leading-relaxed">
            Contribution estimée : {fmtInt(contribution)} MAD
            <br />
            Taux et échéance à confirmer dans les paramètres.
          </p>

          <button
            type="button"
            onClick={() => setPrepared(true)}
            className="mt-4 w-full rounded-[12px] bg-white py-2.5 text-[12.5px] font-semibold text-[#0F3D3A] hover:bg-[#EAFBF1]"
          >
            {prepared ? "Récapitulatif prêt ✓" : "Préparer ma déclaration"}
          </button>
        </section>

        <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-7 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#14171F]">Rythme trimestriel 2026</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F9FB] px-2.5 py-1 text-[11.5px] font-medium text-[#525866]">
              <CalendarClock className="h-3.5 w-3.5" />
              Déclaration en ligne
            </span>
          </div>

          <div className="mt-4 divide-y divide-[#F0F2F5]">
            {quarters.map((q) => (
              <div key={q.q} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F7F8FA] text-[12.5px] font-bold text-[#14171F]">
                    T{q.q}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#14171F]">
                      {q.status}
                    </p>
                    <p className="text-[11.5px] text-[#667085] tabular-nums">
                      Échéance indicative {q.deadline}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-[#14171F] tabular-nums">
                  {fmtInt(q.total)} MAD
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[12px] bg-[#F7F8FA] px-4 py-3 text-[11.5px] text-[#525866]">
            <FileSpreadsheet className="h-4 w-4 text-[#0F3D3A]" />
            Export détaillé par devise et par client disponible avant dépôt.
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================== AIDE & SUPPORT ============================== */
export function ScreenHelp() {
  const faqs = [
    {
      q: "Comment fonctionne la numérotation séquentielle ?",
      a: "Le numéro définitif est attribué uniquement à l'émission. Un brouillon n'occupe aucun numéro ; une fois émis, le document est verrouillé et seule une facture d'avoir peut le corriger.",
    },
    {
      q: "Pourquoi le plafond se base-t-il sur le montant reçu en MAD ?",
      a: "Le régime Auto-Entrepreneur déclare les encaissements effectifs. Une facture en EUR, CHF ou USD ne compte qu'au moment où le dirham est crédité sur votre compte marocain.",
    },
    {
      q: "Puis-je émettre une facture en arabe (RTL) ?",
      a: "Oui. Chaque client peut avoir une langue de PDF par défaut (FR, EN, AR). L'aperçu bascule immédiatement en RTL avec la police IBM Plex Sans Arabic.",
    },
    {
      q: "Que faire si je dépasse mon plafond ?",
      a: "Entre 60 % et 85 % vous êtes en vigilance, au-delà de 85 % en limite. Un dépassement deux années consécutives entraîne un changement de régime fiscal.",
    },
  ];

  return (
    <div className="flex-1 bg-white p-6 lg:p-8">
      <p className="text-[12.5px] text-[#667085]">Besoin d&apos;un coup de main ?</p>
      <h1 className="mt-1 text-[26px] font-bold tracking-[-0.025em] text-[#14171F]">
        Aide et support
      </h1>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5 lg:col-span-7 lg:p-6">
          <h2 className="text-[16px] font-bold text-[#14171F]">Questions fréquentes</h2>
          <div className="mt-3 divide-y divide-[#F0F2F5]">
            {faqs.map((f) => (
              <div key={f.q} className="flex items-start gap-3 py-3.5">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2457F5]" />
                <div>
                  <p className="text-[13px] font-semibold text-[#14171F]">{f.q}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#667085]">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#14171F]">Nous contacter</h2>
            <p className="mt-1 text-[12px] text-[#667085]">
              Support par e-mail, réponse sous 1 jour ouvré.
            </p>
            <a
              href="mailto:support@facturo-exemple.ma"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#2457F5] py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]"
            >
              <Mail className="h-4 w-4" />
              support@facturo-exemple.ma
            </a>
            <button
              type="button"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#E3E6EC] bg-white py-2.5 text-[12.5px] font-semibold text-[#14171F] hover:bg-[#F8F9FB]"
            >
              <MessageSquare className="h-4 w-4" />
              Ouvrir une demande
            </button>
          </section>

          <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#14171F]">Repères utiles</h2>
            <ul className="mt-3 space-y-2.5 text-[12px] text-[#525866]">
              <li className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-[#0F3D3A]" /> Plafond services : 200 000 MAD
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#0F3D3A]" /> Plafond commerce : 500 000 MAD
              </li>
              <li className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#0F3D3A]" /> RIB / IBAN par devise
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0B6B3A]" /> TVA non applicable — Art. 89 CGI
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
