# Facturo — Laravel + Vue stack: parity with the approved design

Source: `laravel/` (Laravel 12 · Vue 3 · Inertia 2 · TypeScript · Tailwind 4 · PostgreSQL · Fortify · Cashier · Horizon).
The Next.js app at the repository root remains the live design reference; both share
**one design language**, documented in `docs/design/DESIGN_SPEC.md`.

## Screen parity

| Screen | Inertia page | Notes |
|---|---|---|
| Dashboard « Bonjour [Prénom] » | `Pages/Dashboard.vue` | Same hero gauge (`#0F3D3A` + `#BFF0D4`), cashflow cards, billing cycle, action queue, declaration, deadlines, monthly chart, currency origin |
| Documents list | `Pages/Documents/Index.vue` | Type/status/client/currency/period filters, badges, row actions (voir, dupliquer, convertir, avoir, PDF, paiement) |
| Create document | `Pages/Documents/Create.vue` | Split form + live A4 preview, `Email | PDF` switch, 5 type tabs, catalogue import, global discount, deposit, **lock modal** with the next number |
| Document detail | `Pages/Documents/Show.vue` | Read-only paper, timeline, MAD payments list, **Enregistrer un paiement** modal |
| Clients | `Pages/Clients/Index.vue` | Master-detail, ICE/tax ID, language, currency, document history, empty state |
| Projects | `Pages/Projects/Index.vue` | Tasks checklist, one-click « Créer un devis » with task import |
| Payments | `Pages/Payments/Index.vue` | Net MAD received totals, bank fees, currency filter |
| Declarations | `Pages/Declarations/Index.vue` | Quarter totals, contribution/deadline placeholders |
| Settings | `Pages/Settings/Index.vue` | Legal identity, ceiling (200k/500k), locked sequences, RIB/IBAN per currency, trilingual legal mentions, plan usage |
| Auth | `Pages/Auth/Login.vue`, `Register.vue` | Fortify, 2FA-ready, invitation-aware registration |

## Shared visual contract
- Tokens: Ink `#14171F`, Electric Blue `#2457F5` (hover `#1B45C9`), Deep Green `#0F3D3A`,
  Mint `#BFF0D4`, App `#F3F4F6`, Frame `#E4E6EA`, hairline `#E3E6EC`.
- Cards `18–20px` radius + `1px #E3E6EC`; controls `12px`; soft shadows only on floating layers.
- Status badges: paid/accepted `#DDF5E6/#0B6B3A`, sent `#E4EBFF/#1B45C9`,
  pending `#FFF0D6/#8A4B00`, overdue `#FDE3E3/#A31D1D`, draft `#E8EAEE/#3F4654`.
- Fonts: Inter (Latin) + IBM Plex Sans Arabic (AR/RTL). One outline icon set (`lucide-vue-next`), no emoji.
- Dark mode: `.dark` scope in `resources/css/app.css`; A4 sheets carry `.paper-light` so PDFs never tint.

## Behavioural parity
1. **Issue/lock** — `DocumentNumberingService::issue()` transaction + `lockForUpdate`; drafts show
   « Attribué à l'émission »; locked documents are edit/delete blocked by `DocumentPolicy`.
2. **Live preview** — the Vue `DocumentPaper` recomputes from reactive form state (totals, discount,
   deposit, currency, language) with no round-trip; the same Blades template feeds mPDF.
3. **MAD received** — `PaymentRecorder` requires `amount_received_mad > 0`; `CeilingTracker`
   aggregates only that column, so EUR/CHF/USD invoices affect the ceiling only once settled.
4. **RTL** — document language `AR` switches direction, alignment, numerals isolation and font
   server-side (mPDF `directionality`) and client-side (`dir="rtl"` + `.font-arabic`).
5. **Accessibility** — 4.5:1 text contrast, `:focus-visible` ring, labelled fields,
   `role="alert"` summaries plus field-level messages (never colour alone).

## Deliberate deviations
- Cashier/Stripe drives subscriptions (the prototype had no billing); plan limits are enforced
  server-side, and the dashboard remains single-organisation in focus.
- `Contribution estimée` / `Échéance` stay `[taux à configurer]` / `[date à configurer]` until the
  legal values are confirmed (see `docs/design/OPEN_QUESTIONS.md`).
