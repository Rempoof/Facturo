"use client";

import React from "react";
import {
  CheckCircle2,
  Send,
  Clock,
  AlertTriangle,
  FileEdit,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

export type CurrencyCode = "MAD" | "EUR" | "CHF" | "USD";
export type DocTypeCode = "devis" | "proforma" | "facture" | "acompte" | "avoir";
export type DocLang = "FR" | "EN" | "AR";
export type StatusCode =
  | "paid"
  | "sent"
  | "pending"
  | "overdue"
  | "draft"
  | "accepted";

export const CURRENCY_META: Record<
  CurrencyCode,
  {
    code: CurrencyCode;
    flag: "MA" | "EU" | "CH" | "US";
    labelFr: string;
    labelAr: string;
    symbol: string;
    defaultRateToMad: number;
  }
> = {
  MAD: {
    code: "MAD",
    flag: "MA",
    labelFr: "MAD — Dirham marocain",
    labelAr: "درهم مغربي (MAD)",
    symbol: "MAD",
    defaultRateToMad: 1,
  },
  EUR: {
    code: "EUR",
    flag: "EU",
    labelFr: "EUR — Euro (Zone SEPA)",
    labelAr: "يورو أوروبي (EUR)",
    symbol: "€",
    defaultRateToMad: 10.8,
  },
  CHF: {
    code: "CHF",
    flag: "CH",
    labelFr: "CHF — Franc suisse",
    labelAr: "فرنك سويسري (CHF)",
    symbol: "CHF",
    defaultRateToMad: 11.35,
  },
  USD: {
    code: "USD",
    flag: "US",
    labelFr: "USD — Dollar américain",
    labelAr: "دولار أمريكي (USD)",
    symbol: "$",
    defaultRateToMad: 9.95,
  },
};

export const DOC_TYPE_META: Record<
  DocTypeCode,
  {
    tabFr: string;
    tabAr: string;
    titleFr: string;
    upperFr: string;
    upperEn: string;
    upperAr: string;
    prefix: string;
  }
> = {
  devis: {
    tabFr: "Devis",
    tabAr: "عرض أثمان",
    titleFr: "Créer un devis",
    upperFr: "DEVIS",
    upperEn: "QUOTE",
    upperAr: "عرض أثمان",
    prefix: "DEV",
  },
  proforma: {
    tabFr: "Proforma",
    tabAr: "فاتورة أولية",
    titleFr: "Créer une facture proforma",
    upperFr: "FACTURE PROFORMA",
    upperEn: "PROFORMA INVOICE",
    upperAr: "فاتورة أولية (بروفورما)",
    prefix: "PRO",
  },
  facture: {
    tabFr: "Facture",
    tabAr: "فاتورة",
    titleFr: "Créer une facture",
    upperFr: "FACTURE",
    upperEn: "INVOICE",
    upperAr: "فاتورة",
    prefix: "FAC",
  },
  acompte: {
    tabFr: "Facture d'acompte",
    tabAr: "فاتورة تسبيق",
    titleFr: "Créer une facture d'acompte",
    upperFr: "FACTURE D'ACOMPTE",
    upperEn: "DEPOSIT INVOICE",
    upperAr: "فاتورة تسبيق",
    prefix: "ACO",
  },
  avoir: {
    tabFr: "Avoir",
    tabAr: "إشعار دائن",
    titleFr: "Créer une facture d'avoir",
    upperFr: "FACTURE D'AVOIR",
    upperEn: "CREDIT NOTE",
    upperAr: "فاتورة إشعار دائن",
    prefix: "AVO",
  },
};

export function formatAmount(amount: number, currency: CurrencyCode | string = "MAD"): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
  return `${formatted} ${currency}`;
}

