# Facturo — Reference Discrepancies, Assumptions & Open Questions

## 1. Mismatches Found in Reference (`create-invoice-reference.png`)

1. **Out-of-Scope FinTech / Banking Modules (`Wallet`, `Transactions`, `Budgeting`, `Reports`)**:
   - The `creatinf` reference includes personal/corporate banking modules in the left sidebar. None of these exist in Facturo's single-user invoicing scope; they were replaced with `Tableau de bord`, `Créer un document`, `Documents`, `Clients`, `Projets / Missions`, and `Paramètres AE`.
2. **Dark Mode Toggle in Sidebar**:
   - The reference includes a `Dark Mode` toggle above the user card. Per Facturo's approved light-surface branding (`#F3F4F6` / `#E4E6EA` / `#FFFFFF`), Dark Mode was omitted.
3. **Billing Mode Tabs (`Standard | Split | Recurring`)**:
   - The reference splits invoice creation by billing schedule (`Standard`, `Split`, `Recurring`). Facturo requires the 5 Moroccan commercial document types (`Devis | Proforma | Facture | Facture d'acompte | Avoir`), which now occupy this segmented tab bar.
4. **Editable Issuer `Full Name*` Inside Document Form**:
   - The reference treats the issuer's full name as a per-invoice text input. Because Facturo is a single-user Moroccan Auto-Entrepreneur app, legal identity (`Nom & Prénom`, `ICE 15 chiffres`, `N° Auto-Entrepreneur`, `IF`, `TP`) is stored in `Paramètres` and rendered read-only in the A4 preview, freeing the top-left slot for `Client*` and `Projet / Mission (optionnel)`.
5. **Per-Line `Tax 10%` Input vs. Moroccan Auto-Entrepreneur VAT Franchise**:
   - Under Moroccan law (`Article 89-I-12° du CGI`), Auto-Entrepreneurs are outside the scope / exempt from VAT (`TVA non applicable`). Per-line `Tax %` was replaced with `Unité` (`jour`, `heure`, `forfait`, `unité`) and `Remise %`, while VAT regime (`Franchise AE Maroc` vs. `Export de services Art. 92-I-1° CGI`) is selected once in `Mentions et paiement`.
6. **Flag Icon Bug in Reference Screenshot**:
   - The reference displays a UK Union Jack flag next to `US Dollar`. Facturo uses accurate, zero-emoji vector SVG circular flags (`MA` for MAD/Morocco, `EU` for EUR, `CH` for CHF, `US` for USD).
7. **Workspace Reference Folders**:
   - Only `create-invoice-reference.png` was attached in the prompt context; `docs/reference/quotes` and `docs/reference/invoices` were not present on disk in the sandbox, so Moroccan Auto-Entrepreneur mandatory mentions (`ICE`, `N° AE`, `IF`, `TP`, `Art. 89-I-12° CGI`, `RIB 24 chiffres`) were structured according to standard Moroccan DGI/CNSS invoicing practice.

---

## 1bis. Revised Dashboard Reference (approved direction)

The new dashboard reference changes three earlier decisions, which are now reflected in the product:

1. **`Mode sombre` is now in scope.** It was originally dropped because it was absent from the invoicing brief; it returns as a sidebar switch with a scoped dark theme. A4 previews stay white (`paper-light`) so PDFs are never affected.
2. **Navigation is document-type oriented.** `Devis` and `Factures` are now separate first-class entries, joined by `Paiements` and `Déclarations`. The consolidated `Documents` list still exists and opens pre-filtered from either entry.
3. **No outer gray frame on the dashboard.** The dashboard uses a white working surface (sidebar + content); the framed `1440px` stage remains on the mockups and the Create Document screen where the A4 preview needs contrast.

Still assumed / to confirm:
- `Contribution estimée : [taux à configurer]` and `Échéance : [date à configurer]` are intentionally configuration placeholders — the exact CRS/CNSS rate and filing calendar need your legal input before we compute a real amount.
- The greeting uses the first name of the business profile owner (`Youssef`), not a separate display name.
- `À facturer` sums accepted quotes **plus** completed-but-unbilled project tasks; tell us if only accepted quotes should count.

## 2. Explicit Product Assumptions Made

1. **Dual-Activity Ceiling Support (`200 000 MAD` vs. `500 000 MAD`)**:
   - Defaulted the sample account to **Prestations de services (`200 000 MAD/an`, `1%` IR libératoire)** while allowing a 1-click switch in `Paramètres` to **Activités commerciales, industrielles et artisanales (`500 000 MAD/an`, `0,5%` IR)**.
2. **Turnover Basis = Net MAD Credited (`Montant reçu en MAD`)**:
   - Assumed that foreign-currency invoices (`EUR`, `CHF`, `USD`) only impact the annual Auto-Entrepreneur ceiling when a payment is recorded, using the **net MAD credited on the Moroccan bank statement** (excluding foreign exchange/correspondent fees, or tracking bank fees separately for reconciliation).
3. **Separate Sequential Counters per Document Type**:
   - Assumed independent annual locked sequences (`DEV-2026-XXXX`, `PRO-2026-XXXX`, `FAC-2026-XXXX`, `ACO-2026-XXXX`, `AVO-2026-XXXX`) rather than a single shared sequence across quotes and invoices.
4. **Arabic RTL UI vs. Document-Only RTL**:
   - When the user selects `AR` for PDF language on a French interface, should only the right-hand A4 preview switch to `RTL`, or can the user also switch the entire Facturo workspace to `RTL`? Both are supported in our design (automatic `RTL` on the A4 sheet whenever `AR` is chosen, plus an explicit `RTL` workspace toggle).

---

## 3. Open Questions to Confirm with Product Owner

1. **Bank Fees & CNSS Turnover Declaration**: When a foreign client pays `1 000 EUR` and the Moroccan bank credits `10 620 MAD` after deducting `180 MAD` in SWIFT/exchange fees, do you declare the gross converted amount (`10 800 MAD`) or the net credited amount (`10 620 MAD`) for your quarterly CNSS/DGI declaration? (Both fields are captured in the Payment Modal so either rule can be applied.)
2. **Partial Payments on a Single Invoice**: Should an invoice with a partial MAD payment display a 6th badge (`Partiellement payée`) or remain `En attente` (`#FFF0D6 / #8A4B00`) with a progress sub-label until 100% settled?
3. **Cash Payment Stamp Duty (`Droit de timbre 0,25%`)**: Do you accept cash payments (`Espèces`), and if so, should Facturo automatically add the Moroccan `0,25%` stamp duty (`Droit de timbre`) line/mention on cash-settled invoices?
4. **Deposit Invoice (`Facture d'acompte`) Final Settlement**: When converting a `Devis` that already has a paid `Facture d'acompte` into the final `Facture de solde`, should the deposit invoice be deducted as a negative line item on the final invoice (`Déduction acompte ACO-2026-0004`)?
