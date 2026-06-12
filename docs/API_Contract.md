# API Contract (FastAPI)

## 1. Auth API
### `POST /api/v1/auth/login`
Authenticates a user and returns a JWT token.
**Payload:**
```json
{
  "username": "admin",
  "password": "securepassword123"
}
```

## 2. Master Data APIs (Locations & Entities)
*(Standard CRUD endpoints for `/api/v1/locations` and `/api/v1/entities`)*

## 3. Items API
### `POST /api/v1/items`
Create a new item (Raw, WIP, or Finished).
**Payload:**
```json
{
  "sku": "RAW-001",
  "name": "Steel Sheet",
  "type": "RAW_MATERIAL",
  "uom": "kg"
}
```

## 4. Inventory Operations API

### `POST /api/v1/inventory/inward`
Receive new goods. Creates a Batch at a specific Location, linked to a Supplier.
**Payload:**
```json
{
  "item_id": "a3b2c1d0-1234-5678-90ab-cdef12345678",
  "quantity": 1000,
  "location_id": "f8a1c2d3-4567-8901-23bc-def012345678",
  "supplier_entity_id": "e9b2c3d4-5678-9012-34cd-ef0123456789",
  "receipt_date": "2026-06-12T00:00:00Z",
  "expiration_date": "2027-06-12T00:00:00Z",
  "reference": "PO-99213"
}
```

### `POST /api/v1/inventory/outward`
Dispatch goods to a Customer.
**Payload:**
```json
{
  "item_id": "c5d4e3f2-3456-7890-12cd-ef012345678a",
  "quantity": 10,
  "customer_entity_id": "1a2b3c4d-1234-5678-90ef-abcdef123456",
  "reference": "SALES-ORDER-55"
}
```

### `POST /api/v1/inventory/adjust`
Fix inventory discrepancies due to damage or miscounts.
**Payload:**
```json
{
  "batch_id": "b4c3d2e1-2345-6789-01bc-def012345679",
  "adjustment_quantity": -5,
  "reason": "Damaged during handling"
}
```

### `GET /api/v1/inventory/fifo-suggestion?item_id=c5d4e3f2-3456-7890-12cd-ef012345678a&quantity=10`
**Response:**
```json
{
  "suggested_batches": [
    {"batch_id": "d6e5f403-4567-8901-23de-f0123456789b", "location_name": "Aisle 4", "allocate_qty": 5, "expires_at": "2026-08-01"}
  ]
}
```
