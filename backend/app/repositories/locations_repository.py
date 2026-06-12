from typing import Optional, List
import asyncpg
from uuid import UUID


def _row_to_dict(row) -> dict:
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, UUID):
            d[k] = str(v)
    return d


class LocationsRepository:
    """Repository for locations table using raw SQL via asyncpg."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create(self, name: str, description: str = None) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO locations (name, description)
                VALUES ($1, $2)
                RETURNING id, name, description
                """,
                name, description,
            )
            return _row_to_dict(row)

    async def find_by_id(self, location_id: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, name, description FROM locations WHERE id = $1::uuid",
                location_id,
            )
            return _row_to_dict(row) if row else None

    async def find_by_name(self, name: str) -> Optional[dict]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, name, description FROM locations WHERE name = $1",
                name,
            )
            return _row_to_dict(row) if row else None

    async def list_all(self) -> List[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, name, description FROM locations ORDER BY name ASC"
            )
            return [_row_to_dict(r) for r in rows]

    async def update(self, location_id: str, name: str = None,
                     description: str = None) -> Optional[dict]:
        sets = []
        values = []
        idx = 1
        if name is not None:
            sets.append(f"name = ${idx}"); values.append(name); idx += 1
        if description is not None:
            sets.append(f"description = ${idx}"); values.append(description); idx += 1
        if not sets:
            return await self.find_by_id(location_id)
        values.append(location_id)
        query = f"""
            UPDATE locations SET {', '.join(sets)}
            WHERE id = ${idx}::uuid
            RETURNING id, name, description
        """
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *values)
            return _row_to_dict(row) if row else None

    async def delete(self, location_id: str) -> bool:
        async with self.pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM locations WHERE id = $1::uuid", location_id
            )
            return result != "DELETE 0"
