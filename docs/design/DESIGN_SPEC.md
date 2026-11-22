# Facturo — Design System & Product Design Specification

> **Product**: Facturo — Single-user invoicing, quoting, and turnover ceiling tracker for Moroccan Auto-Entrepreneurs (Loi n° 114-13 / CGI Art. 89-I-12° & Art. 92-I-1°).
> **Target Viewports**: Desktop `1440px` primary workspace, Mobile `390px` responsive companion.
> **Supported Currencies**: `MAD`, `EUR`, `CHF`, `USD` (all turnover KPIs and ceiling tracking consolidated in net received `MAD`).
> **Supported Document Languages**: Français (`FR`), English (`EN`), العربية (`AR` — full `RTL`).

---

## 1. Reference Audit: Keep vs. Drop (`create-invoice-reference.png`)

### Kept (Structural & Visual DNA)
1. **Framed 3-Pane `1440px` Desktop Architecture**: Outer `#E4E6EA` frame surrounding a `22px` rounded application shell split into Left Sidebar (`228px`), White Form Pane (`540px`), and Soft Gray Live Preview Stage (`#F3F4F6`).
2. **Notched-Label Form Inputs**: `12px` radius bordered inputs with top-cutout floating labels (`11px` Medium) and crisp `#2457F5` active focus border.
3. **Collapsible Line-Item Cards**: `18px` radius cards (`Ligne 1`, `Ligne 2`) with inline delete and collapse controls, plus full-width `+ Ajouter une ligne` trigger.
4. **Live A4 Paper Stage**: Soft gray stage (`#F3F4F6`) with subtle tilted back-sheet (`-1.35deg`), top action bar (`Aperçu`, `Email | PDF` segmented switch, secondary draft button, primary electric-blue send CTA), circular top-right issuer emblem, bordered legal note callout, bottom-left payment block, and bottom-right signature.

### Dropped / Adapted for Facturo
1. **Dropped Out-of-Scope Navigation**: Removed `Transactions`, `Wallet`, `Budgeting`, and `Reports`. Replaced with Facturo's exact domain navigation: `Tableau de bord`, `Créer un document`, `Documents`, `Clients`, `Projets / Missions`, `Paramètres AE`.
2. **Dropped `Dark Mode` Switch**: Facturo uses a single high-clarity light theme calibrated for financial legibility and print/PDF fidelity.
3. **Replaced `Standard | Split | Recurring` Tabs**: Replaced with the 5 Moroccan commercial document types: `Devis | Proforma | Facture | Facture d'acompte | Avoir`.
4. **Removed Per-Document Issuer `Full Name*` Field**: Facturo is a single-user app; issuer identity (`Nom`, `ICE 15 chiffres`, `N° Auto-Entrepreneur`, `IF`, `TP`, `Logo`, `Signature`) is configured once in **Paramètres** and injected automatically.
5. **Replaced Per-Line `Tax 10%` Input**: Moroccan Auto-Entrepreneurs operate under VAT franchise (`Art. 89-I-12° CGI`) or VAT-exempt service export (`Art. 92-I-1° CGI`). Line items instead carry `Unité` (`jour`, `heure`, `forfait`, `unité`) and `Remise %`, while VAT regime and mandatory legal wording are controlled in **Mentions et paiement**.
6. **Fixed Reference Flag Mismatch**: Corrected the reference screenshot's UK flag next to "US Dollar" using custom zero-emoji circular SVG flags (`MA`, `EU`, `FR`, `CH`, `US`).

---

## 2. Design Tokens

### 2.1 Color Palette & Contrast Ratios (WCAG 2.1 AA Verified)

| Token | Hex | Role | Contrast Check |
| :--- | :--- | :--- | :--- |
| `--ink` | `#14171F` | Primary text, headings, active icons | `16.8:1` on `#FFFFFF` (AAA) |
| `--electric-blue` | `#2457F5` | Primary CTA, active switch, focus border | `5.42:1` with `#FFFFFF` text (AA) |
| `--electric-blue-hover` | `#1B45C9` | Primary CTA hover, link emphasis | `7.65:1` with `#FFFFFF` text (AAA) |
| `--deep-green` | `#0F3D3A` | Brand seal, AE ceiling card, MAD settlement accent | `11.9:1` with `#FFFFFF` (AAA) |
| `--mint` | `#BFF0D4` | Highlight accent on `#0F3D3A` surfaces | `10.2:1` on `#0F3D3A` (AAA) |
| `--app-bg` | `#F3F4F6` | Preview stage, interior app background, tab track | Surface token |
| `--outer-frame` | `#E4E6EA` | Desktop outer canvas frame | Viewport token |
| `--card-border` | `#E3E6EC` | `1px` card, table, and input border | Hairline stroke |
| `--text-secondary` | `#525866` | Secondary labels, metadata | `7.1:1` on `#FFFFFF` (AAA) |
| `--text-muted` | `#667085` | Subtitles, placeholders, table headers | `4.85:1` on `#FFFFFF` (AA) |

