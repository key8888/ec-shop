from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_admin
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.category_service import CategoryService

router = APIRouter()


@router.get("/", response_model=list[CategoryResponse])
async def list_categories(session: AsyncSession = Depends(get_db)):
    service = CategoryService(session)
    return await service.list()


@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(
    data: CategoryCreate,
    session: AsyncSession = Depends(get_db),
    _current_user=Depends(require_admin),
):
    service = CategoryService(session)
    return await service.create(data)


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: UUID,
    session: AsyncSession = Depends(get_db),
    _current_user=Depends(require_admin),
):
    product_count_result = await session.execute(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    product_count = product_count_result.scalar_one()
    if product_count > 0:
        raise HTTPException(status_code=409, detail="Category has products, cannot delete")
    service = CategoryService(session)
    await service.delete(category_id)
