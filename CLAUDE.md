# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**مطعم مستر صحي** — an accounting and financial management system for a Saudi restaurant. The focus is on double-entry bookkeeping, VAT compliance (ZATCA 15%), purchase invoices, revenue tracking across three channels (restaurant, delivery platforms, subscriptions), payroll-adjacent reporting, and financial statements. This is **not** a POS or kitchen system; it is a back-office finance tool.

---

## Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start dev server with hot reload (tsx watch) → http://localhost:3001
npm run build        # tsc compile to dist/
npm run typecheck    # Type-check without emitting
npm run test         # Run all tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage

# Database
npm run db:migrate   # Apply pending Drizzle migrations
npm run db:generate  # Generate new migration from schema changes
npm run db:seed      # Seed accounts + suppliers + admin user
npm run db:studio    # Open Drizzle Studio (browser UI for DB)
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Start Vite dev server → http://localhost:5173
npm run build        # tsc + vite build
npm run typecheck    # Type-check without emitting
```

### Docker (full stack)
```bash
docker compose up --build   # Run postgres + backend + nginx/frontend
```

### First-time local setup
```sql
-- In psql:
CREATE DATABASE mr_sehi_test;
```
```bash
cd backend && cp .env.example .env  # already configured for local dev
npm run db:migrate && npm run db:seed
```
Default login: `admin@mrsehi.sa` / `Admin@123456`

---

## Architecture

### Monorepo layout
```
mr-sehi-v2/
├── backend/   Node.js 20 + TypeScript + Express.js 4
└── frontend/  React 18 + TypeScript + Vite
```
No shared packages between them — they communicate only via the REST API.

### Backend layer order
```
HTTP Request
  → Express middleware (helmet, cors, cookie-parser, rate-limiter)
  → Route handler (modules/{module}/{module}.routes.ts)
  → Controller  (modules/{module}/{module}.controller.ts)  — thin HTTP adapter
  → Service     (modules/{module}/{module}.service.ts)     — business logic + DB tx
  → Drizzle ORM (db/schema/*.ts)
  → PostgreSQL 16
```

Every non-trivial write uses `db.transaction(async (tx) => { ... })` so that the business record and its journal entry are always committed atomically.

### Module structure
Each feature lives in `backend/src/modules/{name}/` with files:
- `.routes.ts` — Express router, attaches middleware and calls controller
- `.controller.ts` — Parse req, call service, format response
- `.service.ts` — All business logic and DB queries
- `.schema.ts` — Zod DTOs for request validation
- `.accounting.ts` — (purchases only) journal entry creation logic

### Database schema
All table definitions live in `backend/src/db/schema/*.ts`. Each file exports Drizzle table objects and inferred TS types. The `index.ts` re-exports everything. Migrations are generated into `src/db/migrations/` via `drizzle-kit`.

Key tables and their roles:
| Table | Purpose |
|-------|---------|
| `accounts` | Chart of accounts (code-keyed, hierarchical via `parent_code`) |
| `journal_entries` + `journal_entry_lines` | Double-entry ledger |
| `purchase_invoices` | Supplier invoices, auto-creates journal entry on save |
| `restaurant_revenue` / `delivery_revenue` / `subscription_revenue` | Three separate revenue streams, each auto-creates a journal entry |
| `expenses` | Operating expenses |
| `fixed_assets` | Asset register |
| `petty_cash` | Daily petty-cash reconciliation |
| `production` | Production cost records |
| `subscribers` | Subscription plan members |
| `suppliers` | Supplier master (VAT number drives VAT calculation) |
| `audit_log` | Immutable record of every CREATE/UPDATE/DELETE |

### Frontend structure
```
frontend/src/
├── features/      # Page components, one folder per domain
├── components/
│   ├── layout/    # AppShell, Sidebar, Topbar, BottomNav, RoleRoute
│   └── ui/        # Shared reusable components (KPICard, DatePicker, etc.)
├── store/         # Zustand stores (authStore.ts)
├── hooks/         # Custom React hooks
├── lib/
│   ├── api.ts     # Axios instance with auth + CSRF interceptors
│   └── utils.ts   # Formatters, helpers
└── locales/       # ar.ts / en.ts translation strings
```

All routes are lazy-loaded. Route guards live in `App.tsx` — `ProtectedRoute` checks `isAuthenticated`, `RoleRoute` checks role.

---

## Auth & Security

- **Access token**: JWT signed with `JWT_SECRET`, 15-min expiry, sent as `Authorization: Bearer` header.
- **Refresh token**: stored in an `HttpOnly` cookie, 30-day expiry. `POST /api/v1/auth/refresh` issues a new access token silently.
- **CSRF**: double-submit cookie pattern. The server sets a `csrf-token` cookie on login; the frontend reads it and sends it as `X-CSRFToken` on mutating requests. See `frontend/src/lib/api.ts`.
- **RBAC**: three roles — `admin`, `accountant`, `cashier`. Role constants `ADMIN_ONLY`, `ACCOUNTANT_PLUS`, `ALL_ROLES` are in `backend/src/middleware/authorize.ts`. Routes use `authenticate` then `authorize(...roles)` middleware.
- `accessToken` is intentionally **not persisted** in localStorage (only `user` and `isAuthenticated` are). On page reload, `useAppBootstrap` calls `/auth/refresh` to silently re-issue the token.

---

## Business Rules (critical)

**Double-entry accounting**: Every financial write (purchase, revenue, expense, etc.) automatically creates a balanced `journal_entry` + `journal_entry_lines` in the same DB transaction. Entries are balanced when `|Σdebit − Σcredit| ≤ 0.001 SAR`. The `validateJournalBalance()` helper in `utils/accounting.ts` enforces this.

**VAT (15% ZATCA)**: VAT is applied only if the supplier has a non-empty, non-`"0"` `vat_number`. Logic lives in `utils/vat.ts`. The frontend must compute and submit `vat_amount`; the backend re-computes it server-side and rejects the request if they differ by more than `0.01 SAR`.

**Soft-delete only**: Financial records (`purchase_invoices`, revenue tables, journal entries) are never hard-deleted. Set `is_deleted = true`. Deleting a purchase also creates a `REV-YYYY-NNNN` reversal journal entry that swaps debit ↔ credit on every line.

**Entry numbers**: Sequential, generated inside a transaction to avoid races. Format: `{PREFIX}-{YEAR}-{NNNN}`. Prefixes: `P` = purchase, `R` = revenue, `E` = expense, `M` = manual journal, `REV` = reversal, `FA` = fixed asset. Generator: `utils/entryNumberGenerator.ts`.

**Monetary precision**: All amounts stored as `decimal(12,4)`. Displayed with 2 decimal places. Always use `en-US` locale (English digits) — never Arabic-Indic numerals. Currency symbol: `ر.س`.

**Payment methods** (Arabic string values in DB): `'كاش'` | `'بنك'` | `'آجل'`. Map to account codes `1101` / `1104` / `2101` respectively.

**Chart of accounts** is code-based (not UUID FK). `journal_entry_lines.account_code` references `accounts.code` by value, not by FK. System accounts (`is_system = true`) cannot be deleted.

---

## API Conventions

Base URL: `http://localhost:3001/api/v1`

Success response:
```json
{ "success": true, "data": { ... } }
```
Paginated response:
```json
{ "success": true, "data": [...], "total": 150, "page": 1, "limit": 25, "totalPages": 6 }
```
Error response:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

`AppError` in `utils/AppError.ts` is the standard way to throw HTTP errors from services. The global `errorHandler` middleware in `middleware/errorHandler.ts` handles it.

Validation uses Zod schemas defined in `{module}.schema.ts`. The `validate(schema)` middleware in `middleware/validate.ts` parses `req.body` and attaches the typed result.

---

## Frontend Data Fetching

TanStack Query v5 is used for all server state. The `api` axios instance in `lib/api.ts` automatically attaches the Bearer token and handles 401 → silent token refresh. Mutations that fail display the Arabic error message via `sonner` toast (wired globally in `App.tsx`).

Default `staleTime` is 2 minutes with `refetchOnWindowFocus: false` to avoid excessive re-fetches in a multi-tab accounting environment.

---

## i18n / RTL

The UI is Arabic-first. Translation keys live in `locales/ar.ts` and `locales/en.ts`. The language toggle switches `document.documentElement.dir` between `rtl` and `ltr`. Never hardcode Arabic or English UI strings directly in JSX — always use the i18n key. CSS uses `dir`-aware utilities (Tailwind's `rtl:` variant or custom globals in `index.css`).
