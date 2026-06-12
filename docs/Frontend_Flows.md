# Frontend Flow & Pages Architecture

This document outlines the React Router page structure, user flows, and component responsibilities for the Warehouse Management System frontend.

## 1. Authentication Flow
- **Path:** `/login`
- **Description:** Entry point for the application. Users must authenticate.
- **Flow:** User enters credentials $\rightarrow$ Backend returns JWT $\rightarrow$ Frontend stores JWT (React Context / LocalStorage) $\rightarrow$ Redirects to Dashboard.

## 2. Global Layout
- **Sidebar Navigation:** Contains links to Dashboard, Master Data, Inventory, and Reports. Displays the currently logged-in user and their role (e.g., `Admin`, `Operator`).
- **Header:** Contains Breadcrumbs, Global Search (optional), and Logout button.

## 3. Core Pages & Routes

### 3.1 Dashboard
- **Path:** `/`
- **Description:** High-level overview of warehouse health.
- **Components Needed:**
  - `MetricCard`: Total Items, Total Active Batches.
  - `AlertList`: Upcoming Expirations (FEFO warning), Low Stock Alerts.

### 3.2 Master Data Management
*This section allows Admins and Managers to set up the rules of the warehouse.*
- **Items Page** (`/items`): 
  - Displays a `DataTable` of all items. 
  - Button to open `ItemModal` to create new Raw/WIP/Finished goods.
- **Locations Page** (`/locations`): 
  - `DataTable` of aisles and bins.
- **Entities Page** (`/entities`): 
  - `DataTable` separating Suppliers and Customers via tabs.
- **Users Page** (`/users`) [Admin Only]: 
  - Manage RBAC, create new operator accounts.

### 3.3 Inventory Operations (The Core Flow)
*This section is where Warehouse Operators spend 90% of their time.*

- **Real-time Inventory** (`/inventory`):
  - A highly filterable `DataTable`. Users can search by SKU, Location, or Batch ID to see exactly what is in the warehouse right now.

- **Goods Receipt (Inbound)** (`/inbound`):
  - **Flow:** Operator selects a Supplier (`EntitySelector`) $\rightarrow$ Selects an Item (`ItemSelector`) $\rightarrow$ Inputs Quantity, Expiry Date (`DatePicker`), and physical Destination Location (`LocationPicker`) $\rightarrow$ Submits.
  - **Result:** System confirms the new Batch ID generated.

- **Production Transfer (Internal)** (`/production`):
  - **Flow:** Operator defines what they are *producing* (Item + Qty) $\rightarrow$ Uses the `BatchSelector` widget to scan/select which Raw/WIP batches they are *consuming* from which locations $\rightarrow$ Submits.

- **Dispatch (Outbound)** (`/outbound`):
  - **Flow:** Operator selects a Customer $\rightarrow$ Selects the Item to ship and required Quantity.
  - **Magic UI Step:** The system calls `/fifo-suggestion` and highlights exactly which Batches the operator *should* pick, and from which Location.
  - Operator uses the `BatchSelector` to confirm they picked the suggested batches (or overrides them if physical conditions demand) $\rightarrow$ Submits.

- **Adjustments (Audits)** (`/adjustments`):
  - **Flow:** Operator selects a Batch $\rightarrow$ Declares a positive or negative adjustment $\rightarrow$ Types a mandatory reason code (e.g., "Damaged Box") $\rightarrow$ Submits.

### 3.4 Reporting & Audits
- **Transaction Ledger** (`/ledger`):
  - A read-only historical `DataTable`.
  - Shows every movement (`INWARD`, `OUTWARD`, `TRANSFER`, `ADJUSTMENT`).
  - Columns include: Timestamp, Transaction Type, Item, Qty, Location, Reference, and **Performed By** (Audit Trail).

## 4. Reusable Component Strategy
To keep development fast, the AI should build these generic widgets first:
1. `DataTable`: Must support pagination and basic sorting.
2. `BatchSelector`: A complex widget that takes an `Item ID` and lets the user multi-select existing batches up to a target quantity. Must display Location and Expiry dates.
3. `AsyncSelect`: A dropdown that fetches data from React Query (used for picking Items, Locations, Users, and Entities).
