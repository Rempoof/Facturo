"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronUp,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Layers,
  Moon,
  Palette,
  ReceiptText,
  Settings,
  ShieldAlert,
  Smartphone,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { FacturoLogo } from "@/components/BrandPrimitives";
import {
  ScreenCreateDocument,
  type InitialComposerPreset,
} from "@/components/ScreenCreateDocument";
import {
  ScreenDocumentDetail,
  ScreenDocumentsList,
  type DocRow,
  type PaymentRow,
} from "@/components/ScreensDocsAndDashboard";
import {
  ScreenClients,
  ScreenProjectsAndCatalog,
  ScreenSettings,
  type FullCatalogRow,
  type FullClientRow,
  type FullProjectRow,
} from "@/components/ScreensManagement";
import {
  ScreenDeliverablesAndAudit,
  ScreenDesignSystem,
  ScreenMobile390,
  ScreenStatesAndAuth,
} from "@/components/ScreensSystemAndMobile";
import { ScreenDashboardHome } from "@/components/ScreenDashboardHome";
import {
  ScreenDeclarations,
  ScreenHelp,
  ScreenPayments,
} from "@/components/ScreensFinance";
import type { BankAccountConfig } from "@/db/schema";

export interface FacturoAppState {
  settings: {
    id: number;
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
    country: string;
    email: string;
    phone: string;
    annualCeilingMad: number;
    bankAccountsJson: BankAccountConfig[];
    numberingJson: Record<
      "devis" | "proforma" | "facture" | "acompte" | "avoir",
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
    signatureName: string;
    signatureRole: string;
  };
  clients: FullClientRow[];
  catalog: FullCatalogRow[];
  projects: FullProjectRow[];
  documents: DocRow[];
  payments: PaymentRow[];
}

type ActiveViewKey =
  | "dashboard"
  | "documents"
  | "create"
  | "detail"
  | "clients"
  | "projects"
  | "payments"
  | "declarations"
  | "settings"
  | "help"
  | "states"
  | "mobile"
  | "design-system"
  | "audit";

type DocFilter = "all" | "devis" | "facture";

