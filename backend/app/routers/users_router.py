from fastapi import APIRouter, Depends
import asyncpg
from typing import List

from app.db.database import get_pool
from app.schemas.auth import UserCreate, UserUpdate, UserResponse
from app.services.auth_service import AuthService
from app.services.auth_utils import get_current_user_id, require_role

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
async def list_users(
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(require_role("ADMIN")),
):
    """List all users. Admin only."""
    service = AuthService(pool)
    return await service.list_users()


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Get the currently authenticated user's profile."""
    service = AuthService(pool)
    return await service.get_user(user_id)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(require_role("ADMIN")),
):
    """Get a user by ID. Admin only."""
    service = AuthService(pool)
    return await service.get_user(user_id)


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    body: UserCreate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(require_role("ADMIN")),
):
    """Create a new user. Admin only."""
    service = AuthService(pool)
    return await service.create_user(body.username, body.password, body.role)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    body: UserUpdate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(require_role("ADMIN")),
):
    """Update a user. Admin only."""
    service = AuthService(pool)
    return await service.update_user(
        user_id, username=body.username, password=body.password, role=body.role
    )


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(require_role("ADMIN")),
):
    """Delete a user. Admin only."""
    service = AuthService(pool)
    await service.delete_user(user_id)
