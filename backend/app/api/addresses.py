from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services.address_service import AddressService

router = APIRouter()


@router.get("/", response_model=list[AddressResponse])
async def list_addresses(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AddressService(session)
    return await service.list(current_user.id)


@router.post("/", response_model=AddressResponse, status_code=201)
async def create_address(
    data: AddressCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AddressService(session)
    return await service.create(current_user.id, data)


@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: UUID,
    data: AddressUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AddressService(session)
    return await service.update(address_id, current_user.id, data)


@router.delete("/{address_id}", status_code=204)
async def delete_address(
    address_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AddressService(session)
    await service.delete(address_id, current_user.id)


@router.put("/{address_id}/default", response_model=AddressResponse)
async def set_default_address(
    address_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AddressService(session)
    return await service.set_default(address_id, current_user.id)
