from typing import Optional, List
import asyncpg
from uuid import UUID


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, UUID):
            d[k] = str(v)
    return d


class EntitiesRepository:
    """Repository for entities table using raw SQL via asyncpg."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create(self, name: str, type_: str) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO entities (name, type)
                VALUES ($1, $2::entity_type_enum)
                RETURNING id, name, type
                """,
                name, type_,
            )
            return _row_to_dict(row)

    async def find_by_id(self, entity_id: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, name, type FROM entities WHERE id = $1::uuid",
                entity_id,
            )
            return _row_to_dict(row) if row else None

    async def list_all(self, type_: str = None) -> List[dict]:
        async with self.pool.acquire() as conn:
            if type_:
                rows = await conn.fetch(
                    "SELECT id, name, type FROM entities WHERE type = $1::entity_type_enum ORDER BY name ASC",
                    type_,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, name, type FROM entities ORDER BY type, name ASC"
                )
            return [_row_to_dict(r) for r in rows]

    async def update(self, entity_id: str, name: str = None,
                     type_: str = None) -> Optional[dict]:
        sets = []
        values = []
        idx = 1
        if name is not None:
            sets.append(f"name = ${idx}"); values.append(name); idx += 1
        if type_ is not None:
            sets.append(f"type = ${idx}::entity_type_enum"); values.append(type_); idx += 1
        if not sets:
            return await self.find_by_id(entity_id)
        values.append(entity_id)
        query = f"""
            UPDATE entities SET {', '.join(sets)}
            WHERE id = ${idx}::uuid
            RETURNING id, name, type
        """
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *values)
            return _row_to_dict(row) if row else None

    async def delete(self, entity_id: str) -> bool:
        async with self.pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM entities WHERE id = $1::uuid", entity_id
            )
            return result != "DELETE 0"
