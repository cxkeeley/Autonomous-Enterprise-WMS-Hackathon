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

    async def get_inventory(self) -> list:
        """Get real-time inventory view (all active batches with item/location details)."""
        return await self.batches_repo.get_inventory_view()

    async def get_inventory_summary(self) -> list:
        """Get inventory summary grouped by item."""
        return await self.batches_repo.get_inventory_summary()

    async def get_transactions(self, limit: int = 100, offset: int = 0) -> list:
        """Get the transaction ledger."""
        return await self.transactions_repo.list_all(limit, offset)
