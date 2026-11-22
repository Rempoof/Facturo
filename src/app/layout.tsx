import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facturo — Facturation & Devis Auto-Entrepreneur Maroc",
  description:
    "Devis, proformas, factures, factures d'acompte et avoirs multidevises (MAD, EUR, CHF, USD) en FR, EN et AR (RTL) pour auto-entrepreneur au Maroc.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#E4E6EA] text-[#14171F] antialiased selection:bg-[#2457F5]/15 selection:text-[#14171F]">
        {children}
      </body>
    </html>
  );
}
