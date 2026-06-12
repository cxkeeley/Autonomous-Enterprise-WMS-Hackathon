from fastapi import APIRouter, Depends
import asyncpg
from typing import List

from app.db.database import get_pool
from app.schemas.master_data import LocationCreate, LocationUpdate, LocationResponse
from app.services.locations_service import LocationsService
from app.services.auth_utils import get_current_user_id

router = APIRouter(prefix="/api/v1/locations", tags=["Locations"])


@router.get("/", response_model=List[LocationResponse])
async def list_locations(
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """List all locations. Any authenticated user."""
    service = LocationsService(pool)
    return await service.list_all()


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Get a location by ID."""
    service = LocationsService(pool)
    return await service.get(location_id)


@router.post("/", response_model=LocationResponse, status_code=201)
async def create_location(
    body: LocationCreate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Create a new location."""
    service = LocationsService(pool)
    return await service.create(body.name, body.description)


@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    body: LocationUpdate,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Update a location."""
    service = LocationsService(pool)
    return await service.update(location_id, body.name, body.description)


@router.delete("/{location_id}", status_code=204)
async def delete_location(
    location_id: str,
    pool: asyncpg.Pool = Depends(get_pool),
    _: str = Depends(get_current_user_id),
):
    """Delete a location."""
    service = LocationsService(pool)
    await service.delete(location_id)
