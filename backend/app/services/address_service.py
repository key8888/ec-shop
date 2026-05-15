from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse


class AddressService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_id: UUID, data: AddressCreate) -> AddressResponse:
        count_result = await self.session.execute(
            select(func.count(Address.id)).where(Address.user_id == user_id)
        )
        count = count_result.scalar_one()
        if count >= 10:
            raise HTTPException(status_code=400, detail="Maximum 10 addresses allowed")

        if data.is_default:
            await self._unset_defaults(user_id)

        address = Address(user_id=user_id, **data.model_dump())
        self.session.add(address)
        await self.session.commit()
        await self.session.refresh(address)
        return AddressResponse.model_validate(address)

    async def list(self, user_id: UUID) -> list[AddressResponse]:
        result = await self.session.execute(
            select(Address).where(Address.user_id == user_id)
        )
        addresses = result.scalars().all()
        return [AddressResponse.model_validate(a) for a in addresses]

    async def update(
        self, address_id: UUID, user_id: UUID, data: AddressUpdate
    ) -> AddressResponse:
        result = await self.session.execute(
            select(Address).where(Address.id == address_id, Address.user_id == user_id)
        )
        address = result.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")

        if data.is_default:
            await self._unset_defaults(user_id)

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(address, key, value)
        await self.session.commit()
        await self.session.refresh(address)
        return AddressResponse.model_validate(address)

    async def delete(self, address_id: UUID, user_id: UUID) -> None:
        result = await self.session.execute(
            select(Address).where(Address.id == address_id, Address.user_id == user_id)
        )
        address = result.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
        await self.session.delete(address)
        await self.session.commit()

    async def set_default(self, address_id: UUID, user_id: UUID) -> AddressResponse:
        result = await self.session.execute(
            select(Address).where(Address.id == address_id, Address.user_id == user_id)
        )
        address = result.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")

        await self._unset_defaults(user_id)
        address.is_default = True
        await self.session.commit()
        await self.session.refresh(address)
        return AddressResponse.model_validate(address)

    async def _unset_defaults(self, user_id: UUID) -> None:
        result = await self.session.execute(
            select(Address).where(
                Address.user_id == user_id, Address.is_default == True
            )
        )
        for addr in result.scalars().all():
            addr.is_default = False
        await self.session.flush()
