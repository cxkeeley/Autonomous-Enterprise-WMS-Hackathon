from fastapi import HTTPException, status
import asyncpg

from app.repositories.locations_repository import LocationsRepository


class LocationsService:
    def __init__(self, pool: asyncpg.Pool):
        self.repo = LocationsRepository(pool)

    async def create(self, name: str, description: str = None) -> dict:
        existing = await self.repo.find_by_name(name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Location '{name}' already exists",
            )
        return await self.repo.create(name, description)

    async def get(self, location_id: str) -> dict:
        loc = await self.repo.find_by_id(location_id)
        if not loc:
            raise HTTPException(status_code=404, detail="Location not found")
        return loc

    async def list_all(self) -> list:
        return await self.repo.list_all()

    async def update(self, location_id: str, name: str = None,
                     description: str = None) -> dict:
        loc = await self.repo.update(location_id, name, description)
        if not loc:
            raise HTTPException(status_code=404, detail="Location not found")
        return loc

    async def delete(self, location_id: str) -> None:
        deleted = await self.repo.delete(location_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Location not found")