### 2.2 Semantic Status Badges (Always paired with an outline icon)

| Status | Background | Foreground | Contrast | Outline Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Paid (`Payée`)** | `#DDF5E6` | `#0B6B3A` | `5.6:1` (AA) | `CheckCircle2` |
| **Sent (`Envoyée`)** | `#E4EBFF` | `#1B45C9` | `6.4:1` (AA) | `Send` |
| **Pending (`En attente`)** | `#FFF0D6` | `#8A4B00` | `5.9:1` (AA) | `Clock` |
| **Overdue (`En retard`)** | `#FDE3E3` | `#A31D1D` | `6.8:1` (AA) | `AlertTriangle` |
| **Draft (`Brouillon`)** | `#E8EAEE` | `#3F4654` | `7.4:1` (AAA) | `FileEdit` |

### 2.3 Typography Scale
- **Latin Font**: `Inter` (`400`, `500`, `600`, `700`).
- **Arabic RTL Font**: `IBM Plex Sans Arabic` (`400`, `500`, `600`, `700`) with `1.55` line-height for clean diacritic/ascender clearance.
- **Numeric Discipline**: `font-variant-numeric: tabular-nums` enforced on all prices, totals, exchange rates, dates, `ICE`, `RIB`, `IBAN`, and sequential numbers (`FAC-2026-0018`).
- **Scale**:
  - `Display / KPI`: `22px–24px` Bold (`700`), tracking `-0.02em`
  - `Page Title`: `20px–22px` Bold (`700`), tracking `-0.02em`
  - `Card / Modal Title`: `15px–17px` Bold (`700`)
  - `Section Title`: `14px` SemiBold (`600`)
  - `Body / Input Value`: `13px` Regular/Medium (`400`/`500`)
  - `Badge / Table Header`: `11px–12px` Medium/SemiBold (`500`/`600`)
  - `Notched Field Label`: `11px` Medium (`500`)
  - `A4 Paper Body`: `10px–11.5px` scaled proportionally to A4 aspect ratio (`1 : 1.414`).

### 2.4 Spacing, Radii, Shadows & Icons
- **Spacing Scale**: `4px` base unit (`4, 8, 12, 16, 20, 24, 32, 40px`).
- **Radii**:
  - Application Window: `22px`
  - Cards & Modals: `18px–20px` (`1px solid #E3E6EC`, `#FFFFFF`)
  - Inputs, Selects & Buttons: `12px`
  - Segmented Tab Pills: `9px` inside `12px` container
  - Status Badges: `9999px` (pill)
- **Shadows** (Floating elements only; flat `1px #E3E6EC` borders everywhere else):
  - A4 Paper Sheet: `0 20px 48px rgba(20, 23, 31, 0.07)`
  - Modal Dialog: `0 24px 60px rgba(20, 23, 31, 0.18)`
  - Primary CTA Subtle Lift: `0 6px 18px rgba(36, 87, 245, 0.24)`
- **Iconography**: `Lucide` outline icon set (`16px`–`20px`, `1.75px` stroke width, rounded caps/joins). **Zero emoji** across the entire product; flags are circular vector SVGs.

---

## 3. Component States Specification

| Component | Normal | Hover | Focus (`:focus-visible`) | Disabled / Locked | Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Button** | Bg `#2457F5`, text `#FFF`, `12px` radius | Bg `#1B45C9` | `2px solid #2457F5` offset `2px` | `40%` opacity, `cursor-not-allowed` | Bg `#A31D1D` (destructive confirm) |
| **Secondary Button** | Bg `#FFF`, `1px #E3E6EC`, text `#14171F` | Bg `#F8F9FB`, border `#C5CBD6` | `2px solid #2457F5` offset `2px` | Bg `#F3F4F6`, text `#98A2B3` | Border `#A31D1D`, text `#A31D1D` |
| **Notched Input / Date / Money** | Bg `#FFF`, `1px #E3E6EC`, notched label `#525866` | Border `#C5CBD6` | Border `#2457F5` + `2px` `#2457F5/12%` ring, label `#2457F5` | Bg `#F3F4F6/80%`, lock icon, text `#525866` | Border `#A31D1D`, bg `#FDE3E3/20%`, label `#A31D1D` + `AlertCircle` message below |
| **Select with Flag** | Circular `20px` SVG flag + label + chevron | Border `#C5CBD6` | Border `#2457F5` + focus ring | Bg `#F3F4F6`, muted flag | Border `#A31D1D` + inline error text |

