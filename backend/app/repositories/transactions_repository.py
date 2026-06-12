from typing import Optional, List
import asyncpg
from uuid import UUID


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, UUID):
            d[k] = str(v)
    return d


class TransactionsRepository:
    """Repository for inventory_transactions table using raw SQL via asyncpg."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create(
        self,
        batch_id: str,
        user_id: str,
        transaction_type: str,
        quantity: float,
        entity_id: str = None,
        reference_id: str = None,
        receipt_url: str = None,
    ) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO inventory_transactions (batch_id, user_id, entity_id, transaction_type, quantity, reference_id, receipt_url)
                VALUES ($1::uuid, $2::uuid, $3::uuid, $4::transaction_type_enum, $5, $6, $7)
                RETURNING id, batch_id, user_id, entity_id, transaction_type, quantity, reference_id, receipt_url, created_at
                """,
                batch_id, user_id, entity_id, transaction_type, quantity, reference_id, receipt_url,
            )
            return _row_to_dict(row)

    async def list_all(self, limit: int = 100, offset: int = 0) -> List[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    t.id, t.batch_id, t.user_id, t.entity_id,
                    t.transaction_type, t.quantity, t.reference_id, t.receipt_url, t.created_at,
                    u.username AS performed_by,
                    b.batch_number,
                    i.sku AS item_sku, i.name AS item_name
                FROM inventory_transactions t
                LEFT JOIN users u ON u.id = t.user_id
                LEFT JOIN batches b ON b.id = t.batch_id
                LEFT JOIN items i ON i.id = b.item_id
                ORDER BY t.created_at DESC
                LIMIT $1 OFFSET $2
            """, limit, offset)
            return [_row_to_dict(r) for r in rows]
