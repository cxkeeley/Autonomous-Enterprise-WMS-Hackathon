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


class UsersRepository:
    """Repository for users table operations using raw SQL via asyncpg."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create(self, username: str, password_hash: str, role: str) -> dict:
        """Insert a new user and return the created record."""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO users (username, password_hash, role)
                VALUES ($1, $2, $3::user_role_enum)
                RETURNING id, username, role, created_at
                """,
                username,
                password_hash,
                role,
            )
            return _row_to_dict(row)

    async def find_by_username(self, username: str) -> Optional[dict]:
        """Find a user by username. Returns None if not found."""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1",
                username,
            )
            return _row_to_dict(row) if row else None

    async def find_by_id(self, user_id: str) -> Optional[dict]:
        """Find a user by UUID. Returns None if not found."""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, username, role, created_at FROM users WHERE id = $1::uuid",
                user_id,
            )
            return _row_to_dict(row) if row else None

    async def list_all(self) -> List[dict]:
        """Return all users (without password hashes)."""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
            )
            return [_row_to_dict(r) for r in rows]

    async def update(
        self, user_id: str, username: Optional[str] = None,
        password_hash: Optional[str] = None, role: Optional[str] = None,
    ) -> Optional[dict]:
        """Update a user's fields. Only non-None fields are updated."""
        sets = []
        values = []
        idx = 1

        if username is not None:
            sets.append(f"username = ${idx}")
            values.append(username)
            idx += 1
        if password_hash is not None:
            sets.append(f"password_hash = ${idx}")
            values.append(password_hash)
            idx += 1
        if role is not None:
            sets.append(f"role = ${idx}::user_role_enum")
            values.append(role)
            idx += 1

        if not sets:
            return await self.find_by_id(user_id)

        values.append(user_id)
        query = f"""
            UPDATE users SET {', '.join(sets)}
            WHERE id = ${idx}::uuid
            RETURNING id, username, role, created_at
        """
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, *values)
            return _row_to_dict(row) if row else None

    async def delete(self, user_id: str) -> bool:
        """Delete a user by UUID. Returns True if deleted."""
        async with self.pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM users WHERE id = $1::uuid", user_id
            )
            return result != "DELETE 0"
