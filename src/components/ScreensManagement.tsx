"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  Check,
  CheckSquare,
  FilePlus2,
  FolderKanban,
  Globe,
  Hash,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Square,
  Tag,
} from "lucide-react";
import {
  CountryFlag,
  formatAmount,
  IssuerEmblem,
  NotchedField,
  StatusBadge,
  type CurrencyCode,
  type DocLang,
} from "@/components/BrandPrimitives";
import type {
  BankAccountConfig,
  DocumentLineItem,
  ProjectTaskItem,
} from "@/db/schema";
import type { DocRow } from "@/components/ScreensDocsAndDashboard";

export interface FullClientRow {
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
  notes: string;
}

export interface FullProjectRow {
  id: number;
  code: string;
  name: string;
  clientId: number;
  status: string;
  currency: string;
  budgetAmount: number;
  description: string;
  dueDate: string;
  tasksJson: ProjectTaskItem[];
}

export interface FullCatalogRow {
  id: number;
  code: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  description: string;
  unit: string;
  unitPriceMad: number;
  category: string;
}

/* ============================================================================
   SCREEN 5 — CLIENTS LIST + CLIENT PROFILE
   ============================================================================ */
export function ScreenClients({
  clients,
  documents,
  onSelectDoc,
  onCreateQuoteForClient,
  onMutateState,
}: {
  clients: FullClientRow[];
  documents: DocRow[];
  onSelectDoc: (doc: DocRow) => void;
  onCreateQuoteForClient: (client: FullClientRow) => void;
  onMutateState: (nextState: unknown) => void;
}) {
  const [selectedId, setSelectedId] = useState<number>(clients[0]?.id || 1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Create Client Modal fields
  const [newName, setNewName] = useState("Atlas FinTech SARL (Exemple)");
  const [newContact, setNewContact] = useState("Nadia Chraibi (Exemple)");
  const [newCountryCode, setNewCountryCode] = useState("MA");
  const [newCity, setNewCity] = useState("Casablanca");
  const [newTaxId, setNewTaxId] = useState("003499110000072 (Exemple)");
  const [newLang, setNewLang] = useState<DocLang>("FR");
  const [newCurr, setNewCurr] = useState<CurrencyCode>("MAD");
  const [saving, setSaving] = useState(false);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.iceOrTaxId.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const activeClient =
    clients.find((c) => c.id === selectedId) || filteredClients[0] || clients[0];

  const clientDocs = useMemo(
    () => documents.filter((d) => d.clientId === activeClient?.id),
    [activeClient?.id, documents]
  );

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const countryNames: Record<string, string> = {
        MA: "Maroc",
        FR: "France",
        CH: "Suisse",
        US: "États-Unis",
      };
      const res = await fetch("/api/facturo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_client",
          name: newName,
          contactName: newContact,
          clientType: newCountryCode === "MA" ? "company_ma" : "company_intl",
          countryCode: newCountryCode,
          countryName: countryNames[newCountryCode] || "Maroc",
          city: newCity,
          address: `${newCity} (Exemple)`,
          email: "contact@client-exemple.ma",
          iceOrTaxId: newTaxId,
          taxIdLabel: newCountryCode === "MA" ? "ICE" : "TVA / Tax ID",
          preferredLanguage: newLang,
          defaultCurrency: newCurr,
          notes: "Client ajouté via la fiche répertoire (Exemple).",
        }),
      });
      const next = await res.json();
      onMutateState(next);
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Répertoire Maroc & International (ICE, TVA Intracom., UID, EIN)
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Clients & Profils de facturation
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          <span>Nouveau client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List */}
        <div className="lg:col-span-5 rounded-[20px] border border-[#E3E6EC] bg-white p-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par raison sociale, ICE, ville..."
              className="w-full rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] py-2 pl-9 pr-3 text-[12.5px] focus:border-[#2457F5] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {filteredClients.map((c) => {
              const selected = c.id === activeClient?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-[16px] border p-3.5 text-left transition-all ${
                    selected
                      ? "border-[#2457F5] bg-[#E4EBFF]/35"
                      : "border-[#E3E6EC] bg-white hover:bg-[#F8F9FB]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CountryFlag code={c.countryCode} size={22} />
                      <div>
                        <p className="text-[13.5px] font-bold text-[#14171F]">
                          {c.name}
                        </p>
                        <p className="text-[11.5px] text-[#667085]">
                          {c.city}, {c.countryName} • {c.contactName}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-bold text-[#14171F]">
                      {c.defaultCurrency}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#525866] tabular-nums">
                    <span>
                      {c.taxIdLabel} : {c.iceOrTaxId}
                    </span>
                    <span className="font-semibold text-[#1B45C9]">
                      PDF {c.preferredLanguage}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Client Profile */}
        {activeClient && (
          <div className="lg:col-span-7 rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEEF2] pb-5">
              <div className="flex items-center gap-3.5">
                <CountryFlag code={activeClient.countryCode} size={36} />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[19px] font-bold text-[#14171F]">
                      {activeClient.name}
                    </h2>
                    <span className="rounded-full bg-[#E4EBFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B45C9]">
                      {activeClient.clientType === "company_ma"
                        ? "Société Maroc"
                        : "Client Export"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[#667085]">
                    Contact : {activeClient.contactName} • {activeClient.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCreateQuoteForClient(activeClient)}
                className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#0F3D3A] px-3.5 py-2 text-[12.5px] font-semibold text-[#BFF0D4] hover:opacity-95"
              >
                <FilePlus2 className="h-4 w-4" />
                <span>Créer un devis</span>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3">
                <p className="text-[11px] text-[#667085]">Pays & Ville</p>
                <p className="mt-1 text-[13px] font-semibold text-[#14171F]">
                  {activeClient.countryName} ({activeClient.city})
                </p>
              </div>
              <div className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3">
                <p className="text-[11px] text-[#667085]">
                  Identifiant ({activeClient.taxIdLabel})
                </p>
                <p className="mt-1 text-[12.5px] font-semibold text-[#14171F] tabular-nums">
                  {activeClient.iceOrTaxId}
                </p>
              </div>
              <div className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3">
                <p className="text-[11px] text-[#667085]">Langue par défaut</p>
                <p className="mt-1 text-[13px] font-semibold text-[#14171F]">
                  {activeClient.preferredLanguage === "AR"
                    ? "Arabe (RTL)"
                    : activeClient.preferredLanguage === "EN"
                    ? "English"
                    : "Français"}
                </p>
              </div>
              <div className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3">
                <p className="text-[11px] text-[#667085]">Devise par défaut</p>
                <p className="mt-1 text-[13px] font-semibold text-[#14171F]">
                  {activeClient.defaultCurrency}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-[14px] border border-[#E3E6EC] p-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#667085]">
                Adresse de facturation & Notes internes
              </p>
              <p className="mt-1.5 text-[13px] text-[#14171F] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                {activeClient.address}
              </p>
              <p className="mt-1.5 text-[12.5px] text-[#525866]">
                {activeClient.notes}
              </p>
            </div>

            {/* Document History */}
            <div>
              <h3 className="text-[14px] font-bold text-[#14171F] mb-2.5">
                Historique des documents ({clientDocs.length})
              </h3>
              <div className="overflow-hidden rounded-[14px] border border-[#E3E6EC]">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-[#F8F9FB] text-[11px] font-semibold text-[#667085]">
                    <tr>
                      <th className="px-4 py-2.5">Numéro</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5 text-right">Montant</th>
                      <th className="px-4 py-2.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {clientDocs.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => onSelectDoc(d)}
                        className="cursor-pointer hover:bg-[#F8F9FB]"
                      >
                        <td className="px-4 py-2.5 font-semibold text-[#2457F5] tabular-nums">
                          {d.number || "Brouillon"}
                        </td>
                        <td className="px-3 py-2.5 text-[#667085] tabular-nums">
                          {d.issueDate}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                          {formatAmount(d.totalAmount, d.currency)}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={d.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14171F]/45 p-4">
          <form
            onSubmit={handleAddClient}
            className="w-full max-w-[460px] rounded-[20px] border border-[#E3E6EC] bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-[17px] font-bold text-[#14171F]">
              Ajouter un client (Exemple)
            </h3>
            <NotchedField label="Raison sociale / Nom complet" required focused>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
              />
            </NotchedField>
            <div className="grid grid-cols-2 gap-3">
              <NotchedField label="Pays">
                <select
                  aria-label="Pays"
                  value={newCountryCode}
                  onChange={(e) => setNewCountryCode(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                >
                  <option value="MA">Maroc (MA)</option>
                  <option value="FR">France (FR)</option>
                  <option value="CH">Suisse (CH)</option>
                  <option value="US">États-Unis (US)</option>
                </select>
              </NotchedField>
              <NotchedField label="Ville">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                />
              </NotchedField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NotchedField label="Interlocuteur">
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                />
              </NotchedField>
              <NotchedField label="ICE / N° Fiscal" required>
                <input
                  type="text"
                  value={newTaxId}
                  onChange={(e) => setNewTaxId(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium tabular-nums focus:outline-none"
                />
              </NotchedField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NotchedField label="Devise par défaut">
                <select
                  aria-label="Devise par défaut"
                  value={newCurr}
                  onChange={(e) => setNewCurr(e.target.value as CurrencyCode)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                >
                  <option value="MAD">MAD</option>
                  <option value="EUR">EUR</option>
                  <option value="CHF">CHF</option>
                  <option value="USD">USD</option>
                </select>
              </NotchedField>
              <NotchedField label="Langue PDF">
                <select
                  aria-label="Langue PDF"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value as DocLang)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                >
                  <option value="FR">Français (FR)</option>
                  <option value="EN">English (EN)</option>
                  <option value="AR">العربية (AR RTL)</option>
                </select>
              </NotchedField>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-[12px] border border-[#E3E6EC] px-4 py-2 text-[13px] font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-[12px] bg-[#2457F5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
              >
                Enregistrer le client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   SCREEN 6 — PROJECTS / MISSIONS + SERVICES CATALOG + "CRÉER UN DEVIS"
   ============================================================================ */
export function ScreenProjectsAndCatalog({
  projects,
  clients,
  catalog,
  onCreateQuoteFromProject,
  onMutateState,
}: {
  projects: FullProjectRow[];
  clients: FullClientRow[];
  catalog: FullCatalogRow[];
  onCreateQuoteFromProject: (
    project: FullProjectRow,
    items: DocumentLineItem[]
  ) => void;
  onMutateState: (nextState: unknown) => void;
}) {
  const [selectedProjId, setSelectedProjId] = useState<number>(
    projects[0]?.id || 1
  );
  const activeProj =
    projects.find((p) => p.id === selectedProjId) || projects[0];
  const projClient = clients.find((c) => c.id === activeProj?.clientId);

  const toggleTask = async (projectId: number, taskId: string) => {
    const res = await fetch("/api/facturo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_project_task",
        projectId,
        taskId,
      }),
    });
    const next = await res.json();
    onMutateState(next);
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Missions, Livrables & Catalogue de prestations réutilisables
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Projets / Missions & Catalogue
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Projects List */}
        <div className="lg:col-span-5 space-y-3">
          {projects.map((p) => {
            const cl = clients.find((c) => c.id === p.clientId);
            const doneCount = p.tasksJson.filter((t) => t.completed).length;
            const active = p.id === activeProj?.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjId(p.id)}
                className={`w-full rounded-[20px] border p-4.5 text-left transition-all ${
                  active
                    ? "border-[#2457F5] bg-white shadow-[0_10px_28px_rgba(36,87,245,0.08)]"
                    : "border-[#E3E6EC] bg-white hover:bg-[#F8F9FB]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#525866] tabular-nums">
                    {p.code}
                  </span>
                  <StatusBadge
                    status={p.status === "active" ? "sent" : "pending"}
                  />
                </div>
                <h3 className="mt-2 text-[14.5px] font-bold text-[#14171F]">
                  {p.name}
                </h3>
                <div className="mt-1.5 flex items-center gap-2 text-[12px] text-[#667085]">
                  <CountryFlag code={cl?.countryCode || "MA"} size={15} />
                  <span>{cl?.name}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#F0F2F5] pt-2.5 text-[12px]">
                  <span className="text-[#525866]">
                    {doneCount}/{p.tasksJson.length} tâches livrées
                  </span>
                  <span className="font-bold text-[#14171F] tabular-nums">
                    {formatAmount(p.budgetAmount, p.currency)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Project Detail + Tasks + Créer un devis */}
        {activeProj && (
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ECEEF2] pb-4">
                <div>
                  <span className="text-[11.5px] font-semibold text-[#2457F5] tabular-nums">
                    {activeProj.code} • Échéance {activeProj.dueDate}
                  </span>
                  <h2 className="mt-1 text-[19px] font-bold text-[#14171F]">
                    {activeProj.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#525866]">
                    {activeProj.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onCreateQuoteFromProject(
                      activeProj,
                      activeProj.tasksJson.map((t) => ({
                        id: `q-${t.id}`,
                        designation: t.title,
                        quantity: t.quantity,
                        unit: t.unit,
                        unitPrice: t.unitPrice,
                        discountPct: 0,
                      }))
                    )
                  }
                  className="inline-flex shrink-0 items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
                >
                  <FilePlus2 className="h-4 w-4" />
                  <span>Créer un devis</span>
                </button>
              </div>

              {projClient && (
                <div className="flex items-center justify-between rounded-[14px] bg-[#F8F9FB] px-4 py-3 text-[12.5px]">
                  <div className="flex items-center gap-2">
                    <CountryFlag code={projClient.countryCode} size={18} />
                    <span className="font-semibold text-[#14171F]">
                      {projClient.name}
                    </span>
                  </div>
                  <span className="font-bold text-[#0F3D3A] tabular-nums">
                    Budget : {formatAmount(activeProj.budgetAmount, activeProj.currency)}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-[14px] font-bold text-[#14171F] mb-3">
                  Tâches & Livrables de la mission (importables en 1 clic)
                </h3>
                <div className="space-y-2.5">
                  {activeProj.tasksJson.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(activeProj.id, task.id)}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[#E3E6EC] p-3.5 hover:border-[#2457F5]"
                    >
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-[#0B6B3A]" />
                        ) : (
                          <Square className="h-4 w-4 shrink-0 text-[#98A2B3]" />
                        )}
                        <div>
                          <p
                            className={`text-[13px] font-medium ${
                              task.completed
                                ? "text-[#525866] line-through"
                                : "text-[#14171F]"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[11px] text-[#667085] tabular-nums">
                            {task.quantity} {task.unit} ×{" "}
                            {formatAmount(task.unitPrice, activeProj.currency)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-[#14171F] tabular-nums">
                        {formatAmount(
                          task.quantity * task.unitPrice,
                          activeProj.currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Services Catalog Card */}
            <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-[#2457F5]" />
                <h3 className="text-[14.5px] font-bold text-[#14171F]">
                  Catalogue de prestations trilingue (FR / EN / AR)
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {catalog.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3 text-[12px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#2457F5] tabular-nums">
                        {cat.code}
                      </span>
                      <span className="font-bold text-[#14171F] tabular-nums">
                        {formatAmount(cat.unitPriceMad, "MAD")} / {cat.unit}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-[#14171F]">
                      {cat.titleFr}
                    </p>
                    <p className="mt-0.5 font-arabic text-[11px] text-[#667085]">
                      {cat.titleAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   SCREEN 7 — SETTINGS (PARAMÈTRES AUTO-ENTREPRENEUR)
   ============================================================================ */
export function ScreenSettings({
  settings,
  onMutateState,
}: {
  settings: {
    fullName: string;
    tradeName: string;
    activityLabel: string;
    activityCategory: string;
    ice: string;
    autoEntrepreneurNumber: string;
    identifiantFiscal: string;
    taxeProfessionnelle: string;
    address: string;
    city: string;
    email: string;
    annualCeilingMad: number;
    bankAccountsJson: BankAccountConfig[];
    numberingJson: Record<
      string,
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
  };
  onMutateState: (nextState: unknown) => void;
}) {
  const [fullName, setFullName] = useState(settings.fullName);
  const [tradeName, setTradeName] = useState(settings.tradeName);
  const [ice, setIce] = useState(settings.ice);
  const [aeNum, setAeNum] = useState(settings.autoEntrepreneurNumber);
  const [ceiling, setCeiling] = useState<number>(settings.annualCeilingMad);
  const [activityCategory, setActivityCategory] = useState(
    settings.activityCategory
  );
  const [savedToast, setSavedToast] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/facturo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_settings",
        fullName,
        tradeName,
        ice,
        autoEntrepreneurNumber: aeNum,
        annualCeilingMad: ceiling,
        activityCategory,
      }),
    });
    const next = await res.json();
    onMutateState(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  return (
    <form
      onSubmit={saveProfile}
      className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Configuration légale Maroc, RIB/IBAN multidevises, numérotation & plafond
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Paramètres de l&apos;Auto-Entrepreneur
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF5E6] px-3 py-1.5 text-[12px] font-semibold text-[#0B6B3A]">
              <Check className="h-3.5 w-3.5" /> Paramètres enregistrés
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#2457F5] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Business Profile + Annual Ceiling */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[#2457F5]" />
                <h2 className="text-[15px] font-bold text-[#14171F]">
                  Profil juridique & Identifiants Maroc
                </h2>
              </div>
              <IssuerEmblem size={38} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NotchedField label="Nom & Prénom (Titulaire AE)" required>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                />
              </NotchedField>
              <NotchedField label="Nom commercial / Atelier">
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                />
              </NotchedField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NotchedField label="ICE (15 chiffres)" required>
                <input
                  type="text"
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-semibold tabular-nums focus:outline-none"
                />
              </NotchedField>
              <NotchedField label="N° Carte Auto-Entrepreneur" required>
                <input
                  type="text"
                  value={aeNum}
                  onChange={(e) => setAeNum(e.target.value)}
                  className="w-full bg-transparent text-[13px] font-semibold tabular-nums focus:outline-none"
                />
              </NotchedField>
            </div>
          </div>

          {/* Annual Ceiling Selector */}
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#0F3D3A]" />
              <h2 className="text-[15px] font-bold text-[#14171F]">
                Plafond annuel Auto-Entrepreneur (Loi 114-13)
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setActivityCategory("services");
                  setCeiling(200000);
                }}
                className={`rounded-[16px] border p-4 text-left transition-all ${
                  ceiling === 200000
                    ? "border-[#0F3D3A] bg-[#0F3D3A] text-white"
                    : "border-[#E3E6EC] bg-[#F8F9FB] text-[#14171F]"
                }`}
              >
                <p className="text-[12px] font-medium opacity-80">
                  Prestations de services
                </p>
                <p className="mt-1 text-[18px] font-bold tabular-nums">
                  200 000 MAD / an
                </p>
                <p className="mt-1 text-[11px] opacity-80">IR libératoire : 1%</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivityCategory("commercial");
                  setCeiling(500000);
                }}
                className={`rounded-[16px] border p-4 text-left transition-all ${
                  ceiling === 500000
                    ? "border-[#0F3D3A] bg-[#0F3D3A] text-white"
                    : "border-[#E3E6EC] bg-[#F8F9FB] text-[#14171F]"
                }`}
              >
                <p className="text-[12px] font-medium opacity-80">
                  Commerce, Industrie & Artisanat
                </p>
                <p className="mt-1 text-[18px] font-bold tabular-nums">
                  500 000 MAD / an
                </p>
                <p className="mt-1 text-[11px] opacity-80">
                  IR libératoire : 0,5%
                </p>
              </button>
            </div>
          </div>

          {/* Locked Numbering Rules */}
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[#2457F5]" />
              <h2 className="text-[15px] font-bold text-[#14171F]">
                Séquences de numérotation verrouillées (2026)
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {Object.entries(settings.numberingJson).map(([k, rule]) => (
                <div
                  key={k}
                  className="rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] p-3"
                >
                  <p className="text-[11px] font-semibold uppercase text-[#667085]">
                    {k}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[13px] font-bold text-[#14171F] tabular-nums">
                    <Lock className="h-3 w-3 text-[#0F3D3A]" />
                    {rule.prefix}-{rule.year}-
                    {String(rule.nextCounter).padStart(rule.padding, "0")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Bank Accounts per Currency + Legal Mentions */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-3.5">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[#2457F5]" />
              <h2 className="text-[15px] font-bold text-[#14171F]">
                Coordonnées bancaires par devise (RIB / IBAN + SWIFT)
              </h2>
            </div>

            <div className="space-y-3">
              {settings.bankAccountsJson.map((b) => (
                <div
                  key={b.key}
                  className="rounded-[14px] border border-[#E3E6EC] bg-[#F8F9FB] p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CountryFlag code={b.currency} size={18} />
                      <span className="text-[13px] font-bold text-[#14171F]">
                        {b.currency} — {b.bankName}
                      </span>
                    </div>
                    <span className="rounded bg-white px-2 py-0.5 text-[10.5px] font-semibold text-[#525866] border border-[#E3E6EC]">
                      {b.currency === "MAD" ? "RIB 24 chiffres" : `SWIFT: ${b.swiftBic}`}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-[#3F4654] tabular-nums">
                    {b.ribOrIban}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-3.5">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#2457F5]" />
              <h2 className="text-[15px] font-bold text-[#14171F]">
                Mentions légales par juridiction (FR / EN / AR)
              </h2>
            </div>

            <div className="space-y-2.5 text-[12px]">
              <div className="rounded-[12px] border border-[#E3E6EC] p-3">
                <p className="font-semibold text-[#14171F]">
                  Maroc — Franchise de TVA (FR)
                </p>
                <p className="mt-1 text-[#525866]">
                  {settings.legalMentionsJson.maFr}
                </p>
              </div>
              <div className="rounded-[12px] border border-[#E3E6EC] p-3">
                <p className="font-semibold text-[#14171F]">
                  Export hors Maroc — Services (EN)
                </p>
                <p className="mt-1 text-[#525866]">
                  {settings.legalMentionsJson.exportEn}
                </p>
              </div>
              <div
                dir="rtl"
                className="rounded-[12px] border border-[#E3E6EC] p-3 font-arabic text-right"
              >
                <p className="font-semibold text-[#14171F]">
                  المغرب — نظام المقاول الذاتي (AR RTL)
                </p>
                <p className="mt-1 text-[#525866]">
                  {settings.legalMentionsJson.maAr}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
