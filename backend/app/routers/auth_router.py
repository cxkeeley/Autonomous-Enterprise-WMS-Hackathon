from fastapi import APIRouter, Depends
import asyncpg

from app.db.database import get_pool
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Authenticate a user and return a JWT token."""
    service = AuthService(pool)
    return await service.login(body.username, body.password)
