-- seed_002_master_data.sql
-- Dev stage seeder: populates master data with sample items, locations, and entities.
-- Only inserts if the respective tables are empty.

-- Sample Items
INSERT INTO items (sku, name, type, uom)
SELECT * FROM (VALUES
    ('RAW-001', 'Steel Sheet', 'RAW_MATERIAL'::item_type_enum, 'kg'),
    ('RAW-002', 'Aluminum Rod', 'RAW_MATERIAL'::item_type_enum, 'kg'),
    ('RAW-003', 'Copper Wire', 'RAW_MATERIAL'::item_type_enum, 'm'),
    ('WIP-001', 'Cut Steel Panel', 'WIP'::item_type_enum, 'pcs'),
    ('WIP-002', 'Machined Bracket', 'WIP'::item_type_enum, 'pcs'),
    ('FG-001', 'Assembled Frame', 'FINISHED_GOOD'::item_type_enum, 'pcs'),
    ('FG-002', 'Finished Panel Kit', 'FINISHED_GOOD'::item_type_enum, 'pcs')
) AS v(sku, name, type, uom)
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);

-- Sample Locations
INSERT INTO locations (name, description)
SELECT * FROM (VALUES
    ('Aisle 1, Shelf A, Bin 1', 'Raw materials - steel and metals'),
    ('Aisle 1, Shelf A, Bin 2', 'Raw materials - wires and rods'),
    ('Aisle 2, Shelf B, Bin 1', 'WIP storage - panels and brackets'),
    ('Aisle 3, Shelf C, Bin 1', 'Finished goods - assembled products'),
    ('Aisle 4, Shelf D, Bin 1', 'Overflow and bulk storage')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM locations LIMIT 1);

-- Sample Entities (Suppliers & Customers)
INSERT INTO entities (name, type)
SELECT * FROM (VALUES
    ('Acme Steel Corp', 'SUPPLIER'::entity_type_enum),
    ('Global Metals Ltd', 'SUPPLIER'::entity_type_enum),
    ('BuildRight Construction', 'CUSTOMER'::entity_type_enum),
    ('MegaDistributor Inc', 'CUSTOMER'::entity_type_enum)
) AS v(name, type)
WHERE NOT EXISTS (SELECT 1 FROM entities LIMIT 1);
