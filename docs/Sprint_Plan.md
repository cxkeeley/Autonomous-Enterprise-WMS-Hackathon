# Sprint Plan for Agentic Development (Claude Code / DeepSeek)

## Sprint 1: Infrastructure & Master Data
**Goal:** Establish the foundational architecture and allow creation of Items.
*   **Task 1.1:** Initialize FastAPI project with `asyncpg`, Pydantic models, and custom dependency injection for the DB Pool.
*   **Task 1.2:** Initialize Vite + React project, configure TailwindCSS/CSS Modules, and setup TanStack React Query.
*   **Task 1.3:** Build Backend: Items SQL schema, Repository, Service, and REST endpoints.
*   **Task 1.4:** Build Frontend: Reusable `DataTable` component, `FormInput` component, and the Items management UI.

## Sprint 2: Inbound Operations & Batch Tracking
**Goal:** Bring inventory into the warehouse with proper batch and expiry tracking.
*   **Task 2.1:** Build Backend: Batches and Transactions SQL schemas. Implement the `/inward` endpoint ensuring atomic DB transactions.
*   **Task 2.2:** Build Frontend: Goods Receipt UI. Reusable `DatePicker` component for expiration dates. Form validation.
*   **Task 2.3:** Build Frontend: Real-time inventory dashboard grouped by Item and Batch (utilizing React Query caching).

## Sprint 3: FIFO Dispatch & Outbound
**Goal:** Successfully ship goods out using automated FIFO/FEFO rules.
*   **Task 3.1:** Build Backend: FIFO calculation engine in the Service layer. Implement `/fifo-suggestion` and `/outward` endpoints.
*   **Task 3.2:** Build Frontend: Outbound Operations UI. Integrate the FIFO suggestion API so operators can see which batches to pick before confirming.
*   **Task 3.3:** Build Frontend: Reusable `BatchSelector` component to allow manual overrides if an operator picks a different batch than suggested.

## Sprint 4: Production Routing & Polish
**Goal:** Handle internal conversions (Raw $\rightarrow$ WIP $\rightarrow$ Finished) and finalize the app.
*   **Task 4.1:** Build Backend: Implement the `/transfer` endpoint to simultaneously deduct from consumed batches and create a new produced batch.
*   **Task 4.2:** Build Frontend: Production Transfer UI utilizing the `BatchSelector` from Sprint 3.
*   **Task 4.3:** Build Frontend: Expiry Warning Dashboard. Polish UI/UX with micro-animations and loading states across all React Query hooks.
