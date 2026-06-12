from fastapi import HTTPException, status
import asyncpg

from app.repositories.items_repository import ItemsRepository


class ItemsService:
    def __init__(self, pool: asyncpg.Pool):
        self.repo = ItemsRepository(pool)

    async def create(self, sku: str, name: str, type_: str, uom: str) -> dict:
        existing = await self.repo.find_by_sku(sku)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Item with SKU '{sku}' already exists",
            )
        return await self.repo.create(sku, name, type_, uom)

    async def get(self, item_id: str) -> dict:
        item = await self.repo.find_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    async def list_all(self) -> list:
        return await self.repo.list_all()

    async def update(self, item_id: str, sku: str = None, name: str = None,
                     type_: str = None, uom: str = None) -> dict:
        item = await self.repo.update(item_id, sku, name, type_, uom)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    async def delete(self, item_id: str) -> None:
        deleted = await self.repo.delete(item_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Item not found")
