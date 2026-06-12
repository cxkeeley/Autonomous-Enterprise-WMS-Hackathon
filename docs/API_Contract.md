# API Contract (FastAPI)

## 1. Items API
### `GET /api/v1/items`
Returns a list of all items in the master catalog.

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

## 2. Inventory Operations API

### `POST /api/v1/inventory/inward`
Receive new goods into the warehouse. Creates a new Batch.
**Payload:**
```json
{
  "item_id": "a3b2c1d0-1234-5678-90ab-cdef12345678",
  "quantity": 1000,
  "receipt_date": "2026-06-12T00:00:00Z",
  "expiration_date": "2027-06-12T00:00:00Z",
  "reference": "PO-99213"
}
```

### `POST /api/v1/inventory/transfer`
Move raw/WIP to the next production stage.
**Payload:**
```json
{
  "consumed_batches": [
    {"batch_id": "b4c3d2e1-2345-6789-01bc-def012345679", "quantity": 200}
  ],
  "produced_item_id": "c5d4e3f2-3456-7890-12cd-ef012345678a", 
  "produced_quantity": 50,
  "reference": "PROD-ORDER-12"
}
```

### `POST /api/v1/inventory/outward`
Dispatch finished goods using FIFO.
**Payload:**
```json
{
  "item_id": "c5d4e3f2-3456-7890-12cd-ef012345678a",
  "quantity": 10,
  "reference": "SALES-ORDER-55"
}
```

### `GET /api/v1/inventory/fifo-suggestion?item_id=c5d4e3f2-3456-7890-12cd-ef012345678a&quantity=10`
Used by the frontend to ask the backend which batches should be picked for an outward transaction based on FIFO/FEFO rules.
**Response:**
```json
{
  "suggested_batches": [
    {"batch_id": "d6e5f403-4567-8901-23de-f0123456789b", "batch_number": "B-008", "allocate_qty": 5, "expires_at": "2026-08-01"},
    {"batch_id": "e7f60514-5678-9012-34ef-01234567890c", "batch_number": "B-009", "allocate_qty": 5, "expires_at": "2026-09-01"}
  ]
}
```
