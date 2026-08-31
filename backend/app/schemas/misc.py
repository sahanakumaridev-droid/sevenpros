from datetime import datetime

from pydantic import BaseModel


class MessageIn(BaseModel):
    booking_id: str
    content: str


class MessageOut(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    content: str
    is_ai_reply: bool
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentIn(BaseModel):
    booking_id: str
    amount: float
    tip: float = 0.0
    coupon_code: str | None = None
    method: str = "mock_card"


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    amount: float
    tip: float
    coupon_code: str | None
    method: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
