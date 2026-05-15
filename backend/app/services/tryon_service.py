from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tryon import TryonImage
from app.schemas.tryon import TryOnRequest, TryOnResponse


class TryOnService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def generate(self, user_id: UUID, request: TryOnRequest) -> TryOnResponse:
        count_result = await self.session.execute(
            select(func.count(TryonImage.id)).where(
                TryonImage.user_id == user_id,
                TryonImage.product_id == request.product_id,
            )
        )
        count = count_result.scalar_one()
        if count >= 4:
            raise HTTPException(
                status_code=400,
                detail="Maximum 4 try-on images per user per product reached",
            )

        image_url = f"https://tryon.example.com/generated/{user_id}/{request.pet_id}/{request.product_id}/{request.angle}.png"
        tryon = TryonImage(
            user_id=user_id,
            pet_id=request.pet_id,
            product_id=request.product_id,
            angle=request.angle or "angle45",
            image_url=image_url,
        )
        self.session.add(tryon)
        await self.session.commit()
        await self.session.refresh(tryon)
        return TryOnResponse.model_validate(tryon)

    async def generate_additional(
        self, user_id: UUID, pet_id: UUID, product_id: UUID, angles: list[str]
    ) -> list[TryOnResponse]:
        results = []
        for angle in angles:
            count_result = await self.session.execute(
                select(func.count(TryonImage.id)).where(
                    TryonImage.user_id == user_id,
                    TryonImage.product_id == product_id,
                )
            )
            count = count_result.scalar_one()
            if count >= 4:
                raise HTTPException(
                    status_code=400,
                    detail="Maximum 4 try-on images per user per product reached",
                )

            image_url = f"https://tryon.example.com/generated/{user_id}/{pet_id}/{product_id}/{angle}.png"
            tryon = TryonImage(
                user_id=user_id,
                pet_id=pet_id,
                product_id=product_id,
                angle=angle,
                image_url=image_url,
            )
            self.session.add(tryon)
            await self.session.flush()
            results.append(TryOnResponse.model_validate(tryon))
        await self.session.commit()
        return results

    async def get_history(self, user_id: UUID) -> list[TryOnResponse]:
        result = await self.session.execute(
            select(TryonImage)
            .where(TryonImage.user_id == user_id)
            .order_by(TryonImage.created_at.desc())
        )
        images = result.scalars().all()
        return [TryOnResponse.model_validate(img) for img in images]
