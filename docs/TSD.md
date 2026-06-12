# Technical Specification Document (TSD)

## 1. System Architecture
- **Frontend:** React + Vite + TypeScript. State management via React Query for server state and Context API/Zustand for minimal local state.
- **Backend:** FastAPI (Python) running on Uvicorn.
- **Database:** PostgreSQL.

## 2. Backend Design: 2-Layer Direct Query Pattern
The application strictly avoids ORMs (like SQLAlchemy) for performance and explicit SQL control.
We will use `asyncpg` for high-performance async PostgreSQL connections.

### 2.1 Repository Layer (Data Access)
Responsible for executing raw SQL queries and mapping results to Pydantic models.
```python
# Example Repository Pattern
class ItemRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        
    async def get_items(self) -> List[Item]:
        query = "SELECT id, sku, name, item_type FROM items WHERE is_active = true"
        records = await self.pool.fetch(query)
        return [Item(**dict(r)) for r in records]
```

### 2.2 Service Layer (Business Logic)
Contains all business logic, such as calculating FIFO, validating expiration dates, and orchestrating multi-table transactions.
```python
# Example Service Pattern
class InventoryService:
    def __init__(self, item_repo: ItemRepository, batch_repo: BatchRepository):
        self.item_repo = item_repo
        self.batch_repo = batch_repo

    async def execute_outbound(self, item_id: uuid.UUID, quantity: int):
        # 1. Fetch available batches ordered by receipt_date ASC (FIFO)
        # 2. Allocate quantities across batches
        # 3. Create transaction records
        # 4. Update batch balances inside a DB transaction block
        pass
```

## 3. Frontend Architecture
- **API Communication:** `tanstack/react-query` will handle all data fetching, caching, and mutations.
- **Component Reusability Strategy:**
  - `DataTable`: A generic component handling pagination, sorting, and rendering data arrays.
  - `BatchSelector`: A reusable widget used in both Internal Transfers and Outbound Operations to select which batches to consume.
  - `FormInput`: Standardized input fields with validation to be reused across all creation/edit forms.
  - `StatusBadge`: Used to display item types and batch statuses (e.g., Expired, Active).

## 4. Database Schema (PostgreSQL)

```sql
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

-- Batches for FIFO and Expiry tracking
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    item_id UUID REFERENCES items(id),
    initial_quantity DECIMAL(10, 2) NOT NULL,
    current_quantity DECIMAL(10, 2) NOT NULL,
    receipt_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Ledger for all movements
CREATE TYPE transaction_type_enum AS ENUM ('INWARD', 'TRANSFER_OUT', 'TRANSFER_IN', 'OUTWARD');

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES batches(id),
    transaction_type transaction_type_enum NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, -- positive for IN, negative for OUT
    reference_id VARCHAR(100), -- E.g., PO number or Transfer Order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