export function CountryFlag({
  code,
  size = 20,
}: {
  code: string;
  size?: number;
}) {
  const normalized = (code || "MA").toUpperCase();

  if (normalized === "MA" || normalized === "MAD") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0 rounded-full ring-1 ring-black/10"
      >
        <circle cx="12" cy="12" r="12" fill="#C1272D" />
        <path
          d="M12 6.4L13.45 10.85H18.1L14.35 13.55L15.8 18L12 15.25L8.2 18L9.65 13.55L5.9 10.85H10.55L12 6.4Z"
          fill="none"
          stroke="#006233"
          strokeWidth="1.55"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalized === "EU" || normalized === "EUR") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0 rounded-full ring-1 ring-black/10"
      >
        <circle cx="12" cy="12" r="12" fill="#003399" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 12 + 6.4 * Math.cos(rad);
          const cy = 12 + 6.4 * Math.sin(rad);
          return <circle key={deg} cx={cx} cy={cy} r="1.15" fill="#FFCC00" />;
        })}
      </svg>
    );
  }

  if (normalized === "FR") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0 rounded-full ring-1 ring-black/10"
      >
        <defs>
          <clipPath id="frClip">
            <circle cx="12" cy="12" r="12" />
          </clipPath>
        </defs>
        <g clipPath="url(#frClip)">
          <rect x="0" y="0" width="8" height="24" fill="#002654" />
          <rect x="8" y="0" width="8" height="24" fill="#FFFFFF" />
          <rect x="16" y="0" width="8" height="24" fill="#ED2939" />
        </g>
      </svg>
    );
  }

  if (normalized === "CH" || normalized === "CHF") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0 rounded-full ring-1 ring-black/10"
      >
        <circle cx="12" cy="12" r="12" fill="#D52B1E" />
        <rect x="10.2" y="6" width="3.6" height="12" rx="0.6" fill="#FFFFFF" />
        <rect x="6" y="10.2" width="12" height="3.6" rx="0.6" fill="#FFFFFF" />
      </svg>
    );
  }

  // Default US / USD
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0 rounded-full ring-1 ring-black/10"
    >
      <defs>
        <clipPath id="usClip">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#usClip)">
        <rect width="24" height="24" fill="#FFFFFF" />
        <rect y="0" width="24" height="3.4" fill="#B22234" />
        <rect y="6.8" width="24" height="3.4" fill="#B22234" />
        <rect y="13.6" width="24" height="3.4" fill="#B22234" />
        <rect y="20.4" width="24" height="3.6" fill="#B22234" />
        <rect x="0" y="0" width="12" height="13.6" fill="#3C3B6E" />
        <circle cx="4" cy="4.5" r="1" fill="#FFFFFF" />
        <circle cx="8" cy="4.5" r="1" fill="#FFFFFF" />
        <circle cx="6" cy="7.5" r="1" fill="#FFFFFF" />
        <circle cx="4" cy="10.5" r="1" fill="#FFFFFF" />
        <circle cx="8" cy="10.5" r="1" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function FacturoLogo({
  compact = false,
  size = 34,
}: {
  compact?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full bg-[#14171F]"
      >
        <span
          style={{ fontSize: Math.round(size * 0.5) }}
          className="font-bold leading-none text-white"
        >
          F
        </span>
      </div>
      {!compact && (
        <span className="text-[18px] font-bold tracking-[-0.025em] text-[#14171F]">
          Facturo
        </span>
      )}
    </div>
  );
}

export function IssuerEmblem({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#0F3D3A] text-[#BFF0D4]"
      aria-label="Emblème émetteur Facturo"
    >
      <svg
        width={Math.round(size * 0.56)}
        height={Math.round(size * 0.56)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3V21M3 12H21M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4"
          stroke="#BFF0D4"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2.6" fill="#0F3D3A" stroke="#BFF0D4" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

const STATUS_CONFIG: Record<
  StatusCode,
  {
    bg: string;
    fg: string;
    labelFr: string;
    labelAr: string;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }
> = {
  paid: {
    bg: "#DDF5E6",
    fg: "#0B6B3A",
    labelFr: "Payée",
    labelAr: "مدفوعة",
    Icon: CheckCircle2,
  },
  sent: {
    bg: "#E4EBFF",
    fg: "#1B45C9",
    labelFr: "Envoyée",
    labelAr: "مُرسلة",
    Icon: Send,
  },
  pending: {
    bg: "#FFF0D6",
    fg: "#8A4B00",
    labelFr: "En attente",
    labelAr: "قيد الانتظار",
    Icon: Clock,
  },
  overdue: {
    bg: "#FDE3E3",
    fg: "#A31D1D",
    labelFr: "En retard",
    labelAr: "متأخرة",
    Icon: AlertTriangle,
  },
  draft: {
    bg: "#E8EAEE",
    fg: "#3F4654",
    labelFr: "Brouillon",
    labelAr: "مسودة",
    Icon: FileEdit,
  },
  accepted: {
    bg: "#DDF5E6",
    fg: "#0B6B3A",
    labelFr: "Accepté",
    labelAr: "مقبول",
    Icon: FileCheck2,
  },
};

export function StatusBadge({
  status,
  rtl = false,
}: {
  status: string;
  rtl?: boolean;
}) {
  const key = (status in STATUS_CONFIG ? status : "draft") as StatusCode;
  const cfg = STATUS_CONFIG[key];
  const Icon = cfg.Icon;
  return (
    <span
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none whitespace-nowrap"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span>{rtl ? cfg.labelAr : cfg.labelFr}</span>
    </span>
  );
}

export function NotchedField({
  label,
  required,
  focused,
  disabled,
  error,
  rtl,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  focused?: boolean;
  disabled?: boolean;
  error?: string;
  rtl?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const borderClass = error
    ? "border-[#A31D1D] bg-[#FDE3E3]/20"
    : focused
    ? "border-[#2457F5] ring-2 ring-[#2457F5]/12 bg-white"
    : disabled
    ? "border-[#E3E6EC] bg-[#F3F4F6]/80"
    : "border-[#E3E6EC] hover:border-[#C5CBD6] focus-within:border-[#2457F5] focus-within:ring-2 focus-within:ring-[#2457F5]/12 bg-white";

  return (
    <div className={`relative pt-2 ${className}`}>
      <label
        className={`pointer-events-none absolute top-0 ${
          rtl ? "right-3" : "left-3"
        } z-10 bg-white px-1 text-[11px] font-medium leading-none ${
          error
            ? "text-[#A31D1D]"
            : focused
            ? "text-[#2457F5]"
            : "text-[#525866]"
        }`}
      >
        {label}
        {required && <span className="text-[#A31D1D]">*</span>}
      </label>
      <div
        className={`flex min-h-[44px] items-center rounded-[12px] border px-3 py-2 text-[13px] transition-colors ${borderClass}`}
      >
        {children}
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#A31D1D]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
