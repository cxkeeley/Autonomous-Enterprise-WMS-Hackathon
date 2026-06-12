# Warehouse App Execution Tasks

- `[ ]` **Sprint 1: Infrastructure & Master Data**
  - `[ ]` Initialize FastAPI backend with `asyncpg` and Pydantic models
  - `[ ]` Initialize React + Vite frontend with TailwindCSS and React Query
  - `[ ]` Implement Backend Items Schema, Repository, and REST endpoints
  - `[ ]` Implement Frontend Reusable Components (`DataTable`, `FormInput`)
  - `[ ]` Implement Frontend Items Management Page

- `[ ]` **Sprint 2: Inbound Operations & Batch Tracking**
  - `[ ]` Implement Backend Batches and Transactions SQL Schemas
  - `[ ]` Implement `/inward` API endpoint with atomic transactions
  - `[ ]` Implement Frontend Goods Receipt UI and `DatePicker` component
  - `[ ]` Implement Real-time Inventory Dashboard (Item/Batch grouped)

- `[ ]` **Sprint 3: FIFO Dispatch & Outbound**
  - `[ ]` Implement Backend FIFO calculation engine in Service layer
  - `[ ]` Implement `/fifo-suggestion` and `/outward` API endpoints
  - `[ ]` Implement Frontend Outbound Operations UI
  - `[ ]` Implement Frontend `BatchSelector` component

- `[ ]` **Sprint 4: Production Routing & Polish**
  - `[ ]` Implement Backend `/transfer` API endpoint for WIP conversions
  - `[ ]` Implement Frontend Production Transfer UI
  - `[ ]` Implement Expiry Warning Dashboard
  - `[ ]` Final UI/UX Polish (animations, loading states)