---

## 4. Layout & Interaction Rules per Screen

### Screen 1 — Create Document (`1440px`)
- **Columns**: Left Sidebar `228px` | Form `540px` (`#FFFFFF`) | Live Preview `672px` (`#F3F4F6` stage). When `Aperçu A4` toggle is off, the Form centers cleanly up to `840px`.
- **Sequential Numbering Lock Behavior**:
  - Drafts (`Enregistrer le brouillon`) store `number = null` and render `"Attribué à l'émission"` with a lock badge showing the next preview counter (e.g., `FAC-2026-0019`) without consuming a number.
  - Clicking `"Émettre et envoyer"` validates all required fields, opens the **Confirm & Lock Modal** (*"Émettre verrouille le document et attribue le numéro"*), atomically increments the sequence counter, assigns `FAC-2026-0019`, and sets `isLocked = true`. Locked documents cannot be edited or deleted; corrections require generating an **Avoir**.
- **Live Preview Synchronization**: Every change to document type, language (`FR/EN/AR`), client, currency, exchange rate, line items, discounts, deposit percentage, VAT regime, bank account, or signature updates the A4 sheet (and Email preview) instantaneously with zero page reload.
- **Multi-Currency & Indicative MAD Logic**: Selecting `EUR`, `CHF`, or `USD` auto-selects the matching `IBAN + SWIFT` bank account, switches default VAT mention to Export (`Art. 92-I-1° CGI`), and displays a subtle **Équivalent indicatif en MAD** row beneath the foreign-currency Grand Total.

### Screen 2 — Documents List
- **Layout**: Filter card on top (type pills + search + 4 dropdowns: Statut, Client, Devise, Période) above a full-width `20px` radius table card.
- **Row Actions**: Contextual per document state — `Voir`, `Dupliquer`, `Facturer` (on `Devis`/`Proforma`), `Créer un avoir` (on locked `Facture`), `PDF`, and `Enregistrer un paiement` (on unpaid locked `Facture`/`Acompte`).

### Screen 3 — Document Detail & MAD Payment Modal
- **Layout**: Locked read-only header banner + `7/5` split grid: A4 paper on left, vertical 4-step **Timeline** (`Créé`, `Envoyé`, `Vu`, `Payé`) and **MAD Payments List** on right.
- **MAD-Received Accounting Logic**: In `"Enregistrer un paiement"`, the user records both `Montant payé (devise)` (e.g., `4 895,00 EUR`) and **`Montant net reçu en MAD`** (e.g., `52 680,00 MAD` credited on Moroccan bank statement) plus `Frais bancaires / change (MAD)`. Only `amountReceivedMad` feeds the Dashboard turnover KPIs and the `200 000 MAD` / `500 000 MAD` Auto-Entrepreneur ceiling.

### Screen 4 — Dashboard « Bonjour [Prénom] » (approved layout)
- **Shell**: white full-height sidebar (`236px`) — `Tableau de bord`, `Devis`, `Factures`, `Clients`, `Projets`, `Paiements`, `Déclarations`; footer holds `Aide et support`, `Paramètres`, the `Mode sombre` switch and the single-user profile card. The main pane is white (no outer gray frame) so the dashboard reads like a working surface, not a mockup stage.
- **Header**: date line, greeting `Bonjour [Prénom], voici ce qui compte aujourd'hui`, `Données d'exemple` chip (amber), secondary `Nouveau devis` and primary `Nouvelle facture`.
- **Ceiling hero (`8/12`)**: Deep Green `#0F3D3A` card with the year's net collected MAD in `38–42px`, a zone pill on the right (`% · Sûr / Vigilance / Limite`), a **three-zone gauge** (`0–60 %` mint, `60–85 %` amber, `85 %+` red) with the actual value filled in white, the zone legend, `Reste X MAD avant le plafond`, and a tinted projection strip: `Au rythme actuel (≈ X MAD/mois), le plafond serait atteint vers [mois année]. Les factures à encaisser ci-dessous ne comptent qu'une fois payées.`
- **Cashflow cards (`4/12`)**: `À encaisser` (with `dont N en retard` in overdue red) and `À facturer` (accepted quotes + completed-but-unbilled project tasks).
- **Votre cycle de facturation**: four steps `Devis envoyés › Acceptés › Factures émises › Payées ce mois`, the last one on a mint `#E7F7EE` card, each with a count and a MAD amount.
- **À faire maintenant**: max 5 rows, each with a colored dot, bold document/client title, secondary context line and a single action button — `Relancer` (overdue / expiring), `Convertir en facture` (accepted quote, primary blue), `Créer la facture` (unbilled mission tasks), `Enregistrer` (settlement waiting for the MAD amount). The row counter badge is red.
- **Déclaration du chiffre d'affaires**: current quarter collected MAD, `Contribution estimée : [taux à configurer]`, `Échéance : [date à configurer]` and `Préparer ma déclaration`.
- **Prochaines échéances**: date tiles (`JJ` + `MMM`) with payment due dates and quote validity ends.
- **Encaissements par mois (`8/12`)**: six-month MAD chart; all months use `#DCE3FF` except the current month in Electric Blue `#2457F5`.
- **Origine des encaissements (`4/12`)**: share of net MAD received per currency (`USD` `#2457F5`, `MAD` `#0F3D3A`, `CHF` `#BFF0D4`, `EUR` `#8A4B00`) with a reminder that only MAD-received amounts count toward the ceiling.
- **Dashboard rules**: every figure derives from net MAD received or from locked documents; the projection is `remaining ÷ average monthly run-rate`; an accepted quote or a completed unbilled task appears in `À faire maintenant` until it is converted or invoiced.

