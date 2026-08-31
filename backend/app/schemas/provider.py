from datetime import datetime

from pydantic import BaseModel

from app.schemas.category import CategoryOut


class ServiceIn(BaseModel):
    category_id: int
    title: str
    description: str | None = None
    price_type: str = "fixed"
    price_min: float = 0.0
    price_max: float | None = None
    is_instant_booking: bool = True
    offers_free_estimate: bool = False
    is_emergency: bool = False


class ServiceOut(ServiceIn):
    id: str
    provider_id: str
    category: CategoryOut
    created_at: datetime

    model_config = {"from_attributes": True}


class ProviderCreate(BaseModel):
    business_name: str
    tagline: str | None = None
    about: str | None = None
    years_experience: int = 0
    city: str | None = None
    state: str = "CA"


class ProviderUpdate(BaseModel):
    business_name: str | None = None
    tagline: str | None = None
    about: str | None = None
    cover_photo_url: str | None = None
    years_experience: int | None = None
    is_licensed: bool | None = None
    license_number: str | None = None
    is_insured: bool | None = None
    is_background_checked: bool | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    service_radius_km: float | None = None
    is_available: bool | None = None
    website: str | None = None


class ProviderOut(BaseModel):
    id: str
    user_id: str
    business_name: str
    tagline: str | None
    about: str | None
    cover_photo_url: str | None
    years_experience: int
    is_licensed: bool
    license_number: str | None
    is_insured: bool
    is_background_checked: bool
    is_verified: bool
    kyc_status: str
    city: str | None
    state: str
    latitude: float | None
    longitude: float | None
    service_radius_km: float
    response_time_minutes: int
    avg_rating: float
    review_count: int
    is_available: bool
    subscription_plan: str
    website: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProviderListOut(ProviderOut):
    distance_km: float | None = None
    starting_price: float | None = None
    match_score: float | None = None
    is_favorite: bool = False
    services: list[ServiceOut] = []


class ProviderDetailOut(ProviderOut):
    services: list[ServiceOut] = []
    is_favorite: bool = False
