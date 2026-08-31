from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.booking import CustomerBrief


class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    photo_urls: list[str] = []


class ReviewReply(BaseModel):
    reply: str


class ReviewOut(BaseModel):
    id: str
    booking_id: str
    provider_id: str
    rating: int
    comment: str | None
    provider_reply: str | None
    created_at: datetime
    customer: CustomerBrief

    model_config = {"from_attributes": True}
