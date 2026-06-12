from fastapi import HTTPException, status
import asyncpg

from app.repositories.users_repository import UsersRepository
from app.services.auth_utils import hash_password, verify_password, create_access_token


class AuthService:
    """Service layer for authentication and user management business logic."""

    def __init__(self, pool: asyncpg.Pool):
        self.repo = UsersRepository(pool)

    async def login(self, username: str, password: str) -> dict:
        """Authenticate a user and return a JWT token."""
        user = await self.repo.find_by_username(username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        if not verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        token = create_access_token(str(user["id"]), user["role"])
        return {"access_token": token, "token_type": "bearer"}

    async def create_user(self, username: str, password: str, role: str) -> dict:
        """Create a new user. Raises 409 if username already exists."""
        existing = await self.repo.find_by_username(username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{username}' already exists",
            )

        pwd_hash = hash_password(password)
        user = await self.repo.create(username, pwd_hash, role)
        return user

    async def get_user(self, user_id: str) -> dict:
        """Get a user by ID. Raises 404 if not found."""
        user = await self.repo.find_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def list_users(self) -> list:
        """List all users."""
        return await self.repo.list_all()

    async def update_user(
        self, user_id: str, username: str = None,
        password: str = None, role: str = None,
    ) -> dict:
        """Update a user. Raises 404 if not found."""
        pwd_hash = hash_password(password) if password else None
        user = await self.repo.update(user_id, username, pwd_hash, role)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def delete_user(self, user_id: str) -> None:
        """Delete a user. Raises 404 if not found."""
        deleted = await self.repo.delete(user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
