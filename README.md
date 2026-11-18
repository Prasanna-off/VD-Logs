# VD Logs — Attendance • Tasks • Transparency

**Organization:** Vishvadaan Educational and Charitable Trust  
**Product:** VD Logs  
**Stack:** React 19 + Vite 8, Node.js + Express.js, Supabase PostgreSQL & Auth, ExcelJS, Tailwind CSS.

---

## Overview

VD Logs is the official internal operations, attendance tracking, and task delegation platform built for **Vishvadaan Educational and Charitable Trust**.

It provides two distinct, secure role-based portals:
1. **Admin Portal:** Operations cockpit, staff provisioning, dynamic departments, attendance ledger & correction adjudication, task delegation with interactive checklist builders, daily work report evaluation, real-time analytics, ExcelJS report exports, and system audit logs.
2. **Staff Portal:** Fast, mobile-responsive dashboard with one-click punch in/out with `Asia/Kolkata` time validation, personal attendance history, task checklist execution with progress syncing, and daily work log drafting and revision tracking.

---

## Strict Architectural Policies Enforced

- **No Mock Data Policy:** The database starts 100% empty. No fake staff, attendance, tasks, or metrics exist. All statistics and charts are dynamically derived from PostgreSQL records.
- **Attendance Timezone Integrity:** Timestamps are strictly server-generated. Exactly **one** check-in and **one** check-out session per staff member per local day in `Asia/Kolkata` is enforced by database unique constraints.
- **Staff ID Authentication:** Staff authenticate using their issued `Staff ID + Password`. Staff ID is resolved on the backend to avoid public self-registration.
- **Single Source of Truth:** Express backend orchestrating Supabase PostgreSQL & Auth. No MongoDB or Firebase.

---

## Getting Started

### 1. Database Setup in Supabase
Run the versioned SQL migrations in your Supabase SQL Editor:
- `server/supabase/migrations/001_initial_schema.sql`
- `server/supabase/migrations/002_functions_and_triggers.sql`
- `server/supabase/migrations/003_rls_policies.sql`

### 2. Configure Backend Credentials
Copy `server/.env.example` to `server/.env` and paste your Supabase keys:
```env
PORT=5000
SUPABASE_URL=https://klzlkgjnbnjgazutrjcj.supabase.co
SUPABASE_ANON_KEY=sb_publishable_Gs6rfzLl2a2l03s8VDbSnQ_qEbyBrg1
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Provision the Initial Administrator
```bash
cd server
node scripts/provision-admin.js admin@vishvadaantrust.org "AdminPassword123!" "System Administrator"
```

### 4. Run Development Servers
- **Backend:**
  ```bash
  cd server
  npm install
  npm run dev # or npm start
  ```
- **Frontend:**
  ```bash
  cd client
  npm install
  npm run dev
  ```
- Open [http://localhost:5173](http://localhost:5173).

---

## Documentation Pack Reference
- [`docs/01_PRD.md`](file:///e:/VD_Logs/docs/01_PRD.md) — Product Requirements & Acceptance Criteria
- [`docs/02_TRD.md`](file:///e:/VD_Logs/docs/02_TRD.md) — Technical Architecture & API Specifications
- [`docs/UI_IMPLEMENTATION_MAPPING.md`](file:///e:/VD_Logs/docs/UI_IMPLEMENTATION_MAPPING.md) — Google Stitch UI Screen & Route Mappings
- [`docs/API_DOCUMENTATION.md`](file:///e:/VD_Logs/docs/API_DOCUMENTATION.md) — Detailed REST API Endpoints & Payloads
- [`docs/SECURITY_NOTES.md`](file:///e:/VD_Logs/docs/SECURITY_NOTES.md) — Security Hardening, RLS & Auth Isolation
- [`docs/DATABASE_MIGRATIONS.md`](file:///e:/VD_Logs/docs/DATABASE_MIGRATIONS.md) — Database Setup & Stored Procedures Guide
- [`docs/DEPLOYMENT_GUIDE.md`](file:///e:/VD_Logs/docs/DEPLOYMENT_GUIDE.md) — Production Deployment & Uptime Instructions
- [`docs/IMPLEMENTATION_STATUS.md`](file:///e:/VD_Logs/docs/IMPLEMENTATION_STATUS.md) — Phased Delivery Tracking
