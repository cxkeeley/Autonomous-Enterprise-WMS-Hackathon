from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class InwardRequest(BaseModel):
    item_id: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    location_id: str = Field(..., min_length=1)
    supplier_entity_id: str = Field(..., min_length=1)
    receipt_date: datetime
    expiration_date: Optional[datetime] = None
    reference: Optional[str] = None
    receipt_url: Optional[str] = None


class BatchResponse(BaseModel):
    id: str
    batch_number: str
    item_id: str
    location_id: str
    initial_quantity: float
    current_quantity: float
    receipt_date: datetime
    expiration_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InwardResponse(BaseModel):
    batch: BatchResponse
    message: str = "Goods received successfully"


class InventoryItem(BaseModel):
    item_id: str
    item_sku: str
    item_name: str
    item_type: str
    batch_id: str
    batch_number: str
    location_id: str
    location_name: str
    current_quantity: float
    expiration_date: Optional[datetime] = None


class InventorySummary(BaseModel):
    item_id: str
    item_sku: str
    item_name: str
    item_type: str
    total_quantity: float
    batch_count: int
    location_count: int
