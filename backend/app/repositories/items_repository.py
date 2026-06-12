from typing import Optional, List
import asyncpg
from uuid import UUID


def _row_to_dict(row) -> dict:
    """Convert an asyncpg Record to a dict, casting UUIDs to strings."""
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, UUID):
            d[k] = str(v)
    return d


class ItemsRepository:
    """Repository for items table using raw SQL via asyncpg."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create(self, sku: str, name: str, type_: str, uom: str) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO items (sku, name, type, uom)
                VALUES ($1, $2, $3::item_type_enum, $4)
                RETURNING id, sku, name, type, uom, created_at
                """,
                sku, name, type_, uom,
            )
            return _row_to_dict(row)

    async def find_by_id(self, item_id: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, sku, name, type, uom, created_at FROM items WHERE id = $1::uuid",
                item_id,
            )
            return _row_to_dict(row) if row else None

    async def find_by_sku(self, sku: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, sku, name, type, uom, created_at FROM items WHERE sku = $1",
                sku,
            )
            return _row_to_dict(row) if row else None

    async def list_all(self) -> List[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, sku, name, type, uom, created_at FROM items ORDER BY name ASC"
            )
            return [_row_to_dict(r) for r in rows]

    async def update(self, item_id: str, sku: str = None, name: str = None,
                     type_: str = None, uom: str = None) -> Optional[dict]:
        sets = []
        values = []
        idx = 1
        if sku is not None:
            sets.append(f"sku = ${idx}"); values.append(sku); idx += 1
        if name is not None:
            sets.append(f"name = ${idx}"); values.append(name); idx += 1
        if type_ is not None:
            sets.append(f"type = ${idx}::item_type_enum"); values.append(type_); idx += 1
        if uom is not None:
            sets.append(f"uom = ${idx}"); values.append(uom); idx += 1
        if not sets:
            return await self.find_by_id(item_id)
        values.append(item_id)
        query = f"""
            UPDATE items SET {', '.join(sets)}
            WHERE id = ${idx}::uuid
            RETURNING id, sku, name, type, uom, created_at
        """
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *values)
            return _row_to_dict(row) if row else None

    async def delete(self, item_id: str) -> bool:
        async with self.pool.acquire() as conn:
            result = await conn.execute("DELETE FROM items WHERE id = $1::uuid", item_id)
            return result != "DELETE 0"
