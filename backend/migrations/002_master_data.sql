-- 002_master_data.sql
-- Sprint 1: Master Data Foundation
-- Creates item_type_enum, entity_type_enum, and master data tables.

DO $$ BEGIN
    CREATE TYPE item_type_enum AS ENUM ('RAW_MATERIAL', 'WIP', 'FINISHED_GOOD');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type_enum AS ENUM ('SUPPLIER', 'CUSTOMER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type item_type_enum NOT NULL,
    uom VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type entity_type_enum NOT NULL
);
