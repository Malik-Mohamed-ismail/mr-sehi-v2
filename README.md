# مطعم مستر صحي — Restaurant Management System

## Quick Start

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 16
- npm 10+

---

### 1. Database Setup
```sql
-- In psql or pgAdmin:
CREATE DATABASE mr_sehi_test;
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy env file (already configured for local dev)
# Your .env already has: DATABASE_URL, JWT_SECRET, COOKIE_SECRET

# Run database migrations
npm run db:migrate

# Seed initial data (accounts + suppliers + admin user)
npm run db:seed

# Start development server
npm run dev
# → API running at http://localhost:3001
# → Health check: http://localhost:3001/health
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → App running at http://localhost:5173
```

### 4. Login
- **URL**: http://localhost:5173/login
- **Email**: admin@mrsehi.sa
- **Password**: Admin@123456

---

## Architecture

### Backend Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express.js 4 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Auth | JWT + HttpOnly cookie refresh |
| Validation | Zod |
| Logging | Pino |
| Cron | node-cron |

### Frontend Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + CSS Variables |
| Data | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand |

---

## API Base URL
```
http://localhost:3001/api/v1
```

## Key Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login |
| GET | /reports/dashboard | Dashboard KPIs |
| POST | /purchases | Create purchase invoice + auto journal |
| GET | /revenue/daily-series | Daily revenue chart data |
| POST | /subscribers/:id/renew | Renew subscription |
| POST | /journal/:id/reverse | Reverse journal entry |
| GET | /trial-balance | Trial balance |
| GET | /reports/income-statement | P&L statement |

## Roles
| Role | Arabic | Access |
|------|--------|--------|
| admin | مدير | Full access |
| accountant | محاسب | All except delete + user mgmt |
| cashier | كاشير | Revenue entry + subscribers only |

## Business Rules
- **VAT**: 15% ZATCA on suppliers with VAT number, exempt otherwise
- **Journal**: Double-entry, debit must equal credit (±0.001 SAR tolerance)
- **Delete**: Soft-delete only on financial records (ZATCA 5-year retention)
- **Entry Numbers**: Sequential P/R/E/M/REV-YEAR-NNNN format
- **Amounts**: decimal(12,4) stored, displayed with 2 decimal places + ر.س
- **Digits**: English digits always (en-US locale) — never Arabic-Indic
