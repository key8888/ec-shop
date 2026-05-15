from pydantic import BaseModel, field_validator


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20

    @field_validator("page")
    @classmethod
    def page_ge_1(cls, v: int) -> int:
        if v < 1:
            raise ValueError("page must be >= 1")
        return v

    @field_validator("per_page")
    @classmethod
    def per_page_range(cls, v: int) -> int:
        if v < 1:
            raise ValueError("per_page must be >= 1")
        if v > 100:
            raise ValueError("per_page must be <= 100")
        return v
