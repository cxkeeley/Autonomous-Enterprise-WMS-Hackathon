# Product Requirements Document (PRD): Warehouse Management System

## 1. Overview
A specialized Warehouse Management System (WMS) designed to handle the lifecycle of manufacturing inventory, from raw materials to finished goods. The system enforces FIFO (First-In, First-Out), expiration date tracking, location tracking, and secure audit trails.

## 2. User Authentication & Roles (RBAC)
The system requires login and enforces Role-Based Access Control:
- **Admin:** Full access. Manages Users, Roles, and core Master Data.
- **Production Manager:** Oversees the transformation of raw materials into Work-in-Progress (WIP) and Finished Goods. Can perform Inventory Adjustments.
- **Warehouse Operator:** Responsible for logging inbound goods, executing internal transfers, outbound shipping, and physical cycle counts.

## 3. Core Features & Requirements

### 3.1 Master Data Management
- **Items:** `RAW_MATERIAL`, `WIP` (Half Production), and `FINISHED_GOOD`. Properties: SKU, Name, Description, UoM, Shelf Life.
- **Locations/Bins:** Defines physical layout (e.g., Aisle 4, Shelf B, Bin 2) so workers know exactly where inventory resides.
- **Entities:** Tracks external parties (Suppliers and Customers).

### 3.2 Inbound Operations (Goods Receipt)
- Receive incoming `RAW_MATERIAL` items linked to a specific **Supplier**.
- Generates a unique **Batch Number**, requires Expiration Date, and assigns the goods to a specific **Location** in the warehouse.
- Support for physical document uploads (e.g., supplier receipts, invoices) stored securely in MinIO.

### 3.3 Internal Transfers (Production)
- **Raw to WIP:** Consumes raw material batches and creates new WIP batches.
- **WIP to Finished:** Consumes WIP batches and creates Finished Good batches.

### 3.4 Outbound Operations (Dispatch)
- System guides the user to pick inventory based on **FIFO/FEFO** from specific physical **Locations**.
- Outbound shipments must be linked to a specific **Customer**.

### 3.5 Inventory Adjustments & Cycle Counts
- Support for physical inventory audits. If a worker drops a box (damage) or a count is off (shrinkage), authorized users can execute an `ADJUSTMENT` transaction to rectify system balance.

### 3.6 Inventory Visibility & Reporting
- Real-time stock levels per Item, Batch, and Location.
- Expiration Warning Dashboard (Highlighting batches expiring within 30, 60, 90 days).
- Full secure transaction ledger (Audit trail tracking the exact User ID who made the movement).

## 4. UI/UX Requirements
- **Reusable Components:** `DataTable`, `BatchSelector`, `LocationPicker`.
- **Responsive:** Usable on tablets for warehouse floor operations.
- **Dynamic Feedback:** Immediate validation using `tanstack/react-query`.
