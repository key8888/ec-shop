import os
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.pet import PetCreate, PetResponse, PetImageUploadResponse
from app.services.pet_service import PetService
from app.utils.file_upload import validate_image

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "pets")


@router.get("/", response_model=list[PetResponse])
async def get_pets(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PetService(session)
    return await service.get_pets(current_user.id)


@router.post("/", response_model=PetResponse, status_code=201)
async def create_pet(
    data: PetCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PetService(session)
    return await service.create_pet(current_user.id, data)


@router.put("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: UUID,
    data: PetCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PetService(session)
    return await service.update_pet(pet_id, current_user.id, data)


@router.delete("/{pet_id}", status_code=204)
async def delete_pet(
    pet_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PetService(session)
    await service.delete_pet(pet_id, current_user.id)


@router.post("/{pet_id}/images", response_model=PetImageUploadResponse)
async def upload_pet_image(
    pet_id: UUID,
    image: UploadFile = File(...),
    angle: str = Form(...),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if angle not in ("front", "side", "angle45"):
        raise HTTPException(status_code=400, detail=f"Invalid angle: {angle}. Must be front, side, or angle45")

    contents = await image.read()
    if not validate_image(len(contents), image.filename or "unknown"):
        raise HTTPException(status_code=400, detail="Invalid image file")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = (image.filename or "image.png").rsplit(".", 1)[-1].lower()
    filename = f"{uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/pets/{filename}"

    service = PetService(session)
    return await service.upload_pet_image(pet_id, current_user.id, angle, image_url)
