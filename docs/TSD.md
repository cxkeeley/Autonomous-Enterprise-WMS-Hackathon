# Technical Specification Document (TSD)

## 1. System Architecture
- **Frontend:** React + Vite + TypeScript. State management via React Query for server state.
- **Backend:** FastAPI (Python) running on Uvicorn. JWT-based Authentication.
- **Database:** PostgreSQL.

## 2. Backend Design: 2-Layer Direct Query Pattern
The application strictly avoids ORMs (like SQLAlchemy) for performance and explicit SQL control.
We use `asyncpg` for high-performance async PostgreSQL connections.

### 2.1 Repository Layer (Data Access)
Responsible for executing raw SQL queries and mapping results to Pydantic models.

### 2.2 Service Layer (Business Logic)
Contains all business logic, calculating FIFO, validating locations, handling auth, and multi-table transactions.

## 3. Database Schema (PostgreSQL)

```sql
-- Auth & Roles
CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Data
CREATE TYPE item_type_enum AS ENUM ('RAW_MATERIAL', 'WIP', 'FINISHED_GOOD');

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type item_type_enum NOT NULL,
    uom VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TYPE entity_type_enum AS ENUM ('SUPPLIER', 'CUSTOMER');

CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type entity_type_enum NOT NULL
);

-- Batches for FIFO, Expiry, and Location tracking
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    item_id UUID REFERENCES items(id),
    location_id UUID REFERENCES locations(id),
    initial_quantity DECIMAL(10, 2) NOT NULL,
    current_quantity DECIMAL(10, 2) NOT NULL,
    receipt_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secure Audit Ledger for all movements
CREATE TYPE transaction_type_enum AS ENUM ('INWARD', 'TRANSFER_OUT', 'TRANSFER_IN', 'OUTWARD', 'ADJUSTMENT');

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES batches(id),
    user_id UUID REFERENCES users(id),
    entity_id UUID REFERENCES entities(id), -- Nullable, used for Supplier/Customer
    transaction_type transaction_type_enum NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, -- positive for IN, negative for OUT
    reference_id VARCHAR(100), -- PO number, Sales Order, or Reason Code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
