from fastapi import APIRouter, Depends, Query
import asyncpg
from typing import List, Optional

from app.db.database import get_pool
from app.schemas.master_data import EntityCreate, EntityUpdate, EntityResponse
from app.services.entities_service import EntitiesService
from app.services.auth_utils import get_current_user_id

router = APIRouter(prefix="/api/v1/entities", tags=["Entities"])


@router.get("/", response_model=List[EntityResponse])
async def list_entities(
    type: Optional[str] = Query(None, pattern=r"^(SUPPLIER|CUSTOMER)$"),
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """List entities, optionally filtered by type (SUPPLIER or CUSTOMER)."""
    service = EntitiesService(pool)
    return await service.list_all(type)


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(
    entity_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get an entity by ID."""
    service = EntitiesService(pool)
    return await service.get(entity_id)


@router.post("/", response_model=EntityResponse, status_code=201)
async def create_entity(
    body: EntityCreate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Create a new entity (Supplier or Customer)."""
    service = EntitiesService(pool)
    return await service.create(body.name, body.type)


@router.put("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: str,
    body: EntityUpdate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Update an entity."""
    service = EntitiesService(pool)
    return await service.update(entity_id, body.name, body.type)


@router.delete("/{entity_id}", status_code=204)
async def delete_entity(
    entity_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Delete an entity."""
    service = EntitiesService(pool)
    await service.delete(entity_id)
