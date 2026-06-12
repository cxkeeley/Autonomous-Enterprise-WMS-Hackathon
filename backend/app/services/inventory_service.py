import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
import asyncpg

from app.repositories.batches_repository import BatchesRepository
from app.repositories.transactions_repository import TransactionsRepository
from app.repositories.items_repository import ItemsRepository
from app.repositories.locations_repository import LocationsRepository
from app.repositories.entities_repository import EntitiesRepository


class InventoryService:
    """Service layer for inventory operations with atomic transaction boundaries."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        self.batches_repo = BatchesRepository(pool)
        self.transactions_repo = TransactionsRepository(pool)
        self.items_repo = ItemsRepository(pool)
        self.locations_repo = LocationsRepository(pool)
        self.entities_repo = EntitiesRepository(pool)

    async def inward(
        self,
        item_id: str,
        quantity: float,
        location_id: str,
        supplier_entity_id: str,
        user_id: str,
        receipt_date: datetime,
        expiration_date: datetime = None,
        reference: str = None,
        receipt_url: str = None,
    ) -> dict:
        """
        Receive goods into the warehouse.

        This is an ATOMIC multi-table transaction:
        1. Validate item, location, and supplier exist
        2. Generate a unique batch number
        3. Create the batch record
        4. Create the INWARD transaction ledger entry
        All steps succeed or roll back together.
        """
        # Validate references exist before opening transaction
        item = await self.items_repo.find_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        location = await self.locations_repo.find_by_id(location_id)
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")

        supplier = await self.entities_repo.find_by_id(supplier_entity_id)
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier entity not found")

        if supplier["type"] != "SUPPLIER":
            raise HTTPException(status_code=400, detail="Entity must be a SUPPLIER")

        # Generate batch number
        batch_number = f"BATCH-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        # Atomic transaction: batch + ledger entry
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # Create batch
                batch_row = await conn.fetchrow(
                    """
                    INSERT INTO batches (batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date)
                    VALUES ($1, $2::uuid, $3::uuid, $4, $4, $5, $6)
                    RETURNING id, batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date, created_at
                    """,
                    batch_number, item_id, location_id, quantity, receipt_date, expiration_date,
                )

                # Create transaction ledger entry
                await conn.execute(
                    """
                    INSERT INTO inventory_transactions (batch_id, user_id, entity_id, transaction_type, quantity, reference_id, receipt_url)
                    VALUES ($1::uuid, $2::uuid, $3::uuid, 'INWARD'::transaction_type_enum, $4, $5, $6)
                    """,
                    batch_row["id"], user_id, supplier_entity_id, quantity, reference, receipt_url,
                )

        from app.repositories.batches_repository import _row_to_dict
        return {
            "batch": _row_to_dict(batch_row),
            "message": "Goods received successfully",
        }

    async def get_fifo_suggestion(self, item_id: str, quantity: float) -> list:
        """
        FIFO/FEFO picking suggestion for a given item and quantity.

        Returns batches ordered by expiration_date ASC (FEFO), then receipt_date ASC (FIFO),
        with cumulative picking suggestions up to the requested quantity.
        """
        item = await self.items_repo.find_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")

        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    b.id, b.batch_number, b.item_id, b.location_id,
                    b.current_quantity, b.receipt_date, b.expiration_date,
                    l.name AS location_name
                FROM batches b
                JOIN locations l ON l.id = b.location_id
                WHERE b.item_id = $1::uuid AND b.current_quantity > 0
                ORDER BY b.expiration_date ASC NULLS LAST, b.receipt_date ASC
                """,
                item_id,
            )

        suggestions = []
        remaining = quantity
        for row in rows:
            d = dict(row)
            pick_qty = min(float(d["current_quantity"]), remaining)
            suggestions.append({
                "batch_id": str(d["id"]),
                "batch_number": d["batch_number"],
                "location_id": str(d["location_id"]),
                "location_name": d["location_name"],
                "available_quantity": float(d["current_quantity"]),
                "suggested_quantity": pick_qty,
                "expiration_date": d["expiration_date"].isoformat() if d["expiration_date"] else None,
            })
            remaining -= pick_qty
            if remaining <= 0:
                break

        if remaining > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Only {quantity - remaining:.2f} of {quantity:.2f} available.",
            )

        return suggestions

    async def outward(
        self,
        item_id: str,
        quantity: float,
        customer_entity_id: str,
        user_id: str,
        reference: str = None,
        receipt_url: str = None,
    ) -> dict:
        """
        Dispatch goods to a customer using FIFO/FEFO.

        This is an ATOMIC multi-table transaction:
        1. Validate item and customer exist
        2. Get FIFO-ordered batches
        3. Deduct from batches and create OUTWARD ledger entries
        All steps succeed or roll back together.
        """
        # Validate references exist before opening transaction
        item = await self.items_repo.find_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        customer = await self.entities_repo.find_by_id(customer_entity_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer entity not found")

        if customer["type"] != "CUSTOMER":
            raise HTTPException(status_code=400, detail="Entity must be a CUSTOMER")

        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")

        # Atomic transaction: deduct batches + create ledger entries
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # Get FIFO-ordered batches with row-level lock
                rows = await conn.fetch(
                    """
                    SELECT id, batch_number, current_quantity
                    FROM batches
                    WHERE item_id = $1::uuid AND current_quantity > 0
                    ORDER BY expiration_date ASC NULLS LAST, receipt_date ASC
                    FOR UPDATE
                    """,
                    item_id,
                )

                if not rows:
                    raise HTTPException(status_code=400, detail="No stock available for this item")

                remaining = quantity
                transactions = []

                for row in rows:
                    if remaining <= 0:
                        break

                    batch_id = str(row["id"])
                    available = float(row["current_quantity"])
                    deduct_qty = min(available, remaining)
                    new_qty = available - deduct_qty

                    # Update batch quantity
                    await conn.execute(
                        "UPDATE batches SET current_quantity = $1 WHERE id = $2::uuid",
                        new_qty, batch_id,
                    )

                    # Create OUTWARD ledger entry
                    txn_row = await conn.fetchrow(
                        """
                        INSERT INTO inventory_transactions (batch_id, user_id, entity_id, transaction_type, quantity, reference_id, receipt_url)
                        VALUES ($1::uuid, $2::uuid, $3::uuid, 'OUTWARD'::transaction_type_enum, $4, $5, $6)
                        RETURNING id, batch_id, quantity, created_at
                        """,
                        batch_id, user_id, customer_entity_id, deduct_qty, reference, receipt_url,
                    )

                    transactions.append({
                        "transaction_id": str(txn_row["id"]),
                        "batch_id": batch_id,
                        "batch_number": row["batch_number"],
                        "quantity": deduct_qty,
                        "created_at": txn_row["created_at"].isoformat() if txn_row["created_at"] else None,
                    })
                    remaining -= deduct_qty

                if remaining > 0:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock. Only {quantity - remaining:.2f} of {quantity:.2f} available.",
                    )

        return {
            "transactions": transactions,
            "message": f"Dispatched {quantity:.2f} units successfully",
        }

    async def get_inventory(self) -> list:
        """Get real-time inventory view (all active batches with item/location details)."""
        return await self.batches_repo.get_inventory_view()

    async def get_inventory_summary(self) -> list:
        """Get inventory summary grouped by item."""
        return await self.batches_repo.get_inventory_summary()

    async def get_transactions(self, limit: int = 100, offset: int = 0) -> list:
        """Get the transaction ledger."""
        return await self.transactions_repo.list_all(limit, offset)
