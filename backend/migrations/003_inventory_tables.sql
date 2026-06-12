-- 003_inventory_tables.sql
-- Sprint 2: Inbound Operations & Warehouse Topology
-- Creates transaction_type_enum, batches table, and inventory_transactions ledger.

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('INWARD', 'TRANSFER_OUT', 'TRANSFER_IN', 'OUTWARD', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    item_id UUID REFERENCES items(id),
    location_id UUID REFERENCES locations(id),
    initial_quantity DECIMAL(10, 2) NOT NULL,
    current_quantity DECIMAL(10, 2) NOT NULL,
    receipt_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES batches(id),
    user_id UUID REFERENCES users(id),
    entity_id UUID REFERENCES entities(id),
    transaction_type transaction_type_enum NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    reference_id VARCHAR(100),
    receipt_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
