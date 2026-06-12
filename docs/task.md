# Warehouse App Execution Tasks

- `[x]` **Sprint 1: Security & Master Data Foundation**
  - `[x]` Setup FastAPI, JWT Auth schema, and Users API
  - `[x]` Setup MinIO client and `/upload` endpoint
  - `[x]` Setup React + Vite, Login page, and Auth Context
  - `[x]` Build Backend: Items, Locations, and Entities CRUD APIs
  - `[x]` Build Frontend: Reusable components (`DataTable`, `LocationPicker`)
  - `[x]` Build Frontend: Master Data management UIs

- `[x]` **Sprint 2: Inbound Operations & Warehouse Topology**
  - `[x]` Implement Backend Batches and Transactions SQL Schemas
  - `[x]` Implement `/inward` API with `user_id`, `location_id`, `supplier_id`
  - `[x]` Implement Frontend Goods Receipt UI with `FileUpload` component
  - `[x]` Implement Real-time Inventory Dashboard (Item/Batch/Location grouped)

- `[x]` **Sprint 3: FIFO Dispatch & Outbound**
  - `[x]` Implement Backend FIFO calculation engine
  - `[x]` Implement `/fifo-suggestion` and `/outward` API endpoints
  - `[x]` Implement Frontend Outbound Operations UI linked to Customers
  - `[x]` Implement Frontend `BatchSelector` component
  - `[x]` Implement MinIO Docker container and finalize S3 file uploads

- `[x]` **Sprint 4: Production Routing, Audits, & Polish**
  - `[x]` Implement Backend `/transfer` API endpoint for WIP conversions
  - `[x]` Implement Backend `/adjust` API for inventory shrinkage/damage
  - `[x]` Implement Frontend Production Transfer and Adjustment UIs
  - `[x]` Implement Expiry Warning Dashboard
  - `[x]` Final UI/UX Polish (animations, loading states)
