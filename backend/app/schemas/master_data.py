from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────────
# Items
# ──────────────────────────────────────────────

class ItemCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern=r"^(RAW_MATERIAL|WIP|FINISHED_GOOD)$")
    uom: str = Field(..., min_length=1, max_length=20)


class ItemUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, pattern=r"^(RAW_MATERIAL|WIP|FINISHED_GOOD)$")
    uom: Optional[str] = Field(None, min_length=1, max_length=20)


class ItemResponse(BaseModel):
    id: str
    sku: str
    name: str
    type: str
    uom: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Locations
# ──────────────────────────────────────────────

class LocationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class LocationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class LocationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Entities (Suppliers / Customers)
# ──────────────────────────────────────────────

class EntityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern=r"^(SUPPLIER|CUSTOMER)$")


class EntityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, pattern=r"^(SUPPLIER|CUSTOMER)$")


class EntityResponse(BaseModel):
    id: str
    name: str
    type: str

    model_config = {"from_attributes": True}
