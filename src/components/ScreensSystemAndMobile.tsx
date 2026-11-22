"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  Eye,
  FilePlus2,
  FileText,
  FolderKanban,
  Globe,
  Hash,
  LayoutDashboard,
  Lock,
  LogIn,
  Mail,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import {
  CountryFlag,
  FacturoLogo,
  formatAmount,
  IssuerEmblem,
  NotchedField,
  StatusBadge,
} from "@/components/BrandPrimitives";
import {
  DocumentPaperPreview,
  type PreviewDocumentData,
} from "@/components/DocumentPaperPreview";

/* ============================================================================
   SCREEN 8 — LOGIN / REGISTER + EMPTY STATES + VALIDATION ERROR STATE
   ============================================================================ */
export function ScreenStatesAndAuth({
  onCreateClient,
  onCreateDoc,
}: {
  onCreateClient: () => void;
  onCreateDoc: () => void;
}) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6">
      <div>
        <p className="text-[12px] font-medium text-[#667085]">
          Écran 8 • Authentification mono-utilisateur, États vides & Validation accessible AA
        </p>
        <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
          Connexion, États vides & Gestion des erreurs
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Auth Card (Single-User Moroccan Auto-Entrepreneur) */}
        <div className="lg:col-span-5 rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-5">
          <div className="flex items-center justify-between">
            <FacturoLogo />
            <div className="inline-flex rounded-[10px] bg-[#F3F4F6] p-1 text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`rounded-[8px] px-3 py-1 ${
                  authMode === "login"
                    ? "bg-white text-[#14171F] shadow-xs"
                    : "text-[#667085]"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`rounded-[8px] px-3 py-1 ${
                  authMode === "register"
                    ? "bg-white text-[#14171F] shadow-xs"
                    : "text-[#667085]"
                }`}
              >
                Inscription AE
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-[#14171F]">
              {authMode === "login"
                ? "Accéder à votre espace Auto-Entrepreneur"
                : "Créer votre compte Facturo Maroc"}
            </h2>
            <p className="mt-1 text-[12.5px] text-[#667085]">
              {authMode === "login"
                ? "Application mono-utilisateur sécurisée pour vos devis et factures."
                : "Configurez votre ICE et votre plafond annuel en moins de 2 minutes."}
            </p>
          </div>

          <div className="space-y-3.5">
            {authMode === "register" && (
              <NotchedField label="Nom & Prénom (Titulaire AE)" required>
                <input
                  type="text"
                  defaultValue="Youssef El Amrani (Exemple)"
                  className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
                />
              </NotchedField>
            )}
            <NotchedField label="Adresse e-mail professionnelle" required focused>
              <input
                type="email"
                defaultValue="youssef.sample@atelier-exemple.ma"
                className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
              />
            </NotchedField>
            <NotchedField label="Mot de passe" required>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full bg-transparent text-[13px] font-medium focus:outline-none"
              />
            </NotchedField>
            {authMode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <NotchedField label="ICE (15 chiffres)" required>
                  <input
                    type="text"
                    defaultValue="000000000000099"
                    className="w-full bg-transparent text-[13px] font-medium tabular-nums focus:outline-none"
                  />
                </NotchedField>
                <NotchedField label="Activité AE">
                  <select
                    aria-label="Activité AE"
                    className="w-full bg-transparent text-[12.5px] font-medium focus:outline-none"
                  >
                    <option>Services (200k MAD)</option>
                    <option>Commerce (500k MAD)</option>
                  </select>
                </NotchedField>
              </div>
            )}

            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#2457F5] py-2.5 text-[13px] font-semibold text-white hover:bg-[#1B45C9]"
            >
              <LogIn className="h-4 w-4" />
              <span>
                {authMode === "login"
                  ? "Se connecter à Facturo"
                  : "Activer mon espace Facturo"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Empty States + Validation Error State */}
        <div className="lg:col-span-7 space-y-5">
          {/* 2 Empty States side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Empty State 1: No Clients */}
            <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 text-center flex flex-col items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F3F4F6] text-[#3F4654]">
                <Users className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="mt-4">
                <h3 className="text-[15px] font-bold text-[#14171F]">
                  Aucun client enregistré
                </h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#667085]">
                  Ajoutez votre premier client au Maroc (ICE) ou à l&apos;étranger
                  (EUR, CHF, USD) pour pré-remplir vos documents.
                </p>
              </div>
              <button
                type="button"
                onClick={onCreateClient}
                className="mt-5 inline-flex items-center gap-1.5 rounded-[12px] bg-[#2457F5] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#1B45C9]"
              >
                <UserPlus className="h-4 w-4" />
                <span>Ajouter un premier client</span>
              </button>
            </div>

            {/* Empty State 2: No Documents Yet */}
            <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 text-center flex flex-col items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#0F3D3A]/10 text-[#0F3D3A]">
                <FileText className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="mt-4">
                <h3 className="text-[15px] font-bold text-[#14171F]">
                  Aucun document pour le moment
                </h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#667085]">
                  Créez un devis, une proforma ou votre première facture en FR,
                  EN ou Arabe (RTL) avec aperçu A4 immédiat.
                </p>
              </div>
              <button
                type="button"
                onClick={onCreateDoc}
                className="mt-5 inline-flex items-center gap-1.5 rounded-[12px] bg-[#0F3D3A] px-4 py-2 text-[12.5px] font-semibold text-[#BFF0D4] hover:opacity-95"
              >
                <FilePlus2 className="h-4 w-4" />
                <span>Créer mon premier document</span>
              </button>
            </div>
          </div>

          {/* Validation Error State Card (WCAG AA: icon + border + explicit copy, never color alone) */}
          <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#14171F]">
                État d&apos;erreur de validation (Accessible WCAG AA)
              </h3>
              <span className="rounded-full bg-[#FDE3E3] px-2.5 py-1 text-[11px] font-semibold text-[#A31D1D]">
                Icône + Libellé explicite + Contraste 7.1:1
              </span>
            </div>

            <div
              role="alert"
              className="flex items-start gap-3 rounded-[12px] border border-[#A31D1D]/35 bg-[#FDE3E3] p-3.5 text-[12.5px] text-[#A31D1D]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.2} />
              <div>
                <p className="font-bold">
                  Impossible d&apos;émettre et verrouiller la facture (3 erreurs détectées)
                </p>
                <p className="mt-0.5 text-[12px]">
                  Corrigez les champs ci-dessous avant l&apos;attribution du numéro séquentiel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <NotchedField
                label="ICE du client marocain"
                required
                error="L'ICE doit comporter exactement 15 chiffres."
              >
                <input
                  type="text"
                  defaultValue="00159900 (Incomplet)"
                  aria-invalid="true"
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#A31D1D] tabular-nums focus:outline-none"
                />
              </NotchedField>

              <NotchedField
                label="Date d'échéance"
                required
                error="Antérieure à la date d'émission (10/03/2026)."
              >
                <input
                  type="date"
                  defaultValue="2026-02-01"
                  aria-invalid="true"
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#A31D1D] tabular-nums focus:outline-none"
                />
              </NotchedField>

              <NotchedField
                label="Prix unitaire HT (EUR)"
                required
                error="Saisissez un montant strictement positif."
              >
                <input
                  type="text"
                  defaultValue="0,00"
                  aria-invalid="true"
                  className="w-full bg-transparent text-[12.5px] font-medium text-[#A31D1D] tabular-nums focus:outline-none"
                />
              </NotchedField>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SCREEN 9 — MOBILE 390PX (DASHBOARD + CREATE DOCUMENT WITH FORM / PREVIEW TABS)
   ============================================================================ */
export function ScreenMobile390({
  samplePreviewData,
}: {
  samplePreviewData: PreviewDocumentData;
}) {
  const [mobileComposerTab, setMobileComposerTab] = useState<"form" | "preview">(
    "form"
  );

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Écran 9 • Adaptation responsive iPhone / Android (Largeur exacte 390px)
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Vues Mobiles 390px : Tableau de bord & Création (Onglets Formulaire / Aperçu)
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E3E6EC] px-3 py-1.5 text-[12px] font-semibold text-[#14171F]">
          <Smartphone className="h-4 w-4 text-[#2457F5]" />
          2 écrans 390px côte à côte interactifs
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-10 py-2">
        {/* MOBILE FRAME 1: 390px DASHBOARD */}
        <div className="w-[390px] shrink-0 overflow-hidden rounded-[34px] border-[6px] border-[#14171F] bg-[#F3F4F6] shadow-[0_24px_60px_rgba(20,23,31,0.16)]">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-white px-5 pt-3 pb-2 text-[11px] font-semibold text-[#14171F] tabular-nums">
            <span>09:41</span>
            <span className="h-1.5 w-16 rounded-full bg-[#14171F]" />
            <span>5G • 100%</span>
          </div>

          {/* Mobile App Header */}
          <div className="flex items-center justify-between border-b border-[#E3E6EC] bg-white px-4 py-3">
            <FacturoLogo />
            <span className="rounded-full bg-[#DDF5E6] px-2.5 py-1 text-[10.5px] font-bold text-[#0B6B3A]">
              AE 2026
            </span>
          </div>

          {/* Mobile Dashboard Body */}
          <div className="p-4 space-y-3.5">
            {/* Ceiling Card */}
            <div className="rounded-[18px] bg-[#0F3D3A] p-4 text-white">
              <div className="flex items-center justify-between text-[11px] text-[#BFF0D4]">
                <span>Plafond Auto-Entrepreneur</span>
                <span className="font-bold tabular-nums">71,4%</span>
              </div>
              <p className="mt-1.5 text-[20px] font-bold tabular-nums">
                142 800,00 MAD
              </p>
              <p className="text-[11px] text-white/75 tabular-nums">
                sur 200 000,00 MAD • Reste 57 200 MAD
              </p>
              <div className="mt-3 h-2.5 w-full rounded-full bg-white/15 overflow-hidden">
                <div className="h-full w-[71.4%] rounded-full bg-[#BFF0D4]" />
              </div>
            </div>

            {/* 2 Compact KPIs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-[16px] border border-[#E3E6EC] bg-white p-3.5">
                <p className="text-[11px] text-[#667085]">En attente</p>
                <p className="mt-1 text-[15px] font-bold text-[#14171F] tabular-nums">
                  52 866 MAD
                </p>
              </div>
              <div className="rounded-[16px] border border-[#E3E6EC] bg-white p-3.5">
                <p className="text-[11px] text-[#667085]">En retard</p>
                <p className="mt-1 text-[15px] font-bold text-[#A31D1D] tabular-nums">
                  12 600 MAD
                </p>
              </div>
            </div>

            {/* Recent Mobile Cards */}
            <div className="rounded-[18px] border border-[#E3E6EC] bg-white p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-bold text-[#14171F]">
                  Documents récents
                </p>
                <span className="text-[11px] font-semibold text-[#2457F5]">
                  Voir tout
                </span>
              </div>

              {[
                {
                  num: "FAC-2026-0018",
                  cl: "Maison Lumière (Exemple)",
                  amt: "4 895,00 EUR",
                  st: "sent",
                  flag: "FR",
                },
                {
                  num: "FAC-2026-0017",
                  cl: "Koutoubia SARL (Exemple)",
                  amt: "44 000,00 MAD",
                  st: "paid",
                  flag: "MA",
                },
                {
                  num: "FAC-2026-0015",
                  cl: "Koutoubia SARL (Exemple)",
                  amt: "12 600,00 MAD",
                  st: "overdue",
                  flag: "MA",
                },
              ].map((row) => (
                <div
                  key={row.num}
                  className="flex items-center justify-between rounded-[12px] border border-[#ECEEF2] p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <CountryFlag code={row.flag} size={16} />
                    <div>
                      <p className="text-[12px] font-bold text-[#14171F] tabular-nums">
                        {row.num}
                      </p>
                      <p className="text-[10.5px] text-[#667085]">{row.cl}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11.5px] font-bold text-[#14171F] tabular-nums mb-1">
                      {row.amt}
                    </p>
                    <StatusBadge status={row.st} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Bottom Tab Bar */}
          <div className="grid grid-cols-4 border-t border-[#E3E6EC] bg-white py-2.5 text-center text-[10px] font-medium text-[#667085]">
            <div className="flex flex-col items-center gap-1 text-[#2457F5] font-semibold">
              <LayoutDashboard className="h-4 w-4" />
              <span>Accueil</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Clients</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Réglages</span>
            </div>
          </div>
        </div>

        {/* MOBILE FRAME 2: 390px CREATE DOCUMENT (FORM & PREVIEW AS TABS) */}
        <div className="w-[390px] shrink-0 overflow-hidden rounded-[34px] border-[6px] border-[#14171F] bg-[#F3F4F6] shadow-[0_24px_60px_rgba(20,23,31,0.16)]">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-white px-5 pt-3 pb-2 text-[11px] font-semibold text-[#14171F] tabular-nums">
            <span>09:41</span>
            <span className="h-1.5 w-16 rounded-full bg-[#14171F]" />
            <span>5G • 100%</span>
          </div>

          {/* Top Header + Form | Preview Tabs */}
          <div className="border-b border-[#E3E6EC] bg-white px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#14171F]">
                Créer une facture
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#E8EAEE] px-2 py-0.5 text-[10px] font-semibold text-[#3F4654]">
                <Lock className="h-2.5 w-2.5" /> FAC-2026-0019
              </span>
            </div>

            {/* Interactive Form / Preview Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-[12px] bg-[#F3F4F6] p-1">
              <button
                type="button"
                onClick={() => setMobileComposerTab("form")}
                className={`rounded-[9px] py-1.5 text-[12px] font-semibold transition-all ${
                  mobileComposerTab === "form"
                    ? "bg-white text-[#14171F] shadow-xs"
                    : "text-[#667085]"
                }`}
              >
                Formulaire
              </button>
              <button
                type="button"
                onClick={() => setMobileComposerTab("preview")}
                className={`rounded-[9px] py-1.5 text-[12px] font-semibold transition-all ${
                  mobileComposerTab === "preview"
                    ? "bg-white text-[#2457F5] shadow-xs"
                    : "text-[#667085]"
                }`}
              >
                Aperçu A4 (Live)
              </button>
            </div>
          </div>

          {mobileComposerTab === "form" ? (
            <div className="bg-white p-4 space-y-3">
              {/* Doc Type Scroll Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
                {["Devis", "Proforma", "Facture", "Acompte", "Avoir"].map(
                  (t, idx) => (
                    <span
                      key={t}
                      className={`shrink-0 rounded-[9px] px-2.5 py-1 ${
                        idx === 2
                          ? "bg-[#14171F] text-white"
                          : "bg-[#F3F4F6] text-[#667085]"
                      }`}
                    >
                      {t}
                    </span>
                  )
                )}
              </div>

              <NotchedField label="Client" required focused>
                <div className="flex items-center gap-2 text-[12.5px] font-semibold">
                  <CountryFlag code="FR" size={18} />
                  <span>Maison Lumière SAS (Exemple)</span>
                </div>
              </NotchedField>

              <div className="grid grid-cols-2 gap-2.5">
                <NotchedField label="Devise" required>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                    <CountryFlag code="EUR" size={16} />
                    <span>EUR (10,80)</span>
                  </div>
                </NotchedField>
                <NotchedField label="Langue PDF">
                  <span className="text-[12px] font-semibold text-[#2457F5]">
                    FR • Français
                  </span>
                </NotchedField>
              </div>

              <div className="rounded-[16px] border border-[#E3E6EC] p-3 space-y-2">
                <div className="flex items-center justify-between text-[11.5px] font-bold">
                  <span>Ligne 1 • Design System AA</span>
                  <span className="tabular-nums">2 200,00 EUR</span>
                </div>
                <p className="text-[11px] text-[#667085] tabular-nums">
                  1 forfait × 2 200,00 EUR • TVA 0% (Art. 89 CGI)
                </p>
              </div>

              <div className="rounded-[12px] bg-[#F3F4F6] p-3 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#14171F]">
                  Total net à payer
                </span>
                <div className="text-right tabular-nums">
                  <p className="font-bold text-[#14171F]">4 290,00 EUR</p>
                  <p className="text-[10px] font-semibold text-[#0F3D3A]">
                    ≈ 46 332,00 MAD
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#F3F4F6] max-h-[430px] overflow-y-auto">
              <DocumentPaperPreview data={samplePreviewData} compact />
            </div>
          )}

          {/* Sticky Mobile Action Footer */}
          <div className="grid grid-cols-2 gap-2 border-t border-[#E3E6EC] bg-white p-3">
            <button
              type="button"
              className="rounded-[12px] border border-[#E3E6EC] py-2.5 text-[12px] font-semibold text-[#14171F]"
            >
              Brouillon
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-[#2457F5] py-2.5 text-[12px] font-semibold text-white"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Émettre</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ONE-PAGE DESIGN SYSTEM SHEET (ALL TOKENS + COMPONENT STATES MATRIX)
   ============================================================================ */
export function ScreenDesignSystem() {
  const brandSwatches = [
    { name: "Ink (Primary Text)", hex: "#14171F", contrast: "16.8:1 on White" },
    { name: "Electric Blue (Primary)", hex: "#2457F5", contrast: "5.4:1 AA on White" },
    { name: "Electric Blue Hover", hex: "#1B45C9", contrast: "7.6:1 AAA on White" },
    { name: "Deep Green (AE Brand)", hex: "#0F3D3A", contrast: "11.9:1 AAA on White" },
    { name: "Mint Accent", hex: "#BFF0D4", contrast: "10.2:1 on #0F3D3A" },
    { name: "App Stage Background", hex: "#F3F4F6", contrast: "Surface Stage" },
    { name: "Outer Window Frame", hex: "#E4E6EA", contrast: "Viewport Canvas" },
    { name: "Card Hairline Border", hex: "#E3E6EC", contrast: "1px Card Stroke" },
  ];

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            Design System Sheet • Tokens, Échelle Typographique, Rayons & États Interactifs
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
            Facturo — Planche du Design System (1 page)
          </h1>
        </div>
        <FacturoLogo />
      </div>

      {/* 1. COLOR TOKENS & STATUS BADGES */}
      <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-5">
        <h2 className="text-[15px] font-bold text-[#14171F]">
          1. Tokens de Couleurs & Badges Sémantiques (Contraste WCAG AA vérifié)
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {brandSwatches.map((s) => (
            <div
              key={s.hex}
              className="rounded-[14px] border border-[#E3E6EC] p-2.5 bg-white"
            >
              <div
                style={{ backgroundColor: s.hex }}
                className="h-12 w-full rounded-[10px] border border-black/8"
              />
              <p className="mt-2 text-[11.5px] font-bold text-[#14171F]">
                {s.name}
              </p>
              <p className="text-[11px] font-mono text-[#525866]">{s.hex}</p>
              <p className="text-[10px] text-[#667085]">{s.contrast}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#F0F2F5] pt-4">
          <span className="text-[12px] font-semibold text-[#525866]">
            Badges de statut (Icône + Texte + Couleur) :
          </span>
          <StatusBadge status="paid" />
          <span className="text-[11px] font-mono text-[#667085]">
            #DDF5E6 / #0B6B3A
          </span>
          <StatusBadge status="sent" />
          <span className="text-[11px] font-mono text-[#667085]">
            #E4EBFF / #1B45C9
          </span>
          <StatusBadge status="pending" />
          <span className="text-[11px] font-mono text-[#667085]">
            #FFF0D6 / #8A4B00
          </span>
          <StatusBadge status="overdue" />
          <span className="text-[11px] font-mono text-[#667085]">
            #FDE3E3 / #A31D1D
          </span>
          <StatusBadge status="draft" />
          <span className="text-[11px] font-mono text-[#667085]">
            #E8EAEE / #3F4654
          </span>
        </div>
      </section>

      {/* 2. TYPOGRAPHY (INTER + IBM PLEX SANS ARABIC) & SPACING / RADII / ICONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-4">
          <h2 className="text-[15px] font-bold text-[#14171F]">
            2. Échelle Typographique : Inter (Latin) & IBM Plex Sans Arabic (RTL)
          </h2>
          <div className="divide-y divide-[#F0F2F5] text-[#14171F]">
            <div className="py-2.5 flex items-baseline justify-between">
              <span className="text-[22px] font-bold tracking-[-0.02em]">
                Page Title / KPI — 22px Bold (-0.02em)
              </span>
              <span className="text-[11px] font-mono text-[#667085]">
                Inter 700 • 142 800,00 MAD
              </span>
            </div>
            <div className="py-2.5 flex items-baseline justify-between">
              <span className="text-[16px] font-semibold">
                Section Heading — 16px SemiBold
              </span>
              <span className="text-[11px] font-mono text-[#667085]">
                Inter 600
              </span>
            </div>
            <div className="py-2.5 flex items-baseline justify-between">
              <span className="text-[13px] font-normal text-[#3F4654]">
                Body & Form Control — 13px Regular / Medium (tabular-nums)
              </span>
              <span className="text-[11px] font-mono text-[#667085]">
                Inter 400/500
              </span>
            </div>
            <div
              dir="rtl"
              className="py-3 flex items-baseline justify-between font-arabic"
            >
              <span className="text-[17px] font-bold text-[#14171F]">
                فاتورة المقاول الذاتي — خط IBM Plex Sans Arabic (RTL)
              </span>
              <span className="text-[11px] font-mono text-[#667085]" dir="ltr">
                IBM Plex Sans Arabic 400–700
              </span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-4">
          <h2 className="text-[15px] font-bold text-[#14171F]">
            3. Rayons, Ombres & Jeu d&apos;icônes Outline (Sans Emoji)
          </h2>
          <div className="grid grid-cols-3 gap-2.5 text-[11.5px]">
            <div className="rounded-[20px] border border-[#E3E6EC] bg-[#F8F9FB] p-3 text-center">
              <p className="font-bold">18–20px</p>
              <p className="text-[#667085]">Cartes & Modales</p>
            </div>
            <div className="rounded-[12px] border border-[#E3E6EC] bg-[#F8F9FB] p-3 text-center">
              <p className="font-bold">12px</p>
              <p className="text-[#667085]">Inputs & Boutons</p>
            </div>
            <div className="rounded-[12px] border border-[#E3E6EC] bg-white p-3 text-center shadow-[0_14px_32px_rgba(20,23,31,0.10)]">
              <p className="font-bold">Floating</p>
              <p className="text-[#667085]">Ombre douce</p>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[#525866] mb-2">
              Icônes Outline cohérentes (trait 1.75px) + Drapeaux SVG :
            </p>
            <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-[#F8F9FB] p-3 text-[#14171F]">
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
              <FileText className="h-4 w-4" strokeWidth={1.75} />
              <Users className="h-4 w-4" strokeWidth={1.75} />
              <FolderKanban className="h-4 w-4" strokeWidth={1.75} />
              <Banknote className="h-4 w-4" strokeWidth={1.75} />
              <Lock className="h-4 w-4" strokeWidth={1.75} />
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
              <Send className="h-4 w-4" strokeWidth={1.75} />
              <CountryFlag code="MA" size={18} />
              <CountryFlag code="EUR" size={18} />
              <CountryFlag code="CHF" size={18} />
              <CountryFlag code="USD" size={18} />
            </div>
          </div>
        </section>
      </div>

      {/* 4. COMPONENT MATRIX ACROSS ALL 5 INTERACTION STATES */}
      <section className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-5">
        <h2 className="text-[15px] font-bold text-[#14171F]">
          4. Matrice des Composants : Normal • Hover • Focus • Disabled • Error
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#E3E6EC] text-[11px] font-bold uppercase text-[#667085]">
                <th className="py-2.5 pr-4">Composant</th>
                <th className="py-2.5 px-3">Normal</th>
                <th className="py-2.5 px-3">Hover</th>
                <th className="py-2.5 px-3">Focus (AA Ring)</th>
                <th className="py-2.5 px-3">Disabled</th>
                <th className="py-2.5 pl-3">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {/* Primary Button */}
              <tr>
                <td className="py-4 pr-4 font-bold text-[#14171F]">
                  Bouton Primaire
                </td>
                <td className="py-4 px-3">
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#2457F5] px-3.5 py-2 font-semibold text-white">
                    Émettre
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#1B45C9] px-3.5 py-2 font-semibold text-white">
                    Émettre
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#2457F5] px-3.5 py-2 font-semibold text-white ring-2 ring-[#2457F5] ring-offset-2">
                    Émettre
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#2457F5]/40 px-3.5 py-2 font-semibold text-white cursor-not-allowed">
                    Émettre
                  </span>
                </td>
                <td className="py-4 pl-3">
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#A31D1D] px-3.5 py-2 font-semibold text-white">
                    <AlertCircle className="h-3.5 w-3.5" /> Échec envoi
                  </span>
                </td>
              </tr>

              {/* Text Input */}
              <tr>
                <td className="py-4 pr-4 font-bold text-[#14171F]">
                  Input Texte
                </td>
                <td className="py-4 px-3">
                  <div className="rounded-[12px] border border-[#E3E6EC] px-3 py-2 text-[#14171F]">
                    Koutoubia SARL
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="rounded-[12px] border border-[#B8C0CC] px-3 py-2 text-[#14171F]">
                    Koutoubia SARL
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="rounded-[12px] border border-[#2457F5] ring-2 ring-[#2457F5]/15 px-3 py-2 text-[#14171F]">
                    Koutoubia SARL|
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="rounded-[12px] border border-[#E3E6EC] bg-[#F3F4F6] px-3 py-2 text-[#98A2B3]">
                    FAC-2026-0018
                  </div>
                </td>
                <td className="py-4 pl-3">
                  <div className="rounded-[12px] border border-[#A31D1D] bg-[#FDE3E3]/25 px-3 py-2 text-[#A31D1D] flex items-center justify-between">
                    <span>ICE invalide</span>
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                </td>
              </tr>

              {/* Select with Flag & Money Input */}
              <tr>
                <td className="py-4 pr-4 font-bold text-[#14171F]">
                  Select Drapeau & Montant
                </td>
                <td className="py-4 px-3">
                  <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] px-3 py-2 font-medium">
                    <CountryFlag code="EUR" size={16} />
                    <span>4 500,00 EUR</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#B8C0CC] bg-[#F8F9FB] px-3 py-2 font-medium">
                    <CountryFlag code="EUR" size={16} />
                    <span>4 500,00 EUR</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#2457F5] ring-2 ring-[#2457F5]/15 px-3 py-2 font-semibold">
                    <CountryFlag code="MAD" size={16} />
                    <span>48 600,00 MAD</span>
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#E3E6EC] bg-[#F3F4F6] px-3 py-2 text-[#98A2B3]">
                    <CountryFlag code="CHF" size={16} />
                    <span>Verrouillé</span>
                  </div>
                </td>
                <td className="py-4 pl-3">
                  <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#A31D1D] bg-[#FDE3E3]/25 px-3 py-2 text-[#A31D1D] font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>-120,00 MAD</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
   REFERENCE AUDIT (KEEP VS DROP) + MOCKUPS GALLERY & SPEC SUMMARY
   ============================================================================ */
export function ScreenDeliverablesAndAudit({
  onJumpToScreen,
}: {
  onJumpToScreen: (screenKey: string) => void;
}) {
  const keepItems = [
    "Structure 3 colonnes en 1440px : barre latérale gauche (~230px) + formulaire central sur fond blanc + scène grise (#F3F4F6) à droite avec aperçu A4 en direct.",
    "Champs à étiquette encochée (Notched Labels) rayon 12px, bordure active #2457F5 et espacement aéré.",
    "Cartes de lignes repliables (« Item 1 » -> « Ligne 1 ») rayon 18px avec actions rapides supprimer / plier.",
    "En-tête d'aperçu à droite : bascule « Email | PDF », bouton secondaire « Enregistrer le brouillon » et CTA primaire bleu « Émettre et envoyer ».",
    "Effet de feuille A4 posée avec contre-feuille subtilement inclinée, médaillon circulaire vert profond (#0F3D3A + #BFF0D4) en haut à droite et bloc signature en bas à droite.",
  ];

  const dropItems = [
    "Navigation hors-périmètre supprimée : « Wallet », « Transactions », « Budgeting » et « Reports » sont retirés (remplacés par Documents, Clients, Projets/Missions, Paramètres).",
    "Interrupteur « Dark Mode » supprimé de la barre latérale (non prévu dans le produit Facturo).",
    "Onglets « Standard | Split | Recurring » remplacés par les 5 types légaux : Devis | Proforma | Facture | Facture d'acompte | Avoir.",
    "Champ éditable « Full Name* » de l'émetteur retiré du formulaire par document (Facturo est mono-utilisateur : l'identité, l'ICE et le N° AE proviennent des Paramètres).",
    "Colonne « Tax 10% » par ligne remplacée par Unité + Remise %, avec gestion globale du régime Franchise de TVA Auto-Entrepreneur (Art. 89-I-12° CGI) ou Export.",
    "Correction de l'erreur de drapeau de la référence (drapeau britannique affiché pour « US Dollar ») : drapeaux SVG exacts MA, EU, CH, US sans aucun emoji.",
  ];

  const mockupFiles = [
    {
      file: "01-create-document.png",
      title: "01 — Créer un document (FR + Modal + RTL)",
      target: "create",
    },
    {
      file: "02-documents-list.png",
      title: "02 — Liste des documents & filtres",
      target: "documents",
    },
    {
      file: "03-document-detail.png",
      title: "03 — Détail document & Paiement MAD",
      target: "detail",
    },
    {
      file: "04-dashboard.png",
      title: "04 — Tableau de bord & Plafond AE",
      target: "dashboard",
    },
    {
      file: "05-clients.png",
      title: "05 — Clients & Fiche client",
      target: "clients",
    },
    {
      file: "06-projects-missions.png",
      title: "06 — Projets / Missions & Tâches",
      target: "projects",
    },
    {
      file: "07-settings.png",
      title: "07 — Paramètres Auto-Entrepreneur",
      target: "settings",
    },
    {
      file: "08-login-empty-error.png",
      title: "08 — Auth, États vides & Erreur AA",
      target: "states",
    },
    {
      file: "09-mobile-390px.png",
      title: "09 — Mobile 390px (Dashboard & Création)",
      target: "mobile",
    },
    {
      file: "10-design-system-sheet.png",
      title: "10 — Planche Design System complète",
      target: "design-system",
    },
  ];

  return (
    <div className="flex-1 bg-[#F3F4F6] p-6 lg:p-7 space-y-6">
      <div>
        <p className="text-[12px] font-medium text-[#667085]">
          Livrables Produit & Design • Audit de la référence, Mockups PNG & Spécifications
        </p>
        <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#14171F]">
          Analyse Keep / Drop, Planches PNG & Spécifications Design
        </h1>
      </div>

      {/* KEEP VS DROP */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-[#0B6B3A]">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-[15.5px] font-bold text-[#14171F]">
              CONSERVÉ de la référence (create-invoice-reference.png)
            </h2>
          </div>
          <ul className="space-y-2.5 text-[12.5px] leading-relaxed text-[#3F4654]">
            {keepItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#0B6B3A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-[#A31D1D]">
            <XCircle className="h-5 w-5" />
            <h2 className="text-[15.5px] font-bold text-[#14171F]">
              ÉCARTÉ / ADAPTÉ pour Facturo Auto-Entrepreneur Maroc
            </h2>
          </div>
          <ul className="space-y-2.5 text-[12.5px] leading-relaxed text-[#3F4654]">
            {dropItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <XCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-[#A31D1D]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* EXPORTED PNG MOCKUPS GALLERY */}
      <div className="rounded-[20px] border border-[#E3E6EC] bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-bold text-[#14171F]">
              Maquettes PNG exportées (`docs/design/mockups/`) & Livrables Markdown
            </h2>
            <p className="text-[12.5px] text-[#667085]">
              Fichiers générés dans `docs/design/mockups/*.png`, `docs/design/DESIGN_SPEC.md` et `docs/design/OPEN_QUESTIONS.md`.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {mockupFiles.map((m) => (
            <div
              key={m.file}
              className="overflow-hidden rounded-[16px] border border-[#E3E6EC] bg-[#F8F9FB] flex flex-col justify-between"
            >
              <a
                href={`/design/mockups/${m.file}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden border-b border-[#E3E6EC] bg-[#E4E6EA]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/design/mockups/${m.file}`}
                  alt={m.title}
                  className="h-32 w-full object-cover object-top hover:scale-[1.02] transition-transform"
                />
              </a>
              <div className="p-3 space-y-2">
                <p className="text-[11.5px] font-bold text-[#14171F] leading-snug">
                  {m.title}
                </p>
                <p className="text-[10px] font-mono text-[#667085]">{m.file}</p>
                <button
                  type="button"
                  onClick={() => onJumpToScreen(m.target)}
                  className="w-full rounded-[8px] border border-[#E3E6EC] bg-white py-1.5 text-[11px] font-semibold text-[#2457F5] hover:border-[#2457F5]"
                >
                  Ouvrir l&apos;écran interactif
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
