from fastapi import APIRouter, Depends, Query
import asyncpg
from typing import List

from app.db.database import get_pool
from app.schemas.inventory import InwardRequest, InwardResponse, InventoryItem, InventorySummary
from app.services.inventory_service import InventoryService
from app.services.auth_utils import get_current_user_id

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])


@router.post("/inward", response_model=InwardResponse, status_code=201)
async def inward(
    body: InwardRequest,
    user_id: str = Depends(get_current_user_id),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Receive new goods into the warehouse. Creates a batch and ledger entry atomically."""
    service = InventoryService(pool)
    return await service.inward(
        item_id=body.item_id,
        quantity=body.quantity,
        location_id=body.location_id,
        supplier_entity_id=body.supplier_entity_id,
        user_id=user_id,
        receipt_date=body.receipt_date,
        expiration_date=body.expiration_date,
        reference=body.reference,
        receipt_url=body.receipt_url,
    )


@router.get("/", response_model=List[InventoryItem])
async def get_inventory(
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get real-time inventory view with all active batches."""
    service = InventoryService(pool)
    return await service.get_inventory()


@router.get("/summary", response_model=List[InventorySummary])
async def get_inventory_summary(
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get inventory summary grouped by item."""
    service = InventoryService(pool)
    return await service.get_inventory_summary()


@router.get("/transactions")
async def get_transactions(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get the transaction ledger."""
    service = InventoryService(pool)
    return await service.get_transactions(limit, offset)
