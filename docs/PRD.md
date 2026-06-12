# Product Requirements Document (PRD): Warehouse Management System

## 1. Overview
A specialized Warehouse Management System (WMS) designed to handle the lifecycle of manufacturing inventory, from raw materials to finished goods. The system strictly enforces FIFO (First-In, First-Out) and expiration date tracking to minimize waste and ensure quality control.

## 2. User Roles
- **Warehouse Operator:** Responsible for logging inbound goods, executing internal transfers, and outbound shipping.
- **Production Manager:** Oversees the transformation of raw materials into Work-in-Progress (WIP) and Finished Goods.
- **Admin:** Manages master data (Item definitions, user roles, configurations).

## 3. Core Features & Requirements

### 3.1 Item & Master Data Management
- System must support three distinct item types: `RAW_MATERIAL`, `WIP` (Half Production), and `FINISHED_GOOD`.
- Each item must have properties: SKU, Name, Description, Unit of Measure (UoM), and Default Shelf Life.

### 3.2 Inbound Operations (Goods Receipt)
- Users can receive incoming `RAW_MATERIAL` items.
- Every receipt automatically generates a unique **Batch Number** (or allows manual input).
- Users must specify the Quantity, Receipt Date, and Expiration Date.

### 3.3 Internal Transfers (Production)
- **Raw to WIP:** Consumes raw material batches and creates new WIP batches.
- **WIP to Finished:** Consumes WIP batches and creates Finished Good batches.
- **BOM (Bill of Materials) [Future Scope]:** For now, manual specification of consumed vs. produced quantities is acceptable, but system must link the parent-child batches for traceability.

### 3.4 Outbound Operations (Dispatch)
- System must guide the user to pick inventory based on **FIFO** (oldest receipt date) or **FEFO** (First-Expired, First-Out).
- Prevents dispatching expired goods unless explicitly authorized via an override.

### 3.5 Inventory Visibility & Reporting
- Real-time stock levels per Item and per Batch.
- Expiration Warning Dashboard (Highlighting batches expiring within 30, 60, 90 days).
- Full transaction ledger (Audit trail of every movement).

## 4. UI/UX Requirements
- **Reusable Components:** The UI must be constructed using highly reusable components (e.g., standard data tables, modal dialogs, form inputs, batch selection widgets).
- **Responsive:** Usable on tablets for warehouse floor operations.
- **Dynamic Feedback:** Immediate validation for API calls using optimistic UI updates or clear loading states via `tanstack/react-query`.
