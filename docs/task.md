# Warehouse App Execution Tasks

- `[ ]` **Sprint 1: Security & Master Data Foundation**
  - `[ ]` Setup FastAPI, JWT Auth schema, and Users API
  - `[ ]` Setup MinIO client and `/upload` endpoint
  - `[ ]` Setup React + Vite, Login page, and Auth Context
  - `[ ]` Build Backend: Items, Locations, and Entities CRUD APIs
  - `[ ]` Build Frontend: Reusable components (`DataTable`, `LocationPicker`)
  - `[ ]` Build Frontend: Master Data management UIs

- `[ ]` **Sprint 2: Inbound Operations & Warehouse Topology**
  - `[ ]` Implement Backend Batches and Transactions SQL Schemas
  - `[ ]` Implement `/inward` API with `user_id`, `location_id`, `supplier_id`
  - `[ ]` Implement Frontend Goods Receipt UI with `FileUpload` component
  - `[ ]` Implement Real-time Inventory Dashboard (Item/Batch/Location grouped)

- `[ ]` **Sprint 3: FIFO Dispatch & Outbound**
  - `[ ]` Implement Backend FIFO calculation engine
  - `[ ]` Implement `/fifo-suggestion` and `/outward` API endpoints
  - `[ ]` Implement Frontend Outbound Operations UI linked to Customers
  - `[ ]` Implement Frontend `BatchSelector` component

- `[ ]` **Sprint 4: Production Routing, Audits, & Polish**
  - `[ ]` Implement Backend `/transfer` API endpoint for WIP conversions
  - `[ ]` Implement Backend `/adjust` API for inventory shrinkage/damage
  - `[ ]` Implement Frontend Production Transfer and Adjustment UIs
  - `[ ]` Implement Expiry Warning Dashboard
  - `[ ]` Final UI/UX Polish (animations, loading states)
