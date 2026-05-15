from fastapi import APIRouter, HTTPException, Query

from app.schemas.address import PostalCodeLookupResponse
from app.utils.postal_code import lookup_postal_code

router = APIRouter()


@router.get("/lookup", response_model=PostalCodeLookupResponse)
async def lookup(code: str = Query(..., min_length=7)):
    result = await lookup_postal_code(code)
    if not result:
        raise HTTPException(status_code=404, detail="Postal code not found")
    return PostalCodeLookupResponse(**result)
