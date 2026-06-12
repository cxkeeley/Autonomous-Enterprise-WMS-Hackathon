from fastapi import APIRouter, Depends, Query
import asyncpg
from typing import List

from app.db.database import get_pool
from app.schemas.inventory import (
    InwardRequest,
    InwardResponse,
    InventoryItem,
    InventorySummary,
    FifoSuggestionItem,
    OutwardRequest,
    OutwardResponse,
)
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


@router.get("/fifo-suggestion", response_model=List[FifoSuggestionItem])
async def fifo_suggestion(
    item_id: str = Query(..., min_length=1),
    quantity: float = Query(..., gt=0),
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get FIFO/FEFO picking suggestion for a given item and quantity."""
    service = InventoryService(pool)
    return await service.get_fifo_suggestion(item_id=item_id, quantity=quantity)


@router.post("/outward", response_model=OutwardResponse, status_code=201)
async def outward(
    body: OutwardRequest,
    user_id: str = Depends(get_current_user_id),
    pool: asyncpg.Pool = Depends(get_pool),
):
    """Dispatch goods to a customer using FIFO/FEFO. Atomically deducts from batches and creates ledger entries."""
    service = InventoryService(pool)
    return await service.outward(
        item_id=body.item_id,
        quantity=body.quantity,
        customer_entity_id=body.customer_entity_id,
        user_id=user_id,
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
