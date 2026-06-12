# Sprint Plan for Agentic Development (Claude Code / DeepSeek)

## Sprint 1: Security & Master Data Foundation
**Goal:** Establish architecture, authentication, and core master data.
*   **Task 1.1:** Setup FastAPI, JWT Auth schema, and Users Repository/API.
*   **Task 1.2:** Setup MinIO client in backend and create `/upload` endpoint for documents.
*   **Task 1.3:** Setup Vite React project, Login page, and Auth Context.
*   **Task 1.4:** Build Backend: Items, Locations, and Entities CRUD APIs.
*   **Task 1.5:** Build Frontend: Reusable `DataTable`, `FormInput`, and Master Data management UIs.

## Sprint 2: Inbound Operations & Warehouse Topology
**Goal:** Bring inventory into the physical warehouse.
*   **Task 2.1:** Build Backend: Batches and Transactions SQL schemas. Implement `/inward` endpoint ensuring atomic DB transactions linked to `user_id` and `location_id`.
*   **Task 2.2:** Build Frontend: Goods Receipt UI. Reusable `LocationPicker`, `EntitySelector`, and `FileUpload` components.
*   **Task 2.3:** Build Frontend: Real-time inventory dashboard grouped by Item, Batch, and Location.

## Sprint 3: FIFO Dispatch & Outbound
**Goal:** Successfully ship goods out using automated FIFO/FEFO rules.
*   **Task 3.1:** Build Backend: FIFO calculation engine. Implement `/fifo-suggestion` and `/outward` endpoints.
*   **Task 3.2:** Build Frontend: Outbound Operations UI linking to Customers.
*   **Task 3.3:** Build Frontend: Reusable `BatchSelector` component allowing manual overrides.

## Sprint 4: Production Routing, Audits, & Polish
**Goal:** Handle internal WIP conversions and cycle counts.
*   **Task 4.1:** Build Backend: Implement `/transfer` endpoint for WIP and `/adjust` endpoint for shrinkage.
*   **Task 4.2:** Build Frontend: Production Transfer UI and Inventory Adjustment UI.
*   **Task 4.3:** Build Frontend: Expiry Warning Dashboard. Final Polish.
