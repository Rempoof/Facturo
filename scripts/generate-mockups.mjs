import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const OUT_DOCS = path.join(process.cwd(), "docs", "design", "mockups");
const OUT_PUBLIC = path.join(process.cwd(), "public", "design", "mockups");
fs.mkdirSync(OUT_DOCS, { recursive: true });
fs.mkdirSync(OUT_PUBLIC, { recursive: true });

const fontFiles = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
].filter((f) => fs.existsSync(f));

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function flagSvg(code, x, y, r = 9) {
  if (code === "MA" || code === "MAD") {
    return `<g transform="translate(${x},${y})">
      <circle cx="${r}" cy="${r}" r="${r}" fill="#C1272D"/>
      <polygon points="${r},${r - 5} ${r + 1.5},${r - 1} ${r + 5},${r - 1} ${r + 2},${r + 1.5} ${r + 3.2},${r + 5} ${r},${r + 2.8} ${r - 3.2},${r + 5} ${r - 2},${r + 1.5} ${r - 5},${r - 1} ${r - 1.5},${r - 1}" fill="none" stroke="#006233" stroke-width="1.3"/>
    </g>`;
  }
  if (code === "EUR" || code === "EU" || code === "FR") {
    return `<g transform="translate(${x},${y})">
      <circle cx="${r}" cy="${r}" r="${r}" fill="#1E40AF"/>
      <circle cx="${r}" cy="${r - 5}" r="1.1" fill="#FACC15"/>
      <circle cx="${r + 5}" cy="${r}" r="1.1" fill="#FACC15"/>
      <circle cx="${r}" cy="${r + 5}" r="1.1" fill="#FACC15"/>
      <circle cx="${r - 5}" cy="${r}" r="1.1" fill="#FACC15"/>
    </g>`;
  }
  if (code === "CHF" || code === "CH") {
    return `<g transform="translate(${x},${y})">
      <circle cx="${r}" cy="${r}" r="${r}" fill="#D52B1E"/>
      <rect x="${r - 1.6}" y="${r - 5}" width="3.2" height="10" fill="#FFFFFF"/>
      <rect x="${r - 5}" y="${r - 1.6}" width="10" height="3.2" fill="#FFFFFF"/>
    </g>`;
  }
  return `<g transform="translate(${x},${y})">
    <circle cx="${r}" cy="${r}" r="${r}" fill="#1D4ED8"/>
    <rect x="${r - 5}" y="${r - 2}" width="10" height="2" fill="#FFFFFF"/>
    <rect x="${r - 5}" y="${r + 1.5}" width="10" height="2" fill="#EF4444"/>
  </g>`;
}

function badgeSvg(x, y, status) {
  const map = {
    paid: { bg: "#DDF5E6", fg: "#0B6B3A", label: "✓ Payée", w: 78 },
    sent: { bg: "#E4EBFF", fg: "#1B45C9", label: "↗ Envoyée", w: 86 },
    pending: { bg: "#FFF0D6", fg: "#8A4B00", label: "◷ En attente", w: 96 },
    overdue: { bg: "#FDE3E3", fg: "#A31D1D", label: "! En retard", w: 88 },
    draft: { bg: "#E8EAEE", fg: "#3F4654", label: "✎ Brouillon", w: 88 },
  };
  const cfg = map[status] || map.draft;
  return `<g transform="translate(${x},${y})">
    <rect width="${cfg.w}" height="24" rx="12" fill="${cfg.bg}"/>
    <text x="${cfg.w / 2}" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="${cfg.fg}">${esc(cfg.label)}</text>
  </g>`;
}

