from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetResponse, PetImageUploadResponse


class PetService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_pet(self, user_id: UUID, data: PetCreate) -> PetResponse:
        pet = Pet(user_id=user_id, **data.model_dump())
        self.session.add(pet)
        await self.session.commit()
        await self.session.refresh(pet)
        return PetResponse.model_validate(pet)

    async def get_pets(self, user_id: UUID) -> list[PetResponse]:
        result = await self.session.execute(
            select(Pet).where(Pet.user_id == user_id)
        )
        pets = result.scalars().all()
        return [PetResponse.model_validate(p) for p in pets]

    async def update_pet(self, pet_id: UUID, user_id: UUID, data: PetCreate) -> PetResponse:
        result = await self.session.execute(
            select(Pet).where(Pet.id == pet_id, Pet.user_id == user_id)
        )
        pet = result.scalar_one_or_none()
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(pet, key, value)
        await self.session.commit()
        await self.session.refresh(pet)
        return PetResponse.model_validate(pet)

    async def delete_pet(self, pet_id: UUID, user_id: UUID) -> None:
        result = await self.session.execute(
            select(Pet).where(Pet.id == pet_id, Pet.user_id == user_id)
        )
        pet = result.scalar_one_or_none()
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        await self.session.delete(pet)
        await self.session.commit()

    async def upload_pet_image(
        self, pet_id: UUID, user_id: UUID, angle: str, image_url: str
    ) -> PetImageUploadResponse:
        result = await self.session.execute(
            select(Pet).where(Pet.id == pet_id, Pet.user_id == user_id)
        )
        pet = result.scalar_one_or_none()
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")

        angle_field_map = {
            "front": "front_image_url",
            "side": "side_image_url",
            "angle45": "angle45_image_url",
        }
        field = angle_field_map.get(angle)
        if not field:
            raise HTTPException(status_code=400, detail=f"Invalid angle: {angle}")
        setattr(pet, field, image_url)
        await self.session.commit()
        return PetImageUploadResponse(image_url=image_url)
