-- seed_003_inventory.sql
-- Dev stage seeder: creates sample batches and inward transactions.
-- Only inserts if the batches table is empty.

DO $$
DECLARE
    v_item_id UUID;
    v_location_id UUID;
    v_supplier_id UUID;
    v_user_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM batches LIMIT 1) THEN
        RETURN;
    END IF;

    -- Get reference IDs from seeded master data
    SELECT id INTO v_item_id FROM items WHERE sku = 'RAW-001' LIMIT 1;
    SELECT id INTO v_location_id FROM locations WHERE name = 'Aisle 1, Shelf A, Bin 1' LIMIT 1;
    SELECT id INTO v_supplier_id FROM entities WHERE name = 'Acme Steel Corp' AND type = 'SUPPLIER'::entity_type_enum LIMIT 1;
    SELECT id INTO v_user_id FROM users WHERE username = 'admin' LIMIT 1;

    -- Only proceed if we have all references
    IF v_item_id IS NOT NULL AND v_location_id IS NOT NULL AND v_supplier_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Batch 1: Steel Sheet, 1000 kg, received 2026-06-01, expires 2027-06-01
        WITH batch AS (
            INSERT INTO batches (batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date)
            VALUES ('BATCH-2026-001', v_item_id, v_location_id, 1000, 1000, '2026-06-01T00:00:00Z', '2027-06-01T00:00:00Z')
            RETURNING id
        )
        INSERT INTO inventory_transactions (batch_id, user_id, entity_id, transaction_type, quantity, reference_id)
        SELECT id, v_user_id, v_supplier_id, 'INWARD'::transaction_type_enum, 1000, 'PO-2026-001'
        FROM batch;

        -- Batch 2: Steel Sheet, 500 kg, received 2026-06-10, expires 2027-06-10
        WITH batch AS (
            INSERT INTO batches (batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date)
            VALUES ('BATCH-2026-002', v_item_id, v_location_id, 500, 500, '2026-06-10T00:00:00Z', '2027-06-10T00:00:00Z')
            RETURNING id
        )
        INSERT INTO inventory_transactions (batch_id, user_id, entity_id, transaction_type, quantity, reference_id)
        SELECT id, v_user_id, v_supplier_id, 'INWARD'::transaction_type_enum, 500, 'PO-2026-002'
        FROM batch;
    END IF;
END $$;