export function FacturoWorkspace({
  initialState,
}: {
  initialState: FacturoAppState;
}) {
  const [appState, setAppState] = useState<FacturoAppState>(initialState);
  const [activeView, setActiveView] = useState<ActiveViewKey>("dashboard");
  const [docFilter, setDocFilter] = useState<DocFilter>("all");
  const [darkMode, setDarkMode] = useState(false);
  const [composerKey, setComposerKey] = useState<number>(1);
  const [composerPreset, setComposerPreset] = useState<InitialComposerPreset | undefined>(
    undefined
  );
  const [selectedDocId, setSelectedDocId] = useState<number>(
    initialState.documents[0]?.id || 1
  );
  const [openPayModalOnDetail, setOpenPayModalOnDetail] = useState<boolean>(false);

  const applyServerState = (next: unknown) => {
    if (next && typeof next === "object" && "documents" in next) {
      setAppState(next as FacturoAppState);
    }
  };

  const openComposerWithPreset = (preset?: InitialComposerPreset) => {
    setComposerPreset(preset);
    setComposerKey((k) => k + 1);
    setActiveView("create");
  };

  const openDocuments = (filter: DocFilter) => {
    setDocFilter(filter);
    setActiveView("documents");
  };

  const openDoc = (doc: DocRow, openPayment = false) => {
    setSelectedDocId(doc.id);
    setOpenPayModalOnDetail(openPayment);
    setActiveView("detail");
  };

  const convertDocument = async (doc: DocRow, target: "facture" | "avoir") => {
    const res = await fetch("/api/facturo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "duplicate_or_convert",
        sourceId: doc.id,
        targetType: target,
      }),
    });
    const next = await res.json();
    applyServerState(next);
    openDocuments(target === "facture" ? "facture" : "all");
  };

  const activeDoc = useMemo(
    () => appState.documents.find((d) => d.id === selectedDocId) || appState.documents[0],
    [appState.documents, selectedDocId]
  );

  const activeDocClient = useMemo(
    () =>
      appState.clients.find((c) => c.id === activeDoc?.clientId) || appState.clients[0],
    [activeDoc?.clientId, appState.clients]
  );

  const samplePreviewDataForMobile = useMemo(
    () => ({
      docType: "facture" as const,
      number: null,
      isLocked: false,
      language: "FR" as const,
      currency: "EUR" as const,
      exchangeRateToMad: 10.8,
      issueDate: "2026-11-04",
      dueDate: "2026-12-04",
      issuer: {
        fullName: appState.settings.fullName,
        tradeName: appState.settings.tradeName,
        address: appState.settings.address,
        city: appState.settings.city,
        ice: appState.settings.ice,
        autoEntrepreneurNumber: appState.settings.autoEntrepreneurNumber,
        email: appState.settings.email,
        signatureName: appState.settings.signatureName,
        signatureRole: appState.settings.signatureRole,
      },
      client: {
        name: appState.clients[1]?.name || appState.clients[0].name,
        contactName: appState.clients[1]?.contactName || "",
        address: appState.clients[1]?.address || "",
        city: appState.clients[1]?.city || "",
        countryCode: appState.clients[1]?.countryCode || "FR",
        countryName: appState.clients[1]?.countryName || "France",
        iceOrTaxId: appState.clients[1]?.iceOrTaxId || "",
        taxIdLabel: appState.clients[1]?.taxIdLabel || "TVA",
        email: appState.clients[1]?.email || "",
      },
      items: [
        {
          id: "mob-1",
          designation: "Architecture Design System AA (Exemple)",
          quantity: 1,
          unit: "forfait" as const,
          unitPrice: 2200,
          discountPct: 0,
        },
        {
          id: "mob-2",
          designation: "Maquettes Desktop & Mobile (Exemple)",
          quantity: 4,
          unit: "jour" as const,
          unitPrice: 550,
          discountPct: 5,
        },
      ],
      globalDiscountPct: 0,
      depositRequestedPct: 0,
      vatWording: appState.settings.legalMentionsJson.exportFr,
      legalMention: appState.settings.legalMentionsJson.exportFr,
      paymentMethod: "Virement SEPA / SWIFT",
      paymentTerms: "30 jours nets",
      bankAccount: appState.settings.bankAccountsJson[1],
      notes: "Données fictives d'illustration (Exemple).",
      showSignature: true,
    }),
    [appState.clients, appState.settings]
  );

  const initials = appState.settings.fullName
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const navItems: {
    key: ActiveViewKey;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    onClick: () => void;
    active: boolean;
  }[] = [
    {
      key: "dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      onClick: () => setActiveView("dashboard"),
      active: activeView === "dashboard",
    },
    {
      key: "documents",
      label: "Devis",
      icon: FileText,
      onClick: () => openDocuments("devis"),
      active: activeView === "documents" && docFilter === "devis",
    },
    {
      key: "documents",
      label: "Factures",
      icon: ReceiptText,
      onClick: () => openDocuments("facture"),
      active: activeView === "documents" && docFilter === "facture",
    },
    {
      key: "clients",
      label: "Clients",
      icon: Users,
      onClick: () => setActiveView("clients"),
      active: activeView === "clients",
    },
    {
      key: "projects",
      label: "Projets",
      icon: FolderKanban,
      onClick: () => setActiveView("projects"),
      active: activeView === "projects",
    },
    {
      key: "payments",
      label: "Paiements",
      icon: Wallet,
      onClick: () => setActiveView("payments"),
      active: activeView === "payments",
    },
    {
      key: "declarations",
      label: "Déclarations",
      icon: ReceiptText,
      onClick: () => setActiveView("declarations"),
      active: activeView === "declarations",
    },
  ];

  const planches: { label: string; icon: React.ComponentType<{ className?: string }>; view: ActiveViewKey }[] = [
    { label: "Design system", icon: Palette, view: "design-system" },
    { label: "Mobile 390px", icon: Smartphone, view: "mobile" },
    { label: "États & erreurs", icon: ShieldAlert, view: "states" },
    { label: "Planches PNG", icon: Layers, view: "audit" },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <ScreenDashboardHome
            documents={appState.documents}
            payments={appState.payments}
            clients={appState.clients}
            projects={appState.projects}
            settings={{
              fullName: appState.settings.fullName,
              annualCeilingMad: appState.settings.annualCeilingMad,
              activityCategory: appState.settings.activityCategory,
            }}
            onOpenDoc={openDoc}
            onConvertDoc={(doc, target) => {
              void convertDocument(doc, target === "avoir" ? "avoir" : "facture");
            }}
            onCreateDoc={(type) => openComposerWithPreset({ docType: type })}
            onGoDocuments={(type) => openDocuments(type)}
            onGoSettings={() => setActiveView("settings")}
            onGoDeclarations={() => setActiveView("declarations")}
          />
        );
      case "documents":
        return (
          <ScreenDocumentsList
            key={docFilter}
            documents={appState.documents}
            clients={appState.clients}
            initialTypeFilter={docFilter}
            onSelectDoc={openDoc}
            onCreateNew={() => openComposerWithPreset(undefined)}
            onMutateState={applyServerState}
          />
        );
      case "create":
        return (
          <ScreenCreateDocument
            key={composerKey}
            settings={appState.settings}
            clients={appState.clients}
            projects={appState.projects}
            catalog={appState.catalog}
            preset={composerPreset}
            onDocumentSaved={(nextState) => applyServerState(nextState)}
          />
        );
      case "detail":
        return activeDoc && activeDocClient ? (
          <ScreenDocumentDetail
            key={`${activeDoc.id}-${openPayModalOnDetail ? "pay" : "view"}`}
            doc={activeDoc}
            client={activeDocClient}
            settings={appState.settings}
            payments={appState.payments}
            defaultOpenPayModal={openPayModalOnDetail}
            onBack={() => openDocuments("all")}
            onMutateState={applyServerState}
          />
        ) : null;
      case "clients":
        return (
          <ScreenClients
            clients={appState.clients}
            documents={appState.documents}
            onSelectDoc={(doc) => openDoc(doc)}
            onCreateQuoteForClient={(cl) =>
              openComposerWithPreset({
                docType: "devis",
                clientId: cl.id,
                currency: cl.defaultCurrency as never,
                language: cl.preferredLanguage as never,
              })
            }
            onMutateState={applyServerState}
          />
        );
      case "projects":
        return (
          <ScreenProjectsAndCatalog
            projects={appState.projects}
            clients={appState.clients}
            catalog={appState.catalog}
            onCreateQuoteFromProject={(proj, taskItems) =>
              openComposerWithPreset({
                docType: "devis",
                clientId: proj.clientId,
                projectId: proj.id,
                currency: proj.currency as never,
                items: taskItems,
              })
            }
            onMutateState={applyServerState}
          />
        );
      case "payments":
        return (
          <ScreenPayments
            payments={appState.payments}
            documents={appState.documents}
            clients={appState.clients}
            onOpenDoc={(doc) => openDoc(doc)}
          />
        );
      case "declarations":
        return (
          <ScreenDeclarations
            payments={appState.payments}
            settings={appState.settings}
            onGoSettings={() => setActiveView("settings")}
          />
        );
      case "settings":
        return <ScreenSettings settings={appState.settings} onMutateState={applyServerState} />;
      case "help":
        return <ScreenHelp />;
      case "states":
        return (
          <ScreenStatesAndAuth
            onCreateClient={() => setActiveView("clients")}
            onCreateDoc={() => openComposerWithPreset(undefined)}
          />
        );
      case "mobile":
        return <ScreenMobile390 samplePreviewData={samplePreviewDataForMobile} />;
      case "design-system":
        return <ScreenDesignSystem />;
      case "audit":
        return (
          <ScreenDeliverablesAndAudit
            onJumpToScreen={(target) => setActiveView(target as ActiveViewKey)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={darkMode ? "facturo-dark min-h-screen bg-[#0B0F14]" : "min-h-screen bg-[#F7F8FA]"}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] bg-white">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col justify-between border-r border-[#E3E6EC] bg-white px-4 py-5 lg:flex">
          <div>
            <div className="px-2">
              <FacturoLogo />
            </div>

            <nav aria-label="Navigation principale" className="mt-6 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    aria-current={item.active ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors ${
                      item.active
                        ? "bg-white font-semibold text-[#14171F] shadow-[0_1px_3px_rgba(20,23,31,0.10)]"
                        : "font-medium text-[#3F4654] hover:bg-[#F7F8FA] hover:text-[#14171F]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${item.active ? "text-[#14171F]" : "text-[#667085]"}`}
                      strokeWidth={1.8}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveView("help")}
              className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] ${
                activeView === "help"
                  ? "bg-white font-semibold text-[#14171F] shadow-[0_1px_3px_rgba(20,23,31,0.10)]"
                  : "font-medium text-[#3F4654] hover:bg-[#F7F8FA]"
              }`}
            >
              <HelpCircle className="h-4 w-4 text-[#667085]" strokeWidth={1.8} />
              Aide et support
            </button>

            <button
              type="button"
              onClick={() => setActiveView("settings")}
              className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] ${
                activeView === "settings"
                  ? "bg-white font-semibold text-[#14171F] shadow-[0_1px_3px_rgba(20,23,31,0.10)]"
                  : "font-medium text-[#3F4654] hover:bg-[#F7F8FA]"
              }`}
            >
              <Settings className="h-4 w-4 text-[#667085]" strokeWidth={1.8} />
              Paramètres
            </button>

            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="flex items-center gap-3 text-[13px] font-medium text-[#3F4654]">
                {darkMode ? (
                  <Moon className="h-4 w-4 text-[#667085]" strokeWidth={1.8} />
                ) : (
                  <Sun className="h-4 w-4 text-[#667085]" strokeWidth={1.8} />
                )}
                Mode sombre
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                aria-label="Activer le mode sombre"
                onClick={() => setDarkMode((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  darkMode ? "bg-[#2457F5]" : "bg-[#E3E6EC]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-[18px]" : "translate-x-[3px]"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 border-t border-[#F0F2F5] pt-3">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
                Planches
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-1">
                {planches.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setActiveView(p.view)}
                      className={`flex items-center gap-1.5 rounded-[9px] px-2 py-1.5 text-[10.5px] font-medium ${
                        activeView === p.view
                          ? "bg-[#EEF3FF] text-[#1B45C9]"
                          : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#14171F]"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => openComposerWithPreset(undefined)}
                className="mt-1 w-full rounded-[9px] px-2 py-1.5 text-left text-[10.5px] font-medium text-[#667085] hover:bg-[#F7F8FA] hover:text-[#14171F]"
              >
                Créer un document (formulaire)
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 rounded-[14px] border border-[#E3E6EC] bg-white px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F3D3A] text-[11px] font-bold text-[#BFF0D4]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#14171F]">
                    {appState.settings.fullName.replace(/\s*\(.*?\)\s*/g, "")}
                  </p>
                  <p className="truncate text-[10.5px] text-[#667085]">
                    {appState.settings.email}
                  </p>
                </div>
              </div>
              <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Compact mobile nav */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E3E6EC] bg-white px-4 py-3 lg:hidden">
            <FacturoLogo size={28} />
            <select
              aria-label="Navigation"
              value={activeView}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "devis") openDocuments("devis");
                else if (value === "facture") openDocuments("facture");
                else setActiveView(value as ActiveViewKey);
              }}
              className="rounded-[10px] border border-[#E3E6EC] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#14171F]"
            >
              <option value="dashboard">Tableau de bord</option>
              <option value="devis">Devis</option>
              <option value="facture">Factures</option>
              <option value="clients">Clients</option>
              <option value="projects">Projets</option>
              <option value="payments">Paiements</option>
              <option value="declarations">Déclarations</option>
              <option value="settings">Paramètres</option>
              <option value="help">Aide et support</option>
            </select>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
