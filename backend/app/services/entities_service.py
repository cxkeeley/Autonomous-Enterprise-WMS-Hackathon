from fastapi import HTTPException, status
import asyncpg

from app.repositories.entities_repository import EntitiesRepository


class EntitiesService:
    def __init__(self, pool: asyncpg.Pool):
        self.repo = EntitiesRepository(pool)

    async def create(self, name: str, type_: str) -> dict:
        return await self.repo.create(name, type_)

    async def get(self, entity_id: str) -> dict:
        entity = await self.repo.find_by_id(entity_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")
        return entity

    async def list_all(self, type_: str = None) -> list:
        return await self.repo.list_all(type_)

    async def update(self, entity_id: str, name: str = None,
                     type_: str = None) -> dict:
        entity = await self.repo.update(entity_id, name, type_)
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")
        return entity

    async def delete(self, entity_id: str) -> None:
        deleted = await self.repo.delete(entity_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Entity not found")
