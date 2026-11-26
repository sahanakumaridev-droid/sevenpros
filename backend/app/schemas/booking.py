from datetime import datetime

from pydantic import BaseModel

from app.schemas.provider import ProviderOut, ServiceOut


class BookingCreate(BaseModel):
    provider_id: str
    service_id: str
    scheduled_date: str
    scheduled_time: str
    address_line: str
    notes: str | None = None
    image_urls: list[str] = []
    is_emergency: bool = False


class BookingStatusUpdate(BaseModel):
    status: str


class CustomerBrief(BaseModel):
    id: str
    full_name: str
    avatar_url: str | None
    model_config = {"from_attributes": True}


class BookingOut(BaseModel):
    id: str
    customer_id: str
    provider_id: str
    service_id: str
    status: str
    scheduled_date: str
    scheduled_time: str
    is_emergency: bool
    address_line: str
    notes: str | None
    quoted_price: float | None
    final_price: float | None
    payment_status: str
    created_at: datetime
    updated_at: datetime
    service: ServiceOut
    provider: ProviderOut
    customer: CustomerBrief
    job_id: str | None = None

    model_config = {"from_attributes": True}
