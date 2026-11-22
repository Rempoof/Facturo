# Facturo — Laravel + Vue 3 + Inertia

Rebuild of the approved Facturo design (Moroccan Auto-Entrepreneur invoicing) on the
Laravel ecosystem: **Laravel 12 · Vue 3 + Inertia 2 · TypeScript · Tailwind 4 · shadcn-vue-style primitives · PostgreSQL · Fortify · Cashier · Redis + Horizon**.

> The Next.js app at the repository root stays as the clickable, always-on design
> reference. This folder is the production implementation of the same screens.

## Local setup

```bash
cd laravel
composer install
cp .env.example .env && php artisan key:generate
createdb facturo            # PostgreSQL
php artisan migrate --seed  # schema + demo data ("Données d'exemple")
npm install && npm run dev  # Vite
php artisan serve           # http://127.0.0.1:8000
php artisan horizon         # queues (PDF, e-mails, relances)
```

Demo login: `youssef.sample@atelier-exemple.ma` / `Password!2026`
(e-mail verification is required; use `php artisan tinker` to verify or Mailpit in local).

## Development checklist → where it lives

| # | Step | Implementation |
|---|------|----------------|
| 1 | **Project setup** — Laravel, Vue, Inertia, TypeScript, Tailwind, shadcn-vue | `composer.json`, `package.json`, `vite.config.ts`, `tsconfig.json`, `resources/css/app.css`, `resources/js/app.ts` |
| 2 | **Authentication** — register, login, email verification, password reset, 2FA | Laravel Fortify (`App\Providers\FortifyServiceProvider`, `TwoFactorAuthenticatable`), Inertia pages `Auth/Login|Register` |
| 3 | **SaaS foundation** — organizations, tenants, invitations, users | `organizations`, `organization_user`, `organization_invitations`, `EnsureOrganizationContext`, `OrganizationController` |
| 4 | **Authorization** — roles, permissions, policies | `DocumentPolicy`, `Gate::define('manage-billing')`, spatie/laravel-permission, role on the membership pivot |
| 5 | **Subscription engine** — plans, trials, usage limits, lifecycle | Cashier on `User` (`Billable`), `config/plans.php` (essai 14 j, AE 99 MAD, Cabinet 299 MAD), `EnforcePlanLimits` |
| 6 | **Core application** — dashboard, settings, notifications, business modules | `DashboardController` + `CeilingTracker`, documents, clients, projects, payments, declarations, settings, `OrganizationInvited` notification |
| 7 | **Background processing** — queues, schedules, e-mails, Reverb | Horizon queues (`pdf`, default), `RenderDocumentPdf`, `SendDocumentEmail`, `SendPaymentReminder`, nightly overdue flagging, `facturo:ceiling-alert`, Reverb broadcasting |
| 8 | **Monitoring & testing** | Pest feature tests (numbering lock, MAD received, ceiling zones), Vitest ready, Playwright e2e (`tests/e2e`), Horizon dashboards, GlitchTip + Uptime Kuma in `deploy/` |
| 9 | **Deployment** | `deploy/README.md` — Coolify/VPS/Forge, PostgreSQL backups, SSL, CI/CD pipeline |

## Domain rules encoded in services

- **`DocumentNumberingService`** — drafts never consume a number; issuing runs inside a
  transaction with `lockForUpdate()` on `numbering_sequences`, assigns `FAC-2026-0001`,
  sets `is_locked = true`; a locked document can never be edited or deleted (use an avoir).
- **`DocumentCalculator`** — single source of truth for subtotal, global discount, deposit
  percentage, avoir sign and indicative MAD conversion.
- **`PaymentRecorder`** — the MAD amount received is mandatory; only that value feeds the
  ceiling. Currency amount, bank fees and reference are stored for reconciliation.
- **`CeilingTracker`** — builds the entire dashboard payload: three-zone gauge
  (safe < 60 %, vigilance 60–85 %, limit ≥ 85 %), cashflow, billing cycle, action queue,
  quarter declaration, deadlines, 6-month collections and currency origin.
- **`PdfRenderer`** — mPDF A4 output in FR/EN/AR (RTL), exactly mirroring the on-screen
  `DocumentPaper.vue` and `resources/views/pdf/document.blade.php`.

## Multi-tenancy

Every route lives under `/{organization:slug}`. `EnsureOrganizationContext` resolves the
current organisation, aborts non-members, and every query is scoped by `organization_id`
(`Document::scopeForOrganization`). Policies re-check membership on each write.
