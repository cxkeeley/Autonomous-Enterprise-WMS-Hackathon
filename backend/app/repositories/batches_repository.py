from typing import Optional, List
import asyncpg
from uuid import UUID


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, UUID):
            d[k] = str(v)
    return d


class BatchesRepository:
    """Repository for batches table using raw SQL via asyncpg."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create(
        self,
        batch_number: str,
        item_id: str,
        location_id: str,
        initial_quantity: float,
        current_quantity: float,
        receipt_date,
        expiration_date=None,
    ) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO batches (batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date)
                VALUES ($1, $2::uuid, $3::uuid, $4, $5, $6, $7)
                RETURNING id, batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date, created_at
                """,
                batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date,
            )
            return _row_to_dict(row)

    async def find_by_id(self, batch_id: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date, created_at FROM batches WHERE id = $1::uuid",
                batch_id,
            )
            return _row_to_dict(row) if row else None

    async def find_by_item_id(self, item_id: str) -> List[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date, created_at FROM batches WHERE item_id = $1::uuid ORDER BY receipt_date ASC",
                item_id,
            )
            return [_row_to_dict(r) for r in rows]

    async def list_all(self) -> List[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date, created_at FROM batches ORDER BY created_at DESC"
            )
            return [_row_to_dict(r) for r in rows]

    async def update_quantity(self, batch_id: str, new_quantity: float) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "UPDATE batches SET current_quantity = $1 WHERE id = $2::uuid RETURNING id, batch_number, item_id, location_id, initial_quantity, current_quantity, receipt_date, expiration_date, created_at",
                new_quantity, batch_id,
            )
            return _row_to_dict(row) if row else None

    async def get_inventory_view(self) -> List[dict]:
        """Get real-time inventory grouped by item, batch, and location."""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    i.id AS item_id,
                    i.sku AS item_sku,
                    i.name AS item_name,
                    i.type AS item_type,
                    b.id AS batch_id,
                    b.batch_number,
                    l.id AS location_id,
                    l.name AS location_name,
                    b.current_quantity,
                    b.expiration_date
                FROM batches b
                JOIN items i ON i.id = b.item_id
                JOIN locations l ON l.id = b.location_id
                WHERE b.current_quantity > 0
                ORDER BY i.name ASC, b.expiration_date ASC NULLS LAST
            """)
            return [_row_to_dict(r) for r in rows]

    async def get_inventory_summary(self) -> List[dict]:
        """Get inventory summary grouped by item."""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    i.id AS item_id,
                    i.sku AS item_sku,
                    i.name AS item_name,
                    i.type AS item_type,
                    SUM(b.current_quantity) AS total_quantity,
                    COUNT(DISTINCT b.id) AS batch_count,
                    COUNT(DISTINCT b.location_id) AS location_count
                FROM batches b
                JOIN items i ON i.id = b.item_id
                WHERE b.current_quantity > 0
                GROUP BY i.id, i.sku, i.name, i.type
                ORDER BY i.name ASC
            """)
            return [_row_to_dict(r) for r in rows]