### Screen 5 — Clients
- **Layout**: `5/7` master-detail split: searchable client cards on left + rich Client Profile on right (flag, client type, `ICE` / `TVA Intracom.` / `UID` / `EIN`, preferred PDF language, default currency, billing notes, document history, and `"Créer un devis"` shortcut).

### Screen 6 — Projects / Missions
- **Layout**: `5/7` split: mission cards with task completion counters on left + Mission Detail on right with interactive tasks (`Qté × P.U.`), trilingual Services Catalog drawer, and one-click `"Créer un devis"` pre-populating Screen 1.

### Screen 7 — Settings
- **Layout**: `6/6` two-column grid covering Legal Identity (`ICE`, `N° AE`, `IF`, `TP`, emblem/signature), Annual Ceiling (`200 000 MAD Services` vs `500 000 MAD Commercial`), Bank Accounts per Currency (`RIB` vs `IBAN + SWIFT`), Locked Numbering Sequences, and Trilingual Legal Mentions.

### Screen 8 — Login/Register, Empty States & Validation Error
- Single-user login/onboarding card, dedicated empty states for `Aucun client` and `Aucun document` with clear primary CTAs, and inline + summary validation error patterns.

### Screen 9 — Mobile `390px`
- **Mobile Dashboard (`390px`)**: Stacked ceiling hero card, 2x1 compact KPIs, card-based recent documents, and 4-item bottom tab bar.
- **Mobile Create Document (`390px`)**: Replaces side-by-side split with sticky top segmented tabs (`Formulaire | Aperçu A4`) and a sticky bottom 2-button bar (`Brouillon` | `Émettre`).

---

## 5. Arabic (RTL) & Accessibility Rules

1. **RTL Mirroring (`dir="rtl"`)**:
   - Sidebar, breadcrumbs (with rotated chevrons), notched field labels (`right-3`), table columns (Designation on right, Amount on left), and totals blocks mirror completely.
   - Uses Western Arabic numerals (`0123456789` — standard business convention in Morocco) with `tabular-nums` and `ltr` isolation on `IBAN`, `ICE`, and email addresses.

2. **Dark mode & print fidelity**:
   - `Mode sombre` applies the `facturo-dark` scope: canvas `#0B0F14`, cards `#121821`, raised surfaces `#161E28`, borders `#25303E`, text `#E9EDF5` / `#A9B4C5`, and `COLOR-SCHEME: dark` on native controls.
   - Brand colors are preserved in dark mode: Electric Blue stays the primary action, Deep Green + Mint stay reserved for the ceiling hero and MAD settlement accents.
   - Every A4 document sheet carries the `paper-light` class so PDFs and previews always render on white with `#14171F` ink, regardless of the active theme (dark mode must never alter the printed invoice).
2. **Accessibility (WCAG 2.1 AA)**:
   - Every color combination meets `>= 4.5:1` contrast for normal text and `>= 3:1` for UI borders/controls.
   - Keyboard navigation displays a crisp `2px solid #2457F5` focus ring with `2px` offset.
   - Every input has a programmatic label; validation errors pair `role="alert"` summary banners with field-level `aria-invalid="true"`, `AlertCircle` icons, and descriptive remediation text — never color alone.