function appFrameShell(activeNav, innerSvg, rtl = false) {
  const sidebarX = rtl ? 1440 - 28 - 224 : 28;
  const contentX = rtl ? 28 : 28 + 224;
  const navItems = [
    { key: "dashboard", label: rtl ? "لوحة القيادة" : "Tableau de bord" },
    { key: "create", label: rtl ? "إنشاء وثيقة" : "Créer un document" },
    { key: "documents", label: rtl ? "الوثائق" : "Documents" },
    { key: "clients", label: rtl ? "العملاء" : "Clients" },
    { key: "projects", label: rtl ? "المشاريع والمهام" : "Projets / Missions" },
    { key: "settings", label: rtl ? "الإعدادات" : "Paramètres AE" },
  ];

  const navRendered = navItems
    .map((item, idx) => {
      const ny = 186 + idx * 42;
      const isAct = item.key === activeNav;
      return `<g transform="translate(${sidebarX + 16}, ${ny})">
        ${
          isAct
            ? `<rect width="192" height="36" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>`
            : ``
        }
        <circle cx="18" cy="18" r="4.5" fill="none" stroke="${
          isAct ? "#2457F5" : "#667085"
        }" stroke-width="1.8"/>
        <text x="34" y="22.5" font-size="12.5" font-weight="${
          isAct ? "bold" : "normal"
        }" fill="${isAct ? "#14171F" : "#525866"}">${esc(item.label)}</text>
      </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960" font-family="DejaVu Sans, sans-serif">
    <!-- Outer Frame #E4E6EA -->
    <rect width="1440" height="960" fill="#E4E6EA"/>
    <!-- Main 1384x904 Window -->
    <rect x="28" y="28" width="1384" height="904" rx="22" fill="#FFFFFF" stroke="#D8DCE5"/>
    <!-- Sidebar -->
    <rect x="${sidebarX}" y="29" width="224" height="902" rx="20" fill="#F8F9FB"/>
    <line x1="${rtl ? sidebarX : sidebarX + 224}" y1="28" x2="${
    rtl ? sidebarX : sidebarX + 224
  }" y2="932" stroke="#E3E6EC"/>

    <!-- Facturo Logo -->
    <g transform="translate(${sidebarX + 20}, 52)">
      <rect width="30" height="30" rx="9" fill="#2457F5"/>
      <line x1="8" y1="10" x2="22" y2="10" stroke="#BFF0D4" stroke-width="2.2"/>
      <line x1="8" y1="15" x2="19" y2="15" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="8" y1="20" x2="15" y2="20" stroke="#BFF0D4" stroke-width="2"/>
      <text x="40" y="21" font-size="18" font-weight="bold" fill="#14171F">facturo</text>
      <rect x="114" y="7" width="28" height="16" rx="5" fill="#0F3D3A"/>
      <text x="128" y="18.5" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#BFF0D4">MA</text>
    </g>

    <!-- Sidebar Search -->
    <g transform="translate(${sidebarX + 16}, 102)">
      <rect width="192" height="36" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
      <text x="14" y="22.5" font-size="12" fill="#667085">${
        rtl ? "بحث سريع..." : "Rechercher..."
      }</text>
      <rect x="152" y="8" width="30" height="20" rx="5" fill="#F3F4F6"/>
      <text x="167" y="21.5" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#525866">⌘K</text>
    </g>

    <text x="${sidebarX + 24}" y="170" font-size="10" font-weight="bold" fill="#98A2B3">MENU</text>
    ${navRendered}

    <!-- Profile Footer Card -->
    <g transform="translate(${sidebarX + 16}, 856)">
      <rect width="192" height="54" rx="14" fill="#FFFFFF" stroke="#E3E6EC"/>
      <circle cx="26" cy="27" r="15" fill="#0F3D3A"/>
      <text x="26" y="31" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#BFF0D4">YE</text>
      <text x="48" y="23" font-size="11" font-weight="bold" fill="#14171F">Youssef El Amrani</text>
      <text x="48" y="38" font-size="9.5" fill="#667085">AE • Exemple Maroc</text>
    </g>

    <!-- Main Screen Content -->
    <g transform="translate(${contentX}, 28)">
      ${innerSvg}
    </g>
  </svg>`;
}

function a4PaperSvg(x, y, opts = {}) {
  const rtl = Boolean(opts.rtl);
  return `<g transform="translate(${x}, ${y})">
    <!-- Tilted Stacked Sheet -->
    <rect x="14" y="-6" width="500" height="726" rx="14" fill="#E6E9EF" transform="rotate(-1.2 260 360)"/>
    <!-- Crisp White A4 Paper -->
    <rect width="516" height="732" rx="14" fill="#FFFFFF" stroke="#E3E6EC"/>
    <!-- Header -->
    <text x="${rtl ? 484 : 32}" y="46" text-anchor="${rtl ? "end" : "start"}" font-size="20" font-weight="bold" fill="#14171F">${
    rtl ? "فاتورة" : opts.docTitle || "FACTURE"
  }</text>
    <rect x="${rtl ? 334 : 32}" y="56" width="150" height="20" rx="6" fill="#E8EAEE"/>
    <text x="${rtl ? 409 : 107}" y="70" text-anchor="middle" font-size="10" font-weight="bold" fill="#3F4654">${
    opts.lockedNum || (rtl ? "يُخصص عند الإصدار" : "Attribué à l'émission")
  }</text>
    <!-- Deep Green + Mint Circular Emblem -->
    <g transform="translate(${rtl ? 32 : 444}, 28)">
      <circle cx="20" cy="20" r="20" fill="#0F3D3A"/>
      <line x1="20" y1="7" x2="20" y2="33" stroke="#BFF0D4" stroke-width="2.2"/>
      <line x1="7" y1="20" x2="33" y2="20" stroke="#BFF0D4" stroke-width="2.2"/>
      <line x1="11" y1="11" x2="29" y2="29" stroke="#BFF0D4" stroke-width="2"/>
      <line x1="29" y1="11" x2="11" y2="29" stroke="#BFF0D4" stroke-width="2"/>
    </g>

    <line x1="32" y1="94" x2="484" y2="94" stroke="#ECEEF2"/>

    <!-- Issuer & Client Blocks -->
    <text x="32" y="116" font-size="10" fill="#667085">Émis par (Exemple)</text>
    <text x="32" y="133" font-size="11.5" font-weight="bold" fill="#14171F">Youssef El Amrani (Exemple)</text>
    <text x="32" y="149" font-size="10" fill="#525866">48 Bd d'Anfa, Casablanca 20060</text>
    <text x="32" y="165" font-size="9.5" font-weight="bold" fill="#3F4654">ICE : 000000000000099 (Exemple)</text>
    <text x="32" y="179" font-size="9.5" fill="#3F4654">N° AE : AE-2026-009841 (Exemple)</text>

    <text x="272" y="116" font-size="10" fill="#667085">Adressé à (Exemple)</text>
    ${flagSvg("FR", 272, 122, 7)}
    <text x="290" y="133" font-size="11.5" font-weight="bold" fill="#14171F">Maison Lumière SAS (Exemple)</text>
    <text x="272" y="149" font-size="10" fill="#525866">24 Rue du Fbg Saint-Martin, Paris</text>
    <text x="272" y="165" font-size="9.5" font-weight="bold" fill="#3F4654">TVA : FR 44 899000112 (Exemple)</text>

    <!-- Dates -->
    <text x="32" y="210" font-size="10" fill="#667085">Date d'émission</text>
    <text x="32" y="226" font-size="11" font-weight="bold" fill="#14171F">10/03/2026</text>
    <text x="272" y="210" font-size="10" fill="#667085">Date d'échéance</text>
    <text x="272" y="226" font-size="11" font-weight="bold" fill="#14171F">09/04/2026</text>

    <!-- Items Table -->
    <rect x="32" y="248" width="452" height="28" rx="7" fill="#F8F9FB" stroke="#ECEEF2"/>
    <text x="44" y="266" font-size="10" font-weight="bold" fill="#667085">Désignation</text>
    <text x="304" y="266" font-size="10" font-weight="bold" fill="#667085">Qté</text>
    <text x="348" y="266" font-size="10" font-weight="bold" fill="#667085">Unité</text>
    <text x="472" y="266" text-anchor="end" font-size="10" font-weight="bold" fill="#667085">Montant</text>

    <text x="44" y="298" font-size="10.2" font-weight="bold" fill="#14171F">Design System &amp; Tokens AA (Exemple)</text>
    <text x="310" y="298" font-size="10.5" fill="#3F4654">1</text>
    <text x="348" y="298" font-size="10.5" fill="#667085">forfait</text>
    <text x="472" y="298" text-anchor="end" font-size="10.5" font-weight="bold" fill="#14171F">2 200,00 EUR</text>
    <line x1="32" y1="312" x2="484" y2="312" stroke="#F0F2F5"/>

    <text x="44" y="336" font-size="10.2" font-weight="bold" fill="#14171F">Maquettes Desktop/Mobile (-5%)</text>
    <text x="310" y="336" font-size="10.5" fill="#3F4654">4</text>
    <text x="348" y="336" font-size="10.5" fill="#667085">jour</text>
    <text x="472" y="336" text-anchor="end" font-size="10.5" font-weight="bold" fill="#14171F">2 090,00 EUR</text>
    <line x1="32" y1="354" x2="484" y2="354" stroke="#ECEEF2"/>

    <!-- Totals -->
    <text x="192" y="382" font-size="10.5" fill="#525866">Sous-total HT</text>
    <text x="472" y="382" text-anchor="end" font-size="10.5" font-weight="bold" fill="#14171F">4 290,00 EUR</text>
    <text x="192" y="402" font-size="10" fill="#667085">TVA (0% — Régime Auto-Entrepreneur)</text>
    <text x="472" y="402" text-anchor="end" font-size="10" fill="#667085">0,00 EUR</text>
    <line x1="192" y1="414" x2="484" y2="414" stroke="#E3E6EC"/>
    <text x="192" y="434" font-size="12" font-weight="bold" fill="#14171F">Total net à payer</text>
    <text x="472" y="434" text-anchor="end" font-size="12.5" font-weight="bold" fill="#14171F">4 290,00 EUR</text>

    <!-- Indicative MAD Equivalent -->
    <rect x="184" y="446" width="300" height="24" rx="7" fill="#F3F4F6"/>
    <text x="194" y="462" font-size="9.5" fill="#525866">Équiv. indicatif (1 EUR = 10,80)</text>
    <text x="474" y="462" text-anchor="end" font-size="10" font-weight="bold" fill="#0F3D3A">≈ 46 332,00 MAD</text>

    <!-- Legal Mention Box -->
    <rect x="32" y="492" width="452" height="44" rx="9" fill="#F8F9FB" stroke="#E3E6EC"/>
    <text x="44" y="510" font-size="9.2" fill="#3F4654">TVA non applicable — Art. 89-I-12° &amp; Art. 92-I-1° du CGI (Auto-Entrepreneur Maroc).</text>
    <text x="44" y="525" font-size="9.2" fill="#667085">Merci d'indiquer la référence du document lors du virement SEPA / SWIFT (Exemple).</text>

    <!-- Bank & Signature Footer -->
    <text x="32" y="574" font-size="10.5" font-weight="bold" fill="#14171F">Règlement &amp; Coordonnées bancaires</text>
    <text x="32" y="591" font-size="9.5" fill="#525866">Virement SEPA / SWIFT • 30 jours nets</text>
    <text x="32" y="607" font-size="9.5" font-weight="bold" fill="#14171F">IBAN : MA64 2307 8000 0098 7654 3210 0088</text>
    <text x="32" y="622" font-size="9.5" fill="#667085">BIC / SWIFT : BAMMAMCXXXX (Exemple)</text>

    <path d="M366 598 C378 575, 388 575, 392 598 C398 580, 412 580, 418 596 C428 584, 444 586, 462 592" fill="none" stroke="#14171F" stroke-width="1.8"/>
    <line x1="362" y1="604" x2="466" y2="604" stroke="#2457F5" stroke-width="1"/>
    <text x="414" y="620" text-anchor="middle" font-size="10" font-weight="bold" fill="#14171F">Youssef El Amrani</text>
  </g>`;
}

// 01 — CREATE DOCUMENT (PRIORITY SCREEN)
const svg01 = appFrameShell(
  "create",
  `
  <!-- Form Left Column (540px) -->
  <rect width="540" height="904" fill="#FFFFFF"/>
  <line x1="540" y1="0" x2="540" y2="904" stroke="#E3E6EC"/>
  <text x="28" y="34" font-size="11.5" fill="#667085">Documents  ›  <tspan font-weight="bold" fill="#14171F">Créer une facture</tspan></text>
  <text x="28" y="64" font-size="20" font-weight="bold" fill="#14171F">Créer une facture</text>
  <text x="28" y="84" font-size="11.5" fill="#667085">Document conforme AE Maroc avec aperçu A4 en direct.</text>

  <!-- Show Preview Switch -->
  <rect x="388" y="42" width="124" height="34" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="400" y="63" font-size="11" font-weight="bold" fill="#14171F"> Aperçu A4</text>
  <rect x="474" y="50" width="28" height="18" rx="9" fill="#2457F5"/>
  <circle cx="493" cy="59" r="6.5" fill="#FFFFFF"/>

  <!-- 5 Document Type Tabs -->
  <rect x="28" y="102" width="484" height="38" rx="12" fill="#F3F4F6"/>
  <text x="74" y="125" text-anchor="middle" font-size="11" fill="#667085">Devis</text>
  <text x="168" y="125" text-anchor="middle" font-size="11" fill="#667085">Proforma</text>
  <rect x="218" y="106" width="96" height="30" rx="9" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="266" y="125" text-anchor="middle" font-size="11" font-weight="bold" fill="#14171F">Facture</text>
  <text x="364" y="125" text-anchor="middle" font-size="11" fill="#667085">Acompte</text>
  <text x="458" y="125" text-anchor="middle" font-size="11" fill="#667085">Avoir</text>

  <!-- Section Informations -->
  <text x="28" y="168" font-size="13.5" font-weight="bold" fill="#14171F">Informations</text>
  <rect x="28" y="182" width="236" height="44" rx="12" fill="#FFFFFF" stroke="#2457F5" stroke-width="1.6"/>
  <rect x="38" y="175" width="46" height="12" fill="#FFFFFF"/>
  <text x="41" y="184" font-size="10" font-weight="bold" fill="#2457F5">Client*</text>
  ${flagSvg("FR", 40, 195, 9)}
  <text x="64" y="209" font-size="12" font-weight="bold" fill="#14171F">Maison Lumière SAS</text>

  <rect x="276" y="182" width="236" height="44" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <rect x="286" y="175" width="94" height="12" fill="#FFFFFF"/>
  <text x="289" y="184" font-size="10" fill="#525866">Projet (optionnel)</text>
  <text x="290" y="209" font-size="12" fill="#14171F">PRJ-2026-01 — Portail B2B</text>

  <rect x="28" y="240" width="236" height="44" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <rect x="38" y="233" width="88" height="12" fill="#FFFFFF"/>
  <text x="41" y="242" font-size="10" fill="#525866">Date d'émission*</text>
  <text x="42" y="267" font-size="12" font-weight="bold" fill="#14171F">10/03/2026</text>

  <rect x="276" y="240" width="236" height="44" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <rect x="286" y="233" width="88" height="12" fill="#FFFFFF"/>
  <text x="289" y="242" font-size="10" fill="#525866">Date d'échéance*</text>
  <text x="290" y="267" font-size="12" font-weight="bold" fill="#14171F">09/04/2026</text>

  <rect x="28" y="298" width="302" height="44" rx="12" fill="#F3F4F6" stroke="#E3E6EC"/>
  <text x="42" y="325" font-size="11.5" fill="#525866"># Attribué à l'émission (FAC-2026-0019)</text>

  <rect x="342" y="298" width="170" height="44" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <rect x="350" y="306" width="48" height="28" rx="8" fill="#2457F5"/>
  <text x="374" y="324" text-anchor="middle" font-size="11" font-weight="bold" fill="#FFFFFF">FR</text>
  <text x="424" y="324" text-anchor="middle" font-size="11" font-weight="bold" fill="#525866">EN</text>
  <text x="476" y="324" text-anchor="middle" font-size="11" font-weight="bold" fill="#525866">AR</text>

  <!-- Section Lignes de service -->
  <text x="28" y="372" font-size="13.5" font-weight="bold" fill="#14171F">Lignes de service</text>
  <rect x="364" y="354" width="148" height="26" rx="8" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="438" y="371" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#2457F5">+ Importer du projet</text>

  <rect x="28" y="386" width="310" height="42" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  ${flagSvg("EUR", 40, 398, 9)}
  <text x="64" y="412" font-size="12" font-weight="bold" fill="#14171F">EUR — Euro (Zone SEPA)</text>
  <rect x="350" y="386" width="162" height="42" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="364" y="412" font-size="11.5" font-weight="bold" fill="#0F3D3A">1 EUR = 10,80 MAD</text>

  <!-- Item Card 1 -->
  <rect x="28" y="440" width="484" height="132" rx="18" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="44" y="464" font-size="12" font-weight="bold" fill="#14171F">Ligne 1</text>
  <rect x="98" y="450" width="96" height="20" rx="6" fill="#F3F4F6"/>
  <text x="146" y="464" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#14171F">2 200,00 EUR</text>
  <rect x="44" y="476" width="452" height="38" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="499" font-size="12" fill="#14171F">Architecture Design System AA (Exemple)</text>
  <rect x="44" y="522" width="96" height="36" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="544" font-size="11.5" font-weight="bold" fill="#14171F">Qté : 1</text>
  <rect x="148" y="522" width="108" height="36" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="160" y="544" font-size="11.5" fill="#14171F">forfait</text>
  <rect x="264" y="522" width="140" height="36" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="276" y="544" font-size="11.5" font-weight="bold" fill="#14171F">2 200,00 EUR</text>
  <rect x="412" y="522" width="84" height="36" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="424" y="544" font-size="11.5" fill="#525866">Rem 0%</text>

  <rect x="28" y="582" width="484" height="36" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="270" y="605" text-anchor="middle" font-size="12" font-weight="bold" fill="#14171F">+ Ajouter une ligne</text>

  <!-- Section Mentions et paiement -->
  <text x="28" y="646" font-size="13.5" font-weight="bold" fill="#14171F">Mentions et paiement</text>
  <rect x="28" y="658" width="236" height="40" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="40" y="682" font-size="11" fill="#14171F">Export services — Art. 92 CGI (0%)</text>
  <rect x="276" y="658" width="236" height="40" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="288" y="682" font-size="11" font-weight="bold" fill="#0B6B3A">Compte EUR (IBAN + SWIFT)</text>

  <rect x="28" y="708" width="484" height="52" rx="12" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="40" y="729" font-size="10.5" fill="#3F4654">Mention auto : Exonéré de TVA marocaine (Art. 89-I-12° &amp; Art. 92-I-1° CGI).</text>
  <text x="40" y="747" font-size="10.5" fill="#667085">Règlement : Virement SEPA / SWIFT • Échéance 30 jours • Signature active ✓</text>

  <!-- Right Pane: Soft Gray Stage #F3F4F6 -->
  <rect x="541" y="0" width="619" height="904" rx="20" fill="#F3F4F6"/>
  <rect x="541" y="0" width="619" height="66" fill="#FFFFFF"/>
  <line x1="541" y1="66" x2="1160" y2="66" stroke="#E3E6EC"/>
  <text x="566" y="40" font-size="17" font-weight="bold" fill="#14171F">Aperçu</text>
  <rect x="642" y="19" width="118" height="30" rx="9" fill="#F3F4F6" stroke="#E3E6EC"/>
  <text x="671" y="38" text-anchor="middle" font-size="11" fill="#667085">Email</text>
  <rect x="702" y="22" width="54" height="24" rx="7" fill="#FFFFFF"/>
  <text x="729" y="38" text-anchor="middle" font-size="11" font-weight="bold" fill="#14171F">PDF</text>

  <rect x="826" y="16" width="154" height="36" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="903" y="38" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#14171F">Enregistrer brouillon</text>
  <rect x="990" y="16" width="150" height="36" rx="12" fill="#2457F5"/>
  <text x="1065" y="38" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#FFFFFF">Émettre et envoyer</text>

  ${a4PaperSvg(592, 98)}
`
);

// 01b — ARABIC RTL CREATE DOCUMENT
const svg01Rtl = appFrameShell(
  "create",
  `
  <rect width="619" height="904" fill="#F3F4F6"/>
  <rect x="0" y="0" width="619" height="66" fill="#FFFFFF"/>
  <line x1="0" y1="66" x2="619" y2="66" stroke="#E3E6EC"/>
  <rect x="24" y="16" width="150" height="36" rx="12" fill="#2457F5"/>
  <text x="99" y="38" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">إصدار وإرسال</text>
  <rect x="184" y="16" width="130" height="36" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="249" y="38" text-anchor="middle" font-size="12" font-weight="bold" fill="#14171F">حفظ كمسودة</text>
  <text x="588" y="40" text-anchor="end" font-size="17" font-weight="bold" fill="#14171F">معاينة مباشرة (RTL)</text>
  ${a4PaperSvg(52, 98, { rtl: true })}

  <rect x="620" y="0" width="540" height="904" fill="#FFFFFF"/>
  <line x1="620" y1="0" x2="620" y2="904" stroke="#E3E6EC"/>
  <text x="1132" y="40" text-anchor="end" font-size="12" fill="#667085">الوثائق  ‹  إنشاء فاتورة جديدة</text>
  <text x="1132" y="74" text-anchor="end" font-size="20" font-weight="bold" fill="#14171F">إنشاء فاتورة (واجهة عربية RTL)</text>
  <rect x="648" y="98" width="484" height="38" rx="12" fill="#F3F4F6"/>
  <rect x="844" y="102" width="96" height="30" rx="9" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="892" y="121" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#14171F">فاتورة</text>
  <text x="1068" y="121" text-anchor="middle" font-size="11.5" fill="#667085">عرض أثمان</text>
  <text x="708" y="121" text-anchor="middle" font-size="11.5" fill="#667085">إشعار دائن</text>

  <text x="1132" y="172" text-anchor="end" font-size="14" font-weight="bold" fill="#14171F">المعلومات الأساسية</text>
  <rect x="648" y="186" width="484" height="46" rx="12" fill="#FFFFFF" stroke="#2457F5" stroke-width="1.6"/>
  <text x="1116" y="214" text-anchor="end" font-size="12.5" font-weight="bold" fill="#14171F">شركة الأطلس للابتكار ش.م.م (نموذج) • ICE</text>

  <rect x="648" y="246" width="484" height="46" rx="12" fill="#F3F4F6" stroke="#E3E6EC"/>
  <text x="1116" y="274" text-anchor="end" font-size="12" fill="#525866">الرقم التسلسلي : يُخصص عند الإصدار الرسمي (FAC-2026-0019)</text>

  <text x="1132" y="330" text-anchor="end" font-size="14" font-weight="bold" fill="#14171F">بنود الخدمات والأشغال (درهم مغربي MAD)</text>
  <rect x="648" y="346" width="484" height="120" rx="18" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="1114" y="376" text-anchor="end" font-size="12.5" font-weight="bold" fill="#14171F">تصميم نظام الهوية البصرية ومكونات الواجهة (نموذج)</text>
  <text x="1114" y="410" text-anchor="end" font-size="12" fill="#525866">الكمية: 1 جزافي × 16 500,00 درهم مغربي (MAD)</text>
  <text x="668" y="446" font-size="13" font-weight="bold" fill="#0F3D3A">16 500,00 MAD</text>

  <!-- Confirm Lock Modal Preview Card Embedded -->
  <rect x="648" y="500" width="484" height="190" rx="20" fill="#F8F9FB" stroke="#2457F5"/>
  <text x="1114" y="532" text-anchor="end" font-size="14" font-weight="bold" fill="#14171F">تأكيد الإصدار وقفل الرقم التسلسلي</text>
  <text x="1114" y="560" text-anchor="end" font-size="11.5" fill="#525866">إصدار الوثيقة يقفل التعديل نهائياً ويمنح الرقم FAC-2026-0019</text>
  <rect x="668" y="632" width="170" height="38" rx="12" fill="#2457F5"/>
  <text x="753" y="655" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">تأكيد وقفل الوثيقة</text>
`,
  true
);

// 02 — DOCUMENTS LIST
const svg02 = appFrameShell(
  "documents",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <text x="32" y="42" font-size="12" fill="#667085">Facturation &amp; Suivi • Numérotation séquentielle verrouillée</text>
  <text x="32" y="70" font-size="22" font-weight="bold" fill="#14171F">Documents commerciaux</text>
  <rect x="968" y="38" width="160" height="40" rx="12" fill="#2457F5"/>
  <text x="1048" y="63" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#FFFFFF">+ Nouveau document</text>

  <!-- Filters Card -->
  <rect x="32" y="96" width="1096" height="106" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <rect x="52" y="114" width="66" height="30" rx="10" fill="#14171F"/>
  <text x="85" y="133" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#FFFFFF">Tous</text>
  <rect x="126" y="114" width="70" height="30" rx="10" fill="#F3F4F6"/>
  <text x="161" y="133" text-anchor="middle" font-size="11.5" fill="#525866">Devis</text>
  <rect x="204" y="114" width="86" height="30" rx="10" fill="#F3F4F6"/>
  <text x="247" y="133" text-anchor="middle" font-size="11.5" fill="#525866">Proformas</text>
  <rect x="298" y="114" width="82" height="30" rx="10" fill="#F3F4F6"/>
  <text x="339" y="133" text-anchor="middle" font-size="11.5" fill="#525866">Factures</text>
  <rect x="388" y="114" width="84" height="30" rx="10" fill="#F3F4F6"/>
  <text x="430" y="133" text-anchor="middle" font-size="11.5" fill="#525866">Acomptes</text>
  <rect x="480" y="114" width="72" height="30" rx="10" fill="#F3F4F6"/>
  <text x="516" y="133" text-anchor="middle" font-size="11.5" fill="#525866">Avoirs</text>

  <rect x="818" y="112" width="290" height="34" rx="12" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="836" y="133" font-size="11.5" fill="#98A2B3">Rechercher N° FAC-2026, client...</text>

  <rect x="52" y="158" width="248" height="32" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="68" y="178" font-size="11.5" fill="#14171F">Statut : Tous (Payée, Envoyée...)</text>
  <rect x="314" y="158" width="258" height="32" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="330" y="178" font-size="11.5" fill="#14171F">Client : Tous (5 exemples)</text>
  <rect x="586" y="158" width="258" height="32" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="602" y="178" font-size="11.5" fill="#14171F">Devise : MAD / EUR / CHF / USD</text>
  <rect x="858" y="158" width="250" height="32" rx="10" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="874" y="178" font-size="11.5" fill="#14171F">Période : Exercice 2026</text>

  <!-- Table Card -->
  <rect x="32" y="220" width="1096" height="650" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <rect x="33" y="221" width="1094" height="44" rx="18" fill="#F8F9FB"/>
  <text x="56" y="248" font-size="11" font-weight="bold" fill="#667085">NUMÉRO &amp; TYPE</text>
  <text x="256" y="248" font-size="11" font-weight="bold" fill="#667085">CLIENT (EXEMPLE)</text>
  <text x="530" y="248" font-size="11" font-weight="bold" fill="#667085">DATES</text>
  <text x="665" y="248" font-size="11" font-weight="bold" fill="#667085">MONTANT &amp; MAD</text>
  <text x="820" y="248" font-size="11" font-weight="bold" fill="#667085">STATUT</text>
  <text x="955" y="248" font-size="11" font-weight="bold" fill="#667085">ACTIONS</text>

  ${[
    { n: "FAC-2026-0018", t: "Facture verrouillée", c: "Maison Lumière SAS (Exemple)", fl: "FR", d: "04/03/2026", m: "4 895,00 EUR", mad: "≈ 52 866 MAD", st: "sent", act: "Voir • Avoir • Paiement" },
    { n: "FAC-2026-0017", t: "Facture verrouillée", c: "Koutoubia Logistique SARL (Exemple)", fl: "MA", d: "12/02/2026", m: "44 000,00 MAD", mad: "Reçu 44 000 MAD", st: "paid", act: "Voir • Dupliquer • PDF" },
    { n: "FAC-2026-0016", t: "Facture Export EN", c: "Northstar Cloud Inc. (Sample)", fl: "US", d: "18/01/2026", m: "5 800,00 USD", mad: "Reçu 57 420 MAD", st: "paid", act: "Voir • Dupliquer • PDF" },
    { n: "ACO-2026-0004", t: "Facture d'acompte", c: "Helvetia Lab Sàrl (Exemple)", fl: "CH", d: "02/02/2026", m: "3 650,00 CHF", mad: "Reçu 41 380 MAD", st: "paid", act: "Voir • Dupliquer • PDF" },
    { n: "FAC-2026-0015", t: "Facture verrouillée", c: "Koutoubia Logistique SARL (Exemple)", fl: "MA", d: "20/01/2026", m: "12 600,00 MAD", mad: "Échue 20/02", st: "overdue", act: "Voir • Relancer • Paiement" },
    { n: "DEV-2026-0014", t: "Devis Arabe RTL", c: "شركة الأطلس للابتكار (نموذج)", fl: "MA", d: "06/03/2026", m: "18 500,00 MAD", mad: "Acompte 30%", st: "pending", act: "Voir • Convertir Facture" },
    { n: "Attribué à l'émission", t: "Proforma brouillon", c: "Maison Lumière SAS (Exemple)", fl: "FR", d: "08/03/2026", m: "2 200,00 EUR", mad: "≈ 23 760 MAD", st: "draft", act: "Éditer • Facturer • PDF" },
  ]
    .map((r, i) => {
      const ry = 286 + i * 80;
      return `<g transform="translate(0, ${ry})">
        <text x="56" y="16" font-size="12.5" font-weight="bold" fill="#14171F">${esc(r.n)}</text>
        <text x="56" y="34" font-size="11" fill="#667085">${esc(r.t)}</text>
        ${flagSvg(r.fl, 256, 6, 9)}
        <text x="282" y="20" font-size="12" font-weight="bold" fill="#14171F">${esc(r.c)}</text>
        <text x="530" y="20" font-size="12" fill="#3F4654">${r.d}</text>
        <text x="665" y="16" font-size="12.5" font-weight="bold" fill="#14171F">${r.m}</text>
        <text x="665" y="34" font-size="10.5" fill="#0F3D3A">${r.mad}</text>
        ${badgeSvg(820, 4, r.st)}
        <rect x="935" y="4" width="172" height="28" rx="8" fill="#F8F9FB" stroke="#E3E6EC"/>
        <text x="1021" y="22" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#2457F5">${esc(r.act)}</text>
        <line x1="48" y1="54" x2="1112" y2="54" stroke="#F0F2F5"/>
      </g>`;
    })
    .join("\n")}
`
);

// 03 — DOCUMENT DETAIL + TIMELINE + ENREGISTRER UN PAIEMENT MODAL
const svg03 = appFrameShell(
  "documents",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <rect x="28" y="24" width="1104" height="72" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="54" font-size="18" font-weight="bold" fill="#14171F">FAC-2026-0018 • Document verrouillé (Lecture seule)</text>
  <text x="56" y="75" font-size="12" fill="#667085">Client : Maison Lumière SAS (Exemple) • Total : 4 895,00 EUR (≈ 52 866,00 MAD)</text>
  ${badgeSvg(535, 36, "sent")}
  <rect x="920" y="40" width="190" height="38" rx="12" fill="#2457F5"/>
  <text x="1015" y="64" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Enregistrer un paiement</text>

  ${a4PaperSvg(36, 120, { lockedNum: "#FAC-2026-0018 (Verrouillé)" })}

  <!-- Right Column: Timeline + Modal Enregistrer un paiement -->
  <rect x="580" y="116" width="552" height="250" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="606" y="148" font-size="15" font-weight="bold" fill="#14171F">Timeline du document</text>
  <circle cx="614" cy="182" r="9" fill="#DDF5E6"/><text x="634" y="186" font-size="12" font-weight="bold" fill="#14171F">Créé et numéroté — 04 mars 2026 • 09:42</text>
  <circle cx="614" cy="222" r="9" fill="#DDF5E6"/><text x="634" y="226" font-size="12" font-weight="bold" fill="#14171F">Envoyé par e-mail — 04 mars 2026 • 09:45</text>
  <circle cx="614" cy="262" r="9" fill="#DDF5E6"/><text x="634" y="266" font-size="12" font-weight="bold" fill="#14171F">Consulté par le client — 05 mars 2026 • 14:18</text>
  <circle cx="614" cy="302" r="9" fill="#FFF0D6"/><text x="634" y="306" font-size="12" fill="#8A4B00">En attente de règlement en MAD</text>

  <!-- Modal Card: Enregistrer un paiement -->
  <rect x="580" y="384" width="552" height="476" rx="20" fill="#FFFFFF" stroke="#2457F5" stroke-width="1.8"/>
  <text x="606" y="420" font-size="17" font-weight="bold" fill="#14171F">Modal : Enregistrer un paiement (MAD reçu)</text>
  <text x="606" y="442" font-size="12" fill="#667085">Saisissez le montant net crédité en dirhams sur votre compte marocain.</text>

  <rect x="606" y="464" width="240" height="48" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="620" y="482" font-size="10" fill="#667085">Montant payé (EUR)*</text>
  <text x="620" y="502" font-size="13" font-weight="bold" fill="#14171F">4 895,00 EUR</text>

  <rect x="866" y="464" width="240" height="48" rx="12" fill="#DDF5E6" stroke="#0B6B3A"/>
  <text x="880" y="482" font-size="10" font-weight="bold" fill="#0B6B3A">Montant net reçu en MAD*</text>
  <text x="880" y="502" font-size="13.5" font-weight="bold" fill="#0B6B3A">52 680,00 MAD</text>

  <rect x="606" y="530" width="240" height="48" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="620" y="548" font-size="10" fill="#667085">Frais bancaires / change (MAD)</text>
  <text x="620" y="568" font-size="12.5" font-weight="bold" fill="#8A4B00">186,00 MAD</text>

  <rect x="866" y="530" width="240" height="48" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="880" y="548" font-size="10" fill="#667085">Date de réception*</text>
  <text x="880" y="568" font-size="12.5" font-weight="bold" fill="#14171F">10/03/2026</text>

  <rect x="606" y="596" width="240" height="48" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="620" y="614" font-size="10" fill="#667085">Mode de paiement</text>
  <text x="620" y="634" font-size="12.5" fill="#14171F">Virement SWIFT EUR</text>

  <rect x="866" y="596" width="240" height="48" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="880" y="614" font-size="10" fill="#667085">Référence de virement</text>
  <text x="880" y="634" font-size="12.5" font-weight="bold" fill="#14171F">SWF-2026-883920</text>

  <rect x="606" y="664" width="500" height="54" rx="12" fill="#F3F4F6"/>
  <text x="622" y="687" font-size="11" font-weight="bold" fill="#0F3D3A">Règle Auto-Entrepreneur Maroc :</text>
  <text x="622" y="705" font-size="11" fill="#525866">Seul le montant net reçu en MAD (52 680 MAD) s'ajoute au plafond annuel.</text>

  <rect x="886" y="794" width="220" height="42" rx="12" fill="#2457F5"/>
  <text x="996" y="820" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#FFFFFF">Valider l'encaissement MAD</text>
`
);

// 04 — DASHBOARD
const svg04 = appFrameShell(
  "dashboard",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <text x="32" y="42" font-size="12" fill="#667085">Exercice fiscal 2026 • Suivi CNSS / DGI Auto-Entrepreneur</text>
  <text x="32" y="70" font-size="22" font-weight="bold" fill="#14171F">Tableau de bord du chiffre d'affaires (MAD)</text>

  <!-- 4 KPI Cards -->
  ${[
    { t: "CA encaissé net (MAD)", v: "142 800,00 MAD", s: "3 règlements reçus en 2026", c: "#0B6B3A" },
    { t: "En attente (équiv. MAD)", v: "52 866,00 MAD", s: "Factures émises non soldées", c: "#1B45C9" },
    { t: "Factures en retard", v: "12 600,00 MAD", s: "1 facture échue à relancer", c: "#A31D1D" },
    { t: "IR libératoire estimé (1%)", v: "1 428,00 MAD", s: "Prestations de services", c: "#8A4B00" },
  ]
    .map((k, idx) => {
      const kx = 32 + idx * 278;
      return `<g transform="translate(${kx}, 96)">
        <rect width="262" height="118" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
        <text x="22" y="34" font-size="12" fill="#667085">${k.t}</text>
        <text x="22" y="72" font-size="21" font-weight="bold" fill="#14171F">${k.v}</text>
        <text x="22" y="98" font-size="11" font-weight="bold" fill="${k.c}">${k.s}</text>
      </g>`;
    })
    .join("\n")}

  <!-- Monthly Collections Chart -->
  <rect x="32" y="236" width="636" height="310" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="58" y="272" font-size="15.5" font-weight="bold" fill="#14171F">Encaissements mensuels reçus en MAD (2026)</text>
  ${[
    { m: "Jan", h1: 95, h2: 110, lbl: "38k" },
    { m: "Fév", h1: 155, h2: 155, lbl: "64k" },
    { m: "Mar", h1: 100, h2: 170, lbl: "40k" },
    { m: "Avr", h1: 8, h2: 125, lbl: "—" },
    { m: "Mai", h1: 8, h2: 90, lbl: "—" },
    { m: "Juin", h1: 8, h2: 65, lbl: "—" },
  ]
    .map((b, i) => {
      const bx = 86 + i * 94;
      return `<g>
        <rect x="${bx}" y="${490 - b.h1}" width="22" height="${b.h1}" rx="5" fill="#2457F5"/>
        <rect x="${bx + 26}" y="${490 - b.h2}" width="22" height="${b.h2}" rx="5" fill="#E4EBFF"/>
        <text x="${bx + 24}" y="514" text-anchor="middle" font-size="11.5" fill="#667085">${b.m}</text>
      </g>`;
    })
    .join("\n")}

  <!-- Ceiling Tracker #0F3D3A + #BFF0D4 -->
  <rect x="688" y="236" width="440" height="310" rx="20" fill="#0F3D3A"/>
  <rect x="714" y="262" width="218" height="24" rx="12" fill="#1B5E59"/>
  <text x="823" y="278" text-anchor="middle" font-size="11" font-weight="bold" fill="#BFF0D4">Plafond annuel Auto-Entrepreneur</text>
  <text x="1102" y="278" text-anchor="end" font-size="12" font-weight="bold" fill="#BFF0D4">71,4% utilisé</text>
  <text x="714" y="328" font-size="26" font-weight="bold" fill="#FFFFFF">142 800,00 MAD</text>
  <text x="714" y="352" font-size="12.5" fill="#BFF0D4">sur 200 000,00 MAD (Prestations de services)</text>
  <rect x="714" y="376" width="388" height="16" rx="8" fill="#1B5E59"/>
  <rect x="714" y="376" width="277" height="16" rx="8" fill="#BFF0D4"/>
  <rect x="714" y="414" width="388" height="68" rx="14" fill="#164E4A"/>
  <text x="732" y="440" font-size="11.5" fill="#BFF0D4">Marge restante avant plafond 2026</text>
  <text x="732" y="464" font-size="16" font-weight="bold" fill="#FFFFFF">57 200,00 MAD disponibles</text>
  <text x="714" y="516" font-size="11" fill="#DDF5E6">Alerte préventive dès 85% du seuil légal annuel.</text>

  <!-- Recent Docs -->
  <rect x="32" y="568" width="1096" height="304" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="58" y="604" font-size="15.5" font-weight="bold" fill="#14171F">Documents récents (Exemple)</text>
  <text x="58" y="648" font-size="12.5" font-weight="bold" fill="#14171F">FAC-2026-0018</text>
  <text x="240" y="648" font-size="12.5" fill="#3F4654">Maison Lumière Digital SAS (Exemple)</text>
  <text x="680" y="648" font-size="12.5" font-weight="bold" fill="#14171F">4 895,00 EUR</text>
  ${badgeSvg(860, 632, "sent")}
  <line x1="58" y1="672" x2="1100" y2="672" stroke="#F0F2F5"/>
  <text x="58" y="708" font-size="12.5" font-weight="bold" fill="#14171F">FAC-2026-0017</text>
  <text x="240" y="708" font-size="12.5" fill="#3F4654">Koutoubia Logistique SARL (Exemple)</text>
  <text x="680" y="708" font-size="12.5" font-weight="bold" fill="#14171F">44 000,00 MAD</text>
  ${badgeSvg(860, 692, "paid")}
  <line x1="58" y1="732" x2="1100" y2="732" stroke="#F0F2F5"/>
  <text x="58" y="768" font-size="12.5" font-weight="bold" fill="#14171F">FAC-2026-0015</text>
  <text x="240" y="768" font-size="12.5" fill="#3F4654">Koutoubia Logistique SARL (Exemple)</text>
  <text x="680" y="768" font-size="12.5" font-weight="bold" fill="#A31D1D">12 600,00 MAD</text>
  ${badgeSvg(860, 752, "overdue")}
`
);

// 05 — CLIENTS
const svg05 = appFrameShell(
  "clients",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <text x="32" y="42" font-size="12" fill="#667085">Répertoire Maroc &amp; International (ICE, TVA Intracom., UID, EIN)</text>
  <text x="32" y="70" font-size="22" font-weight="bold" fill="#14171F">Clients &amp; Fiche Client</text>
  <rect x="968" y="38" width="160" height="40" rx="12" fill="#2457F5"/>
  <text x="1048" y="63" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#FFFFFF">+ Nouveau client</text>

  <!-- Left Client List -->
  <rect x="32" y="98" width="420" height="774" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  ${[
    { n: "Maison Lumière Digital SAS (Exemple)", c: "Paris, France • EUR • PDF FR", fl: "FR", sel: true },
    { n: "Koutoubia Logistique SARL (Exemple)", c: "Casablanca, Maroc • MAD • ICE", fl: "MA", sel: false },
    { n: "Helvetia Horlogerie Lab Sàrl (Exemple)", c: "Genève, Suisse • CHF • UID", fl: "CH", sel: false },
    { n: "Northstar Cloud Systems Inc. (Sample)", c: "Austin, USA • USD • PDF EN", fl: "US", sel: false },
    { n: "شركة الأطلس للابتكار ش.م.م (نموذج)", c: "الرباط، المغرب • MAD • PDF AR", fl: "MA", sel: false },
  ]
    .map((cl, i) => {
      const cy = 124 + i * 94;
      return `<g transform="translate(52, ${cy})">
        <rect width="380" height="78" rx="16" fill="${cl.sel ? "#EEF3FF" : "#FFFFFF"}" stroke="${cl.sel ? "#2457F5" : "#E3E6EC"}"/>
        ${flagSvg(cl.fl, 16, 18, 10)}
        <text x="46" y="32" font-size="13" font-weight="bold" fill="#14171F">${esc(cl.n)}</text>
        <text x="46" y="54" font-size="11.5" fill="#667085">${esc(cl.c)}</text>
      </g>`;
    })
    .join("\n")}

  <!-- Right Client Profile -->
  <rect x="476" y="98" width="652" height="774" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  ${flagSvg("FR", 506, 126, 16)}
  <text x="550" y="142" font-size="20" font-weight="bold" fill="#14171F">Maison Lumière Digital SAS (Exemple)</text>
  <text x="550" y="164" font-size="12.5" fill="#667085">Contact : Claire Moreau • finance@maisonlumiere-sample.fr</text>
  <rect x="960" y="126" width="140" height="36" rx="12" fill="#0F3D3A"/>
  <text x="1030" y="149" text-anchor="middle" font-size="12" font-weight="bold" fill="#BFF0D4">Créer un devis</text>

  <rect x="506" y="196" width="140" height="68" rx="14" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="520" y="220" font-size="10.5" fill="#667085">Pays &amp; Type</text>
  <text x="520" y="244" font-size="13" font-weight="bold" fill="#14171F">France (Export)</text>

  <rect x="658" y="196" width="160" height="68" rx="14" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="672" y="220" font-size="10.5" fill="#667085">TVA Intracom.</text>
  <text x="672" y="244" font-size="12.5" font-weight="bold" fill="#14171F">FR 44 899000112</text>

  <rect x="830" y="196" width="130" height="68" rx="14" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="844" y="220" font-size="10.5" fill="#667085">Langue PDF</text>
  <text x="844" y="244" font-size="13" font-weight="bold" fill="#14171F">Français (FR)</text>

  <rect x="972" y="196" width="128" height="68" rx="14" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="986" y="220" font-size="10.5" fill="#667085">Devise défaut</text>
  <text x="986" y="244" font-size="13" font-weight="bold" fill="#2457F5">EUR (€)</text>

  <rect x="506" y="284" width="594" height="84" rx="14" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="524" y="310" font-size="11.5" font-weight="bold" fill="#667085">ADRESSE &amp; NOTES INTERNES</text>
  <text x="524" y="332" font-size="12.5" fill="#14171F">24 Rue du Faubourg Saint-Martin, 75010 Paris — Règlement SEPA 30j (Exemple).</text>

  <text x="506" y="408" font-size="15" font-weight="bold" fill="#14171F">Historique des documents du client</text>
  <rect x="506" y="424" width="594" height="130" rx="14" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="526" y="462" font-size="12.5" font-weight="bold" fill="#2457F5">FAC-2026-0018</text>
  <text x="680" y="462" font-size="12.5" fill="#525866">04/03/2026</text>
  <text x="830" y="462" font-size="12.5" font-weight="bold" fill="#14171F">4 895,00 EUR</text>
  ${badgeSvg(980, 446, "sent")}
  <text x="526" y="514" font-size="12.5" font-weight="bold" fill="#3F4654">Brouillon Proforma</text>
  <text x="680" y="514" font-size="12.5" fill="#525866">08/03/2026</text>
  <text x="830" y="514" font-size="12.5" font-weight="bold" fill="#14171F">2 200,00 EUR</text>
  ${badgeSvg(980, 498, "draft")}
`
);

// 06 — PROJECTS / MISSIONS
const svg06 = appFrameShell(
  "projects",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <text x="32" y="42" font-size="12" fill="#667085">Suivi des missions, tâches livrables &amp; Catalogue de services</text>
  <text x="32" y="70" font-size="22" font-weight="bold" fill="#14171F">Projets / Missions &amp; Tâches</text>

  <!-- Left Missions -->
  <rect x="32" y="98" width="420" height="160" rx="20" fill="#FFFFFF" stroke="#2457F5" stroke-width="1.6"/>
  <text x="56" y="130" font-size="11.5" font-weight="bold" fill="#2457F5">PRJ-2026-01 • En cours</text>
  <text x="56" y="156" font-size="15" font-weight="bold" fill="#14171F">Refonte Portail B2B — Maison Lumière</text>
  <text x="56" y="182" font-size="12" fill="#667085">2/3 tâches terminées • Budget : 5 400,00 EUR</text>

  <rect x="32" y="274" width="420" height="150" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="306" font-size="11.5" font-weight="bold" fill="#667085">PRJ-2026-02 • En cours</text>
  <text x="56" y="332" font-size="15" font-weight="bold" fill="#14171F">Application Flotte — Koutoubia SARL</text>
  <text x="56" y="358" font-size="12" fill="#667085">2/3 tâches terminées • Budget : 38 000,00 MAD</text>

  <!-- Right Project Detail + Tasks + Créer un devis -->
  <rect x="476" y="98" width="652" height="774" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="506" y="136" font-size="12" font-weight="bold" fill="#2457F5">PRJ-2026-01 • Échéance 30/04/2026</text>
  <text x="506" y="164" font-size="20" font-weight="bold" fill="#14171F">Refonte Portail Client B2B (Exemple)</text>
  <rect x="936" y="126" width="164" height="40" rx="12" fill="#2457F5"/>
  <text x="1018" y="151" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#FFFFFF">+ Créer un devis</text>

  <text x="506" y="204" font-size="12.5" fill="#525866">Mission complète d'architecture UX, Design System accessible AA et maquettes responsive.</text>

  <text x="506" y="250" font-size="15" font-weight="bold" fill="#14171F">Tâches de la mission (importables dans le devis)</text>
  ${[
    { t: "✓ Audit parcours client & architecture d'information (Exemple)", q: "3 jours × 550 EUR", tot: "1 650,00 EUR", done: true },
    { t: "✓ Bibliothèque de composants UI & tokens AA (Exemple)", q: "1 forfait × 2 200 EUR", tot: "2 200,00 EUR", done: true },
    { t: "☐ Maquettes haute fidélité Desktop & Mobile + recette (Exemple)", q: "3 jours × 550 EUR", tot: "1 650,00 EUR", done: false },
  ]
    .map((tk, i) => {
      const ty = 270 + i * 76;
      return `<g transform="translate(506, ${ty})">
        <rect width="594" height="62" rx="14" fill="${tk.done ? "#F8F9FB" : "#FFFFFF"}" stroke="#E3E6EC"/>
        <text x="20" y="27" font-size="12.5" font-weight="bold" fill="#14171F">${esc(tk.t)}</text>
        <text x="20" y="47" font-size="11" fill="#667085">${esc(tk.q)}</text>
        <text x="574" y="36" text-anchor="end" font-size="13" font-weight="bold" fill="#14171F">${tk.tot}</text>
      </g>`;
    })
    .join("\n")}
`
);

// 07 — SETTINGS
const svg07 = appFrameShell(
  "settings",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <text x="32" y="42" font-size="12" fill="#667085">Identité légale Maroc, RIB/IBAN par devise, numérotation verrouillée &amp; plafond</text>
  <text x="32" y="70" font-size="22" font-weight="bold" fill="#14171F">Paramètres de l'Auto-Entrepreneur</text>
  <rect x="920" y="38" width="208" height="40" rx="12" fill="#2457F5"/>
  <text x="1024" y="63" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#FFFFFF">Enregistrer les réglages</text>

  <!-- Left: Profile + Ceiling + Numbering -->
  <rect x="32" y="98" width="532" height="250" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="132" font-size="15" font-weight="bold" fill="#14171F">Profil juridique &amp; Identifiants AE Maroc</text>
  <rect x="56" y="150" width="484" height="42" rx="12" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="72" y="176" font-size="12" font-weight="bold" fill="#14171F">Titulaire : Youssef El Amrani — Atelier Zellige (Exemple)</text>
  <rect x="56" y="204" width="236" height="42" rx="12" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="72" y="230" font-size="12" font-weight="bold" fill="#14171F">ICE : 000000000000099</text>
  <rect x="304" y="204" width="236" height="42" rx="12" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="320" y="230" font-size="12" font-weight="bold" fill="#14171F">N° AE : AE-2026-009841</text>
  <text x="56" y="280" font-size="12" fill="#667085">Activité : Conseil en design produit &amp; ingénierie logicielle • Casablanca</text>

  <rect x="32" y="368" width="532" height="210" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="402" font-size="15" font-weight="bold" fill="#14171F">Plafond annuel Auto-Entrepreneur (Loi 114-13)</text>
  <rect x="56" y="422" width="236" height="128" rx="16" fill="#0F3D3A"/>
  <text x="74" y="454" font-size="12" fill="#BFF0D4">Prestations de services ✓</text>
  <text x="74" y="490" font-size="20" font-weight="bold" fill="#FFFFFF">200 000 MAD / an</text>
  <text x="74" y="520" font-size="11.5" fill="#BFF0D4">IR libératoire : 1%</text>

  <rect x="304" y="422" width="236" height="128" rx="16" fill="#F8F9FB" stroke="#E3E6EC"/>
  <text x="322" y="454" font-size="12" fill="#667085">Commerce &amp; Artisanat</text>
  <text x="322" y="490" font-size="20" font-weight="bold" fill="#14171F">500 000 MAD / an</text>
  <text x="322" y="520" font-size="11.5" fill="#667085">IR libératoire : 0,5%</text>

  <rect x="32" y="598" width="532" height="270" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="56" y="632" font-size="15" font-weight="bold" fill="#14171F">Numérotation séquentielle verrouillée (2026)</text>
  <text x="56" y="672" font-size="13" font-weight="bold" fill="#0F3D3A">DEV-2026-0015  •  PRO-2026-0006  •  FAC-2026-0019</text>
  <text x="56" y="708" font-size="13" font-weight="bold" fill="#0F3D3A">ACO-2026-0005  •  AVO-2026-0003</text>
  <text x="56" y="750" font-size="11.5" fill="#667085">Séquence continue sans trou ni suppression après émission.</text>

  <!-- Right: Bank Accounts per Currency + Legal Mentions -->
  <rect x="588" y="98" width="540" height="430" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="614" y="132" font-size="15" font-weight="bold" fill="#14171F">Coordonnées bancaires par devise (RIB / IBAN + SWIFT)</text>
  ${[
    { c: "MAD", b: "Banque Atlantique Maroc (RIB 24 chiffres)", i: "230 780 0000123456789000 44 (Exemple)" },
    { c: "EUR", b: "Compte Devises Zone SEPA (IBAN + SWIFT)", i: "MA64 2307 8000 0098 7654 3210 0088 • BAMMAMCXXXX" },
    { c: "CHF", b: "Correspondant Suisse CHF (IBAN + SWIFT)", i: "CH93 0000 0000 1234 5678 9 • POFICHBEXXX" },
    { c: "USD", b: "Compte Export USD (IBAN + SWIFT)", i: "MA64 2307 8000 0055 4433 2211 0019 • BAMMAMCXXXX" },
  ]
    .map((bk, idx) => {
      const by = 154 + idx * 86;
      return `<g transform="translate(614, ${by})">
        <rect width="488" height="72" rx="14" fill="#F8F9FB" stroke="#E3E6EC"/>
        ${flagSvg(bk.c, 16, 14, 9)}
        <text x="42" y="28" font-size="12.5" font-weight="bold" fill="#14171F">${bk.c} — ${esc(bk.b)}</text>
        <text x="42" y="52" font-size="11.5" fill="#3F4654">${esc(bk.i)}</text>
      </g>`;
    })
    .join("\n")}

  <rect x="588" y="548" width="540" height="320" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="614" y="582" font-size="15" font-weight="bold" fill="#14171F">Mentions légales par juridiction (FR / EN / AR)</text>
  <text x="614" y="618" font-size="11.5" font-weight="bold" fill="#14171F">Maroc (FR) : TVA non applicable — Art. 89-I-12° du CGI.</text>
  <text x="614" y="656" font-size="11.5" font-weight="bold" fill="#14171F">Export (EN) : VAT exempt digital services — Art. 92-I-1° CGI.</text>
  <text x="1100" y="698" text-anchor="end" font-size="12" font-weight="bold" fill="#0F3D3A">غير خاضع للضريبة على القيمة المضافة — المادة 89 من المدونة العامة للضرائب</text>
`
);

// 08 — LOGIN / REGISTER + EMPTY STATES + VALIDATION ERROR
const svg08 = appFrameShell(
  "settings",
  `
  <rect width="1160" height="904" fill="#F3F4F6"/>
  <text x="32" y="42" font-size="12" fill="#667085">Écran 8 • Authentification mono-utilisateur, États vides &amp; Validation WCAG AA</text>
  <text x="32" y="70" font-size="22" font-weight="bold" fill="#14171F">Connexion, États vides &amp; État d'erreur</text>

  <!-- Login Card -->
  <rect x="32" y="98" width="430" height="774" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="62" y="148" font-size="19" font-weight="bold" fill="#14171F">Connexion à votre espace Facturo</text>
  <text x="62" y="172" font-size="12" fill="#667085">Espace mono-utilisateur Auto-Entrepreneur Maroc</text>
  <rect x="62" y="210" width="370" height="48" rx="12" fill="#FFFFFF" stroke="#2457F5" stroke-width="1.6"/>
  <text x="78" y="228" font-size="10" font-weight="bold" fill="#2457F5">E-mail professionnel*</text>
  <text x="78" y="248" font-size="12.5" fill="#14171F">youssef.sample@atelier-exemple.ma</text>
  <rect x="62" y="276" width="370" height="48" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="78" y="294" font-size="10" fill="#667085">Mot de passe*</text>
  <text x="78" y="314" font-size="13" fill="#14171F">••••••••••••••</text>
  <rect x="62" y="346" width="370" height="44" rx="12" fill="#2457F5"/>
  <text x="247" y="373" text-anchor="middle" font-size="13" font-weight="bold" fill="#FFFFFF">Se connecter à Facturo</text>

  <!-- Empty State 1: No Clients -->
  <rect x="486" y="98" width="312" height="320" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <circle cx="642" cy="176" r="28" fill="#F3F4F6"/>
  <text x="642" y="236" text-anchor="middle" font-size="15" font-weight="bold" fill="#14171F">Aucun client enregistré</text>
  <text x="642" y="262" text-anchor="middle" font-size="11.5" fill="#667085">Ajoutez votre premier client Maroc</text>
  <text x="642" y="280" text-anchor="middle" font-size="11.5" fill="#667085">ou Export (MAD, EUR, CHF, USD).</text>
  <rect x="542" y="320" width="200" height="40" rx="12" fill="#2457F5"/>
  <text x="642" y="345" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">+ Ajouter un client</text>

  <!-- Empty State 2: No Documents -->
  <rect x="816" y="98" width="312" height="320" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <circle cx="972" cy="176" r="28" fill="#E6F4EE"/>
  <text x="972" y="236" text-anchor="middle" font-size="15" font-weight="bold" fill="#14171F">Aucun document émis</text>
  <text x="972" y="262" text-anchor="middle" font-size="11.5" fill="#667085">Créez votre premier devis ou</text>
  <text x="972" y="280" text-anchor="middle" font-size="11.5" fill="#667085">facture en FR, EN ou Arabe RTL.</text>
  <rect x="866" y="320" width="212" height="40" rx="12" fill="#0F3D3A"/>
  <text x="972" y="345" text-anchor="middle" font-size="12" font-weight="bold" fill="#BFF0D4">+ Créer un document</text>

  <!-- Validation Error State -->
  <rect x="486" y="442" width="642" height="430" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="514" y="482" font-size="16" font-weight="bold" fill="#14171F">État d'erreur de validation (Accessible WCAG AA : Icône + Texte)</text>
  <rect x="514" y="502" width="586" height="58" rx="12" fill="#FDE3E3" stroke="#A31D1D"/>
  <text x="534" y="527" font-size="12.5" font-weight="bold" fill="#A31D1D">! Impossible d'émettre la facture : 3 champs obligatoires invalides</text>
  <text x="534" y="547" font-size="11.5" fill="#A31D1D">Corrigez les erreurs signalées avant l'attribution du numéro séquentiel.</text>

  <rect x="514" y="586" width="280" height="48" rx="12" fill="#FFF8F8" stroke="#A31D1D" stroke-width="1.6"/>
  <text x="528" y="615" font-size="12.5" font-weight="bold" fill="#A31D1D">00159900 (ICE incomplet)</text>
  <text x="514" y="652" font-size="11" font-weight="bold" fill="#A31D1D">! L'ICE marocain doit comporter 15 chiffres.</text>

  <rect x="820" y="586" width="280" height="48" rx="12" fill="#FFF8F8" stroke="#A31D1D" stroke-width="1.6"/>
  <text x="834" y="615" font-size="12.5" font-weight="bold" fill="#A31D1D">Prix unitaire : 0,00 EUR</text>
  <text x="820" y="652" font-size="11" font-weight="bold" fill="#A31D1D">! Le prix unitaire doit être supérieur à 0.</text>
`
);

// 09 — MOBILE 390PX (DASHBOARD + CREATE DOCUMENT WITH FORM/PREVIEW TABS)
const svg09 = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960" font-family="DejaVu Sans, sans-serif">
  <rect width="1440" height="960" fill="#E4E6EA"/>
  <text x="720" y="48" text-anchor="middle" font-size="20" font-weight="bold" fill="#14171F">Facturo Mobile 390px — Tableau de bord &amp; Création de document (Onglets Formulaire / Aperçu)</text>

  <!-- Phone 1: 390px Dashboard -->
  <g transform="translate(240, 82)">
    <rect width="390" height="820" rx="36" fill="#F3F4F6" stroke="#14171F" stroke-width="8"/>
    <rect x="4" y="4" width="382" height="58" rx="28" fill="#FFFFFF"/>
    <text x="24" y="40" font-size="16" font-weight="bold" fill="#14171F">facturo</text>
    <rect x="300" y="22" width="66" height="22" rx="11" fill="#DDF5E6"/>
    <text x="333" y="37" text-anchor="middle" font-size="10" font-weight="bold" fill="#0B6B3A">AE 2026</text>

    <rect x="20" y="80" width="350" height="148" rx="18" fill="#0F3D3A"/>
    <text x="38" y="108" font-size="11.5" fill="#BFF0D4">Plafond Auto-Entrepreneur • 71,4%</text>
    <text x="38" y="142" font-size="22" font-weight="bold" fill="#FFFFFF">142 800,00 MAD</text>
    <text x="38" y="166" font-size="11.5" fill="#BFF0D4">sur 200 000,00 MAD (Services)</text>
    <rect x="38" y="186" width="314" height="12" rx="6" fill="#1B5E59"/>
    <rect x="38" y="186" width="224" height="12" rx="6" fill="#BFF0D4"/>

    <rect x="20" y="244" width="168" height="82" rx="16" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="34" y="270" font-size="11" fill="#667085">En attente</text>
    <text x="34" y="302" font-size="16" font-weight="bold" fill="#14171F">52 866 MAD</text>

    <rect x="202" y="244" width="168" height="82" rx="16" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="216" y="270" font-size="11" fill="#667085">En retard</text>
    <text x="216" y="302" font-size="16" font-weight="bold" fill="#A31D1D">12 600 MAD</text>

    <rect x="20" y="342" width="350" height="390" rx="18" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="38" y="374" font-size="14" font-weight="bold" fill="#14171F">Documents récents</text>
    <text x="38" y="416" font-size="12.5" font-weight="bold" fill="#14171F">FAC-2026-0018 • 4 895 EUR</text>
    ${badgeSvg(270, 398, "sent")}
    <text x="38" y="476" font-size="12.5" font-weight="bold" fill="#14171F">FAC-2026-0017 • 44 000 MAD</text>
    ${badgeSvg(270, 458, "paid")}
    <text x="38" y="536" font-size="12.5" font-weight="bold" fill="#14171F">FAC-2026-0015 • 12 600 MAD</text>
    ${badgeSvg(270, 518, "overdue")}
  </g>

  <!-- Phone 2: 390px Create Document (Form | Preview Tabs) -->
  <g transform="translate(810, 82)">
    <rect width="390" height="820" rx="36" fill="#FFFFFF" stroke="#14171F" stroke-width="8"/>
    <text x="24" y="42" font-size="15" font-weight="bold" fill="#14171F">Créer une facture</text>
    <rect x="256" y="24" width="110" height="22" rx="7" fill="#E8EAEE"/>
    <text x="311" y="39" text-anchor="middle" font-size="10" font-weight="bold" fill="#3F4654">FAC-2026-0019</text>

    <!-- Form / Preview Segmented Tabs -->
    <rect x="20" y="62" width="350" height="38" rx="12" fill="#F3F4F6"/>
    <rect x="24" y="66" width="170" height="30" rx="9" fill="#FFFFFF"/>
    <text x="109" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#14171F">Formulaire</text>
    <text x="282" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#2457F5">Aperçu A4</text>

    <rect x="20" y="120" width="350" height="48" rx="12" fill="#FFFFFF" stroke="#2457F5" stroke-width="1.6"/>
    <text x="36" y="149" font-size="12.5" font-weight="bold" fill="#14171F">Client : Maison Lumière SAS (Exemple)</text>

    <rect x="20" y="182" width="168" height="46" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="34" y="210" font-size="12" font-weight="bold" fill="#14171F">Devise : EUR</text>
    <rect x="202" y="182" width="168" height="46" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="216" y="210" font-size="12" font-weight="bold" fill="#2457F5">PDF : FR / EN / AR</text>

    <rect x="20" y="244" width="350" height="120" rx="18" fill="#F8F9FB" stroke="#E3E6EC"/>
    <text x="36" y="274" font-size="12.5" font-weight="bold" fill="#14171F">Ligne 1 • Design System AA</text>
    <text x="36" y="302" font-size="11.5" fill="#667085">1 forfait × 2 200,00 EUR • TVA 0%</text>
    <text x="36" y="338" font-size="13" font-weight="bold" fill="#0F3D3A">Total : 4 290,00 EUR (≈ 46 332 MAD)</text>

    <!-- Sticky Bottom Bar -->
    <line x1="8" y1="744" x2="382" y2="744" stroke="#E3E6EC"/>
    <rect x="20" y="758" width="164" height="42" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="102" y="784" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#14171F">Brouillon</text>
    <rect x="198" y="758" width="172" height="42" rx="12" fill="#2457F5"/>
    <text x="284" y="784" text-anchor="middle" font-size="12.5" font-weight="bold" fill="#FFFFFF">Émettre</text>
  </g>
</svg>`;

// 10 — DESIGN SYSTEM SHEET
const svg10 = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960" font-family="DejaVu Sans, sans-serif">
  <rect width="1440" height="960" fill="#E4E6EA"/>
  <rect x="28" y="28" width="1384" height="904" rx="22" fill="#F3F4F6" stroke="#D8DCE5"/>
  <text x="64" y="74" font-size="24" font-weight="bold" fill="#14171F">Facturo — One-Page Design System Sheet</text>
  <text x="64" y="98" font-size="12.5" fill="#667085">Color Tokens • Typography (Inter &amp; IBM Plex Sans Arabic) • Radii (18-20px / 12px) • Status Badges • Interactive States</text>

  <!-- Color Swatches -->
  <rect x="56" y="118" width="1328" height="164" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="80" y="148" font-size="14" font-weight="bold" fill="#14171F">1. Brand &amp; Surface Tokens</text>
  ${[
    { n: "Ink", h: "#14171F" },
    { n: "Electric Blue", h: "#2457F5" },
    { n: "Blue Hover", h: "#1B45C9" },
    { n: "Deep Green", h: "#0F3D3A" },
    { n: "Mint", h: "#BFF0D4" },
    { n: "App Bg", h: "#F3F4F6" },
    { n: "Outer Frame", h: "#E4E6EA" },
    { n: "Border", h: "#E3E6EC" },
  ]
    .map((sw, i) => {
      const sx = 80 + i * 160;
      return `<g transform="translate(${sx}, 166)">
        <rect width="142" height="58" rx="12" fill="${sw.h}" stroke="#D0D5DD"/>
        <text x="0" y="78" font-size="11.5" font-weight="bold" fill="#14171F">${sw.n}</text>
        <text x="0" y="94" font-size="10.5" fill="#667085">${sw.h}</text>
      </g>`;
    })
    .join("\n")}

  <!-- Badges & Typography -->
  <rect x="56" y="300" width="1328" height="150" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="80" y="332" font-size="14" font-weight="bold" fill="#14171F">2. Semantic Status Badges &amp; Typography Scale (Latin + Arabic RTL)</text>
  ${badgeSvg(80, 352, "paid")}
  ${badgeSvg(176, 352, "sent")}
  ${badgeSvg(280, 352, "pending")}
  ${badgeSvg(394, 352, "overdue")}
  ${badgeSvg(500, 352, "draft")}
  <text x="80" y="418" font-size="16" font-weight="bold" fill="#14171F">Inter Bold 22px / SemiBold 16px / Body 13px (tabular-nums : 142 800,00 MAD)</text>
  <text x="1350" y="418" text-anchor="end" font-size="16" font-weight="bold" fill="#0F3D3A">خط IBM Plex Sans Arabic — فاتورة المقاول الذاتي</text>

  <!-- Component States Matrix -->
  <rect x="56" y="468" width="1328" height="434" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="80" y="502" font-size="14" font-weight="bold" fill="#14171F">3. Component States Matrix : Normal • Hover • Focus (AA) • Disabled • Error</text>

  <text x="260" y="538" font-size="11" font-weight="bold" fill="#667085">NORMAL</text>
  <text x="480" y="538" font-size="11" font-weight="bold" fill="#667085">HOVER</text>
  <text x="700" y="538" font-size="11" font-weight="bold" fill="#667085">FOCUS (2PX RING)</text>
  <text x="930" y="538" font-size="11" font-weight="bold" fill="#667085">DISABLED</text>
  <text x="1150" y="538" font-size="11" font-weight="bold" fill="#667085">ERROR (ICON+TEXT)</text>

  <!-- Row 1: Button -->
  <text x="80" y="588" font-size="12.5" font-weight="bold" fill="#14171F">Primary Button</text>
  <rect x="260" y="564" width="150" height="40" rx="12" fill="#2457F5"/><text x="335" y="589" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Émettre</text>
  <rect x="480" y="564" width="150" height="40" rx="12" fill="#1B45C9"/><text x="555" y="589" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Émettre</text>
  <rect x="696" y="560" width="158" height="48" rx="15" fill="none" stroke="#2457F5" stroke-width="2"/><rect x="700" y="564" width="150" height="40" rx="12" fill="#2457F5"/><text x="775" y="589" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Émettre</text>
  <rect x="930" y="564" width="150" height="40" rx="12" fill="#A7BCFB"/><text x="1005" y="589" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Émettre</text>
  <rect x="1150" y="564" width="170" height="40" rx="12" fill="#A31D1D"/><text x="1235" y="589" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">! Échec envoi</text>

  <!-- Row 2: Input -->
  <text x="80" y="668" font-size="12.5" font-weight="bold" fill="#14171F">Notched Input</text>
  <rect x="260" y="642" width="180" height="42" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/><text x="276" y="668" font-size="12" fill="#14171F">Koutoubia SARL</text>
  <rect x="480" y="642" width="180" height="42" rx="12" fill="#FFFFFF" stroke="#B0B8C5"/><text x="496" y="668" font-size="12" fill="#14171F">Koutoubia SARL</text>
  <rect x="700" y="642" width="180" height="42" rx="12" fill="#FFFFFF" stroke="#2457F5" stroke-width="2"/><text x="716" y="668" font-size="12" font-weight="bold" fill="#14171F">Koutoubia SARL|</text>
  <rect x="930" y="642" width="180" height="42" rx="12" fill="#F3F4F6" stroke="#E3E6EC"/><text x="946" y="668" font-size="12" fill="#98A2B3">FAC-2026-0018</text>
  <rect x="1150" y="642" width="190" height="42" rx="12" fill="#FFF5F5" stroke="#A31D1D" stroke-width="1.6"/><text x="1166" y="668" font-size="12" font-weight="bold" fill="#A31D1D">! ICE invalide</text>

  <!-- Row 3: Select with Flag & Money Input -->
  <text x="80" y="752" font-size="12.5" font-weight="bold" fill="#14171F">Select Flag / Money</text>
  <rect x="260" y="726" width="180" height="42" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>${flagSvg("EUR", 272, 738, 9)}<text x="298" y="752" font-size="12" font-weight="bold" fill="#14171F">4 500,00 EUR</text>
  <rect x="480" y="726" width="180" height="42" rx="12" fill="#F8F9FB" stroke="#B0B8C5"/>${flagSvg("EUR", 492, 738, 9)}<text x="518" y="752" font-size="12" font-weight="bold" fill="#14171F">4 500,00 EUR</text>
  <rect x="700" y="726" width="180" height="42" rx="12" fill="#FFFFFF" stroke="#2457F5" stroke-width="2"/>${flagSvg("MA", 712, 738, 9)}<text x="738" y="752" font-size="12" font-weight="bold" fill="#0F3D3A">48 600 MAD</text>
  <rect x="930" y="726" width="180" height="42" rx="12" fill="#F3F4F6" stroke="#E3E6EC"/>${flagSvg("CHF", 942, 738, 9)}<text x="968" y="752" font-size="12" fill="#98A2B3">Verrouillé</text>
  <rect x="1150" y="726" width="190" height="42" rx="12" fill="#FFF5F5" stroke="#A31D1D" stroke-width="1.6"/><text x="1166" y="752" font-size="12" font-weight="bold" fill="#A31D1D">! Montant &lt;= 0</text>
</svg>`;

// 04 — DASHBOARD (greeting + ceiling hero + action queue + declarations)
const svg04Dashboard = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1280" viewBox="0 0 1440 1280" font-family="DejaVu Sans, sans-serif">
  <rect width="1440" height="1280" fill="#FFFFFF"/>
  <line x1="236" y1="0" x2="236" y2="1280" stroke="#E3E6EC"/>

  <!-- Sidebar -->
  <g transform="translate(24, 24)">
    <circle cx="17" cy="17" r="17" fill="#14171F"/>
    <text x="17" y="23" text-anchor="middle" font-size="17" font-weight="bold" fill="#FFFFFF">F</text>
    <text x="44" y="24" font-size="18" font-weight="bold" fill="#14171F">Facturo</text>
  </g>
  ${[
    { l: "Tableau de bord", y: 92, a: true },
    { l: "Devis", y: 136, a: false },
    { l: "Factures", y: 180, a: false },
    { l: "Clients", y: 224, a: false },
    { l: "Projets", y: 268, a: false },
    { l: "Paiements", y: 312, a: false },
    { l: "Déclarations", y: 356, a: false },
  ]
    .map(
      (item) => `<g transform="translate(16, ${item.y})">
        ${item.a ? `<rect width="204" height="38" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>` : ""}
        <rect x="14" y="13" width="12" height="12" rx="3" fill="none" stroke="${item.a ? "#14171F" : "#667085"}" stroke-width="1.6"/>
        <text x="38" y="25" font-size="12.5" font-weight="${item.a ? "bold" : "normal"}" fill="${item.a ? "#14171F" : "#3F4654"}">${item.l}</text>
      </g>`
    )
    .join("\n")}

  <g transform="translate(16, 1104)">
    <rect x="14" y="10" width="12" height="12" rx="6" fill="none" stroke="#667085" stroke-width="1.6"/>
    <text x="38" y="22" font-size="12.5" fill="#3F4654">Aide et support</text>
  </g>
  <g transform="translate(16, 1148)">
    <rect x="14" y="10" width="12" height="12" rx="3" fill="none" stroke="#667085" stroke-width="1.6"/>
    <text x="38" y="22" font-size="12.5" fill="#3F4654">Paramètres</text>
  </g>
  <g transform="translate(16, 1192)">
    <circle cx="20" cy="17" r="6" fill="none" stroke="#667085" stroke-width="1.6"/>
    <text x="38" y="22" font-size="12.5" fill="#3F4654">Mode sombre</text>
    <rect x="166" y="8" width="30" height="18" rx="9" fill="#E3E6EC"/>
    <circle cx="175" cy="17" r="6.5" fill="#FFFFFF"/>
  </g>
  <g transform="translate(16, 1232)">
    <rect width="204" height="40" rx="14" fill="#FFFFFF" stroke="#E3E6EC"/>
    <circle cx="22" cy="20" r="13" fill="#0F3D3A"/>
    <text x="22" y="24" text-anchor="middle" font-size="10" font-weight="bold" fill="#BFF0D4">YE</text>
    <text x="42" y="18" font-size="11.5" font-weight="bold" fill="#14171F">Youssef El Amrani</text>
    <text x="42" y="32" font-size="10" fill="#667085">youssef.sample@atelier-exemple.ma</text>
  </g>

  <!-- Header -->
  <text x="268" y="42" font-size="12.5" fill="#667085">Vendredi 20 novembre 2026</text>
  <text x="268" y="74" font-size="21" font-weight="bold" fill="#14171F">Bonjour Youssef, voici ce qui compte aujourd'hui</text>
  <rect x="932" y="32" width="156" height="40" rx="9" fill="#FFF0D6"/>
  <text x="1010" y="57" text-anchor="middle" font-size="12" font-weight="bold" fill="#8A4B00">Données d'exemple</text>
  <rect x="1100" y="32" width="124" height="40" rx="12" fill="#FFFFFF" stroke="#E3E6EC"/>
  <text x="1162" y="57" text-anchor="middle" font-size="12" font-weight="bold" fill="#14171F">Nouveau devis</text>
  <rect x="1236" y="32" width="172" height="40" rx="12" fill="#2457F5"/>
  <text x="1322" y="57" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Nouvelle facture</text>

  <!-- Hero ceiling -->
  <g transform="translate(268, 104)">
    <rect width="755" height="330" rx="20" fill="#0F3D3A"/>
    <text x="24" y="36" font-size="12.5" fill="#D6EFE1">Chiffre d'affaires encaissé en 2026 · activité de services</text>
    <rect x="614" y="18" width="117" height="26" rx="13" fill="#FCE7B6"/>
    <text x="672" y="35" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#7A3E00">77 % · Vigilance</text>

    <text x="24" y="96" font-size="40" font-weight="bold" fill="#FFFFFF">154 780</text>
    <text x="212" y="96" font-size="17" font-weight="bold" fill="#D6EFE1">MAD</text>

    <rect x="24" y="116" width="707" height="10" rx="5" fill="#FFFFFF" opacity="0.14"/>
    <rect x="24" y="116" width="430" height="10" rx="5" fill="#34D399"/>
    <rect x="454" y="116" width="171" height="10" rx="0" fill="#F5B544"/>
    <rect x="625" y="116" width="106" height="10" rx="5" fill="#F87171"/>
    <rect x="545" y="108" width="4" height="26" rx="2" fill="#FFFFFF"/>
    <circle cx="547" cy="121" r="7" fill="#FFFFFF" stroke="#0F3D3A" stroke-width="3"/>

    <circle cx="28" cy="148" r="4" fill="#34D399"/>
    <text x="40" y="152" font-size="11.5" fill="#D6EFE1">Sûr · 0–60 %</text>
    <circle cx="152" cy="148" r="4" fill="#F5B544"/>
    <text x="164" y="152" font-size="11.5" fill="#D6EFE1">Vigilance · 60–85 %</text>
    <circle cx="316" cy="148" r="4" fill="#F87171"/>
    <text x="328" y="152" font-size="11.5" fill="#D6EFE1">Limite · 85 % et plus</text>

    <text x="24" y="184" font-size="12" font-weight="bold" fill="#FFFFFF">Reste 45 220 MAD avant le plafond</text>
    <text x="731" y="184" text-anchor="end" font-size="12" fill="#D6EFE1">Plafond configuré · 200 000 MAD (modifiable)</text>

    <rect x="24" y="198" width="707" height="104" rx="12" fill="#FFFFFF" opacity="0.1"/>
    <text x="44" y="230" font-size="12.5" fill="#EAFBF1">Au rythme actuel (≈ 14 071 MAD/mois), le plafond serait atteint vers février 2027. Les factures</text>
    <text x="44" y="252" font-size="12.5" fill="#EAFBF1">à encaisser ci-dessous ne comptent qu'une fois payées.</text>
  </g>

  <!-- Cashflow cards -->
  <g transform="translate(1039, 104)">
    <rect width="369" height="160" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="22" y="34" font-size="12.5" fill="#525866">À encaisser</text>
    <text x="22" y="74" font-size="26" font-weight="bold" fill="#14171F">65 466</text>
    <text x="140" y="74" font-size="14" font-weight="bold" fill="#14171F">MAD</text>
    <text x="22" y="102" font-size="12" fill="#667085">2 factures · <tspan font-weight="bold" fill="#A31D1D">dont 1 en retard</tspan></text>
  </g>
  <g transform="translate(1039, 272)">
    <rect width="369" height="162" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="22" y="34" font-size="12.5" fill="#525866">À facturer</text>
    <text x="22" y="74" font-size="26" font-weight="bold" fill="#14171F">86 580</text>
    <text x="140" y="74" font-size="14" font-weight="bold" fill="#14171F">MAD</text>
    <text x="22" y="102" font-size="12" fill="#667085">1 devis accepté + 3 tâches non facturées</text>
  </g>

  <!-- Billing cycle -->
  <g transform="translate(268, 444)">
    <rect width="1140" height="150" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="24" y="36" font-size="16" font-weight="bold" fill="#14171F">Votre cycle de facturation</text>
    <text x="1116" y="36" text-anchor="end" font-size="12" fill="#667085">Du devis au paiement reçu</text>
    ${[
      { x: 24, l: "Devis envoyés", n: "2", a: "31 460 MAD", mint: false },
      { x: 310, l: "Acceptés", n: "1", a: "18 500 MAD", mint: false },
      { x: 596, l: "Factures émises", n: "7", a: "220 583 MAD", mint: false },
      { x: 882, l: "Payées ce mois", n: "1", a: "6 600 MAD reçus", mint: true },
    ]
      .map(
        (c) => `<g transform="translate(${c.x}, 52)">
          <rect width="234" height="78" rx="14" fill="${c.mint ? "#E7F7EE" : "#F7F8FA"}"/>
          <text x="16" y="24" font-size="12" fill="${c.mint ? "#0B6B3A" : "#667085"}">${c.l}</text>
          <text x="16" y="50" font-size="20" font-weight="bold" fill="${c.mint ? "#0B6B3A" : "#14171F"}">${c.n}</text>
          <text x="16" y="68" font-size="11.5" fill="${c.mint ? "#0B6B3A" : "#525866"}">${c.a}</text>
        </g>`
      )
      .join("\n")}
    <text x="270" y="98" font-size="14" fill="#98A2B3">›</text>
    <text x="556" y="98" font-size="14" fill="#98A2B3">›</text>
    <text x="842" y="98" font-size="14" fill="#98A2B3">›</text>
  </g>

  <!-- Action queue -->
  <g transform="translate(268, 610)">
    <rect width="755" height="310" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="24" y="36" font-size="16" font-weight="bold" fill="#14171F">À faire maintenant</text>
    <rect x="659" y="16" width="72" height="26" rx="13" fill="#FDE3E3"/>
    <text x="695" y="33" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#A31D1D">5 actions</text>
    ${[
      { y: 62, dot: "#E5534B", t: "FAC-2026-0015 · Koutoubia Logistique SARL", m: "En retard de 12 jours · 12 600,00 MAD", cta: "Relancer", primary: false },
      { y: 110, dot: "#2457F5", t: "DEV-2026-0014 accepté · Atlas Innovation (Exemple)", m: "18 500 MAD prêts à facturer", cta: "Convertir en facture", primary: true },
      { y: 158, dot: "#F0A32A", t: "DEV-2026-0013 · validité dépassée", m: "Maison Lumière Digital SAS · 12 960 MAD · sans réponse", cta: "Relancer", primary: false },
      { y: 206, dot: "#F0A32A", t: "Mission « Application Suivi Flotte » · Koutoubia", m: "2 tâches terminées, non facturées · 26 500 MAD", cta: "Créer la facture", primary: false },
      { y: 254, dot: "#12A05C", t: "Règlement attendu · FAC-2026-0018", m: "4 895,00 EUR · saisir le montant reçu en MAD", cta: "Enregistrer", primary: false },
    ]
      .map(
        (a) => `<g transform="translate(0, ${a.y})">
          <circle cx="32" cy="16" r="4" fill="${a.dot}"/>
          <text x="46" y="20" font-size="13" font-weight="bold" fill="#14171F">${esc(a.t)}</text>
          <text x="46" y="38" font-size="11.5" fill="#667085">${esc(a.m)}</text>
          ${
            a.primary
              ? `<rect x="521" y="6" width="170" height="34" rx="10" fill="#2457F5"/><text x="606" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">${a.cta}</text>`
              : `<rect x="589" y="6" width="142" height="34" rx="10" fill="#F7F8FA" stroke="#E3E6EC"/><text x="660" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#14171F">${a.cta}</text>`
          }
          <line x1="16" y1="50" x2="739" y2="50" stroke="#F0F2F5"/>
        </g>`
      )
      .join("\n")}
  </g>

  <!-- Declaration -->
  <g transform="translate(1039, 610)">
    <rect width="369" height="214" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="22" y="32" font-size="16" font-weight="bold" fill="#14171F">Déclaration du chiffre d'affaires</text>
    <text x="22" y="54" font-size="12" fill="#667085">T4 2026 · rythme trimestriel</text>
    <text x="22" y="88" font-size="26" font-weight="bold" fill="#14171F">47 980</text>
    <text x="128" y="88" font-size="14" font-weight="bold" fill="#14171F">MAD</text>
    <text x="22" y="110" font-size="12" fill="#667085">encaissés depuis le 1er octobre, à déclarer</text>
    <rect x="22" y="124" width="325" height="44" rx="12" fill="#F7F8FA"/>
    <text x="36" y="143" font-size="11.5" fill="#525866">Contribution estimée : [taux à configurer]</text>
    <text x="36" y="159" font-size="11.5" fill="#525866">Échéance : [date à configurer]</text>
    <rect x="22" y="176" width="325" height="26" rx="9" fill="#2457F5"/>
    <text x="184" y="193" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFFFFF">Préparer ma déclaration</text>
  </g>

  <!-- Deadlines -->
  <g transform="translate(1039, 836)">
    <rect width="369" height="88" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="22" y="26" font-size="15" font-weight="bold" fill="#14171F">Prochaines échéances</text>
    ${[
      { y: 34, d: "03", m: "DÉC", t: "Échéance de paiement FAC-2026-0018", c: "Maison Lumière Digital SAS (Exemple)" },
      { y: 62, d: "15", m: "DÉC", t: "Fin de validité DEV-2026-0014", c: "Atlas Innovation (Exemple)" },
    ]
      .map(
        (e) => `<g transform="translate(22, ${e.y})">
          <rect width="34" height="24" rx="7" fill="#F7F8FA"/>
          <text x="17" y="11" text-anchor="middle" font-size="10" font-weight="bold" fill="#14171F">${e.d}</text>
          <text x="17" y="20" text-anchor="middle" font-size="6.5" font-weight="bold" fill="#667085">${e.m}</text>
          <text x="44" y="11" font-size="11.5" font-weight="bold" fill="#14171F">${esc(e.t)}</text>
          <text x="44" y="23" font-size="10" fill="#667085">${esc(e.c)}</text>
        </g>`
      )
      .join("\n")}
  </g>

  <!-- Monthly collections -->
  <g transform="translate(268, 948)">
    <rect width="755" height="276" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="24" y="34" font-size="16" font-weight="bold" fill="#14171F">Encaissements par mois</text>
    <text x="731" y="34" text-anchor="end" font-size="12" fill="#667085">MAD reçus</text>
    <line x1="24" y1="226" x2="731" y2="226" stroke="#ECEEF2"/>
    ${[
      { l: "Juin", v: 44000, h: 112 },
      { l: "Juil.", v: 0, h: 6 },
      { l: "Août", v: 5380, h: 14 },
      { l: "Sept.", v: 57420, h: 146 },
      { l: "Oct.", v: 41380, h: 105 },
      { l: "Nov.", v: 6600, h: 17 },
    ]
      .map((b, i) => {
        const bx = 40 + i * 118;
        const current = i === 5;
        return `<g>
          <rect x="${bx}" y="${226 - b.h}" width="56" height="${b.h}" rx="8" fill="${current ? "#2457F5" : "#DCE3FF"}"/>
          ${b.v > 0 ? `<text x="${bx + 28}" y="${218 - b.h}" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#525866">${Math.round(b.v / 1000)}k</text>` : ""}
          <text x="${bx + 28}" y="${250}" text-anchor="middle" font-size="11.5" fill="#667085">${b.l}</text>
        </g>`;
      })
      .join("\n")}
  </g>

  <!-- Currency origin -->
  <g transform="translate(1039, 948)">
    <rect width="369" height="276" rx="20" fill="#FFFFFF" stroke="#E3E6EC"/>
    <text x="22" y="34" font-size="16" font-weight="bold" fill="#14171F">Origine des encaissements</text>
    <text x="22" y="54" font-size="12" fill="#667085">Par devise, converti en MAD reçus</text>
    ${[
      { y: 78, c: "USD", p: 37, col: "#2457F5" },
      { y: 126, c: "MAD", p: 33, col: "#0F3D3A" },
      { y: 174, c: "CHF", p: 27, col: "#BFF0D4" },
      { y: 222, c: "EUR", p: 3, col: "#8A4B00" },
    ]
      .map(
        (o) => `<g transform="translate(22, ${o.y})">
          <text x="0" y="12" font-size="12.5" font-weight="bold" fill="#14171F">${o.c}</text>
          <text x="325" y="12" text-anchor="end" font-size="12.5" font-weight="bold" fill="#14171F">${o.p} %</text>
          <rect y="22" width="325" height="8" rx="4" fill="#EFF1F4"/>
          <rect y="22" width="${(325 * o.p) / 100}" height="8" rx="4" fill="${o.col}"/>
        </g>`
      )
      .join("\n")}
  </g>
</svg>`;

const jobs = [
  { file: "01-create-document.png", svg: svg01 },
  { file: "01b-create-document-arabic-rtl.png", svg: svg01Rtl },
  { file: "02-documents-list.png", svg: svg02 },
  { file: "03-document-detail.png", svg: svg03 },
  { file: "04-dashboard.png", svg: svg04Dashboard },
  { file: "05-clients.png", svg: svg05 },
  { file: "06-projects-missions.png", svg: svg06 },
  { file: "07-settings.png", svg: svg07 },
  { file: "08-login-empty-error.png", svg: svg08 },
  { file: "09-mobile-390px.png", svg: svg09 },
  { file: "10-design-system-sheet.png", svg: svg10 },
];

for (const job of jobs) {
  const resvg = new Resvg(job.svg, {
    fitTo: { mode: "width", value: 1440 },
    font: {
      fontFiles,
      loadSystemFonts: true,
      defaultFontFamily: "DejaVu Sans",
    },
  });
  const pngBuffer = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT_DOCS, job.file), pngBuffer);
  fs.writeFileSync(path.join(OUT_PUBLIC, job.file), pngBuffer);
  console.log("Generated:", job.file, `${pngBuffer.length} bytes`);
}
