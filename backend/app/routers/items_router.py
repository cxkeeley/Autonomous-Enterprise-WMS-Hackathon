from fastapi import APIRouter, Depends
import asyncpg
from typing import List

from app.db.database import get_pool
from app.schemas.master_data import ItemCreate, ItemUpdate, ItemResponse
from app.services.items_service import ItemsService
from app.services.auth_utils import get_current_user_id

router = APIRouter(prefix="/api/v1/items", tags=["Items"])


@router.get("/", response_model=List[ItemResponse])
async def list_items(
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """List all items. Any authenticated user."""
    service = ItemsService(pool)
    return await service.list_all()


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get an item by ID."""
    service = ItemsService(pool)
    return await service.get(item_id)


@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(
    body: ItemCreate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Create a new item."""
    service = ItemsService(pool)
    return await service.create(body.sku, body.name, body.type, body.uom)


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: str,
    body: ItemUpdate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Update an item."""
    service = ItemsService(pool)
    return await service.update(item_id, body.sku, body.name, body.type, body.uom)


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Delete an item."""
    service = ItemsService(pool)
    await service.delete(item_id)
