# Warehouse Management System (WMS)

## Project Overview
A specialized Warehouse Management System for manufacturing inventory lifecycle management — from raw materials to finished goods. Enforces FIFO/FEFO, expiration date tracking, location tracking, and secure audit trails.

## Tech Stack
- **Frontend:** React 19 + Vite 8 + TypeScript 6 + TailwindCSS 4 + TanStack React Query 5
- **Backend:** FastAPI (Python) + Uvicorn + asyncpg (no ORMs)
- **Database:** PostgreSQL
- **Object Storage:** MinIO (S3-compatible) for document/receipt uploads
- **Auth:** JWT-based authentication with RBAC

## Architecture

### Backend: 2-Layer Direct Query Pattern
Strictly avoids ORMs (no SQLAlchemy). Uses `asyncpg` for high-performance async PostgreSQL.

1. **Repository Layer** — Raw SQL queries, maps results to Pydantic models
2. **Service Layer** — Business logic (FIFO calculation, location validation, auth, multi-table transactions)

### Frontend: React + React Query
- **Server State:** TanStack React Query exclusively — no `useEffect` for data fetching
- **Local State:** Standard `useState`
- **Styling:** TailwindCSS utility classes only — no inline `style={{...}}`
- **Conditional Classes:** `clsx` or `tailwind-merge`

## Database Schema (PostgreSQL)

### Enums
- `user_role_enum`: `ADMIN`, `MANAGER`, `OPERATOR`
- `item_type_enum`: `RAW_MATERIAL`, `WIP`, `FINISHED_GOOD`
- `entity_type_enum`: `SUPPLIER`, `CUSTOMER`
- `transaction_type_enum`: `INWARD`, `TRANSFER_OUT`, `TRANSFER_IN`, `OUTWARD`, `ADJUSTMENT`

### Tables
- **users** — id (UUID PK), username (unique), password_hash, role, created_at
- **items** — id (UUID PK), sku (unique), name, type, uom, created_at
- **locations** — id (UUID PK), name (unique), description
- **entities** — id (UUID PK), name, type (SUPPLIER/CUSTOMER)
- **batches** — id (UUID PK), batch_number (unique), item_id (FK), location_id (FK), initial_quantity, current_quantity, receipt_date, expiration_date, created_at
- **inventory_transactions** — id (UUID PK), batch_id (FK), user_id (FK), entity_id (FK nullable), transaction_type, quantity, reference_id, receipt_url, created_at

## API Endpoints

### Auth
- `POST /api/v1/auth/login` — Authenticate, returns JWT

### Master Data (CRUD)
- `/api/v1/items` — Items CRUD
- `/api/v1/locations` — Locations CRUD
- `/api/v1/entities` — Entities CRUD
- `/api/v1/users` — Users CRUD (Admin only)

### Inventory Operations
- `POST /api/v1/inventory/inward` — Goods receipt, creates batch at location linked to supplier
- `POST /api/v1/inventory/outward` — Dispatch goods to customer
- `POST /api/v1/inventory/adjust` — Fix inventory discrepancies
- `GET /api/v1/inventory/fifo-suggestion` — FIFO/FEFO picking suggestion
- `POST /api/v1/inventory/transfer` — Internal WIP conversion

### Documents
- `POST /api/v1/upload` — Upload receipt documents to MinIO

## User Roles (RBAC)
- **Admin** — Full access, manages users/roles/master data
- **Production Manager** — WIP transformations, inventory adjustments
- **Warehouse Operator** — Inbound, transfers, outbound, cycle counts

## Frontend Routes
- `/login` — Authentication
- `/` — Dashboard (MetricCards, AlertList for expirations)
- `/items` — Items master data
- `/locations` — Locations master data
- `/entities` — Entities (Suppliers/Customers via tabs)
- `/users` — User management (Admin only)
- `/inventory` — Real-time inventory view (filterable DataTable)
- `/inbound` — Goods receipt
- `/production` — Production transfer (WIP conversion)
- `/outbound` — Dispatch with FIFO suggestions
- `/adjustments` — Inventory adjustments
- `/ledger` — Transaction audit trail

## Reusable Frontend Components
1. **DataTable** — Pagination + sorting
2. **BatchSelector** — Multi-select batches by item ID up to target qty, shows location/expiry
3. **AsyncSelect** — Dropdown fetching from React Query (Items, Locations, Users, Entities)
4. **FileUpload** — Dropzone for multipart/form-data uploads
5. **MetricCard** — Dashboard stat cards
6. **AlertList** — Expiration/low-stock alerts

## Coding Rules

### Database Migrations
- Append-only sequence: `001_<description>.sql`, `002_<description>.sql`
- Never mutate past migrations — create new sequential file for schema changes

### Backend (Python/FastAPI)
- Strict type hinting everywhere
- All DB operations are async `await` calls via asyncpg
- Always use Pydantic models for request/response — never leak raw DB dicts
- Use `HTTPException` for errors — never catch generic `Exception` without logging stack trace
- Use FastAPI `Depends` for injecting asyncpg.Pool into Repositories, Repositories into Services
- Import groups: standard library → third-party → local

### Frontend (React/TypeScript)
- One component per file, PascalCase filenames
- Keep components pure — extract complex logic into custom hooks
- Define all API response interfaces in `types/api.ts`
- No `any` types — use `unknown` if necessary
- Use TailwindCSS utility classes — no inline styles
- Use `clsx` or `tailwind-merge` for conditional class joining

## Sprint Plan

### Sprint 1 (Current): Security & Master Data Foundation
- [x] Setup FastAPI, JWT Auth, Users Repository/API
- [x] Setup MinIO client + `/upload` endpoint
- [ ] Setup React + Vite, Login page, Auth Context
- [ ] Build Backend: Items, Locations, Entities CRUD APIs
- [ ] Build Frontend: DataTable, FormInput, Master Data UIs

### Sprint 2: Inbound Operations & Warehouse Topology
- [ ] Batches + Transactions SQL schemas, `/inward` endpoint
- [ ] Goods Receipt UI, LocationPicker, EntitySelector, FileUpload
- [ ] Real-time inventory dashboard

### Sprint 3: FIFO Dispatch & Outbound
- [ ] FIFO calculation engine, `/fifo-suggestion`, `/outward`
- [ ] Outbound Operations UI
- [ ] BatchSelector component

### Sprint 4: Production Routing, Audits & Polish
- [ ] `/transfer` endpoint for WIP, `/adjust` endpoint
- [ ] Production Transfer UI, Adjustment UI
- [ ] Expiry Warning Dashboard, final polish

## Project Structure
```
warehouse-app/
├── backend/
│   ├── app/
│   │   ├── config/settings.py
│   │   ├── db/database.py, migrate.py
│   │   ├── repositories/users_repository.py
│   │   ├── services/auth_service.py, auth_utils.py, upload_service.py
│   │   ├── routers/auth_router.py, users_router.py, upload_router.py
│   │   └── schemas/auth.py
│   ├── migrations/001_users.sql
│   ├── main.py
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── ... (to be built)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── PRD.md, TSD.md, API_Contract.md
│   ├── Coding_Guidelines.md, Frontend_Flows.md
│   ├── implementation_plan.md, Sprint_Plan.md, task.md
│   └── deployment.md
├── docker-compose.yml
├── CLAUDE.md
└── start_claude.sh
```
