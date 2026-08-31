import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db
from app.models.category import Category
from app.models.favorite import Favorite
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User
from app.schemas.provider import ProviderListOut, ServiceOut

router = APIRouter(prefix="/api/search", tags=["search"])


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    if None in (lat1, lon1, lat2, lon2):
        return 9999.0
    r = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


def match_score(provider: Provider, distance_km: float, starting_price: float | None) -> float:
    """Transparent heuristic used to power 'Best Match' / 'AI Ranking'.

    Not a trained ML model -- combines rating, response time, distance and
    price into a single 0-100 score. Swap for a real ranking model later.
    """
    rating_score = (provider.avg_rating / 5) * 40
    distance_score = max(0, 25 - min(distance_km, 25)) * (25 / 25) if distance_km < 9999 else 10
    response_score = max(0, 20 - (provider.response_time_minutes / 60) * 5)
    price_score = 15 if starting_price is None else max(0, 15 - starting_price / 50)
    verified_bonus = 5 if provider.is_verified else 0
    return round(rating_score + distance_score + response_score + price_score + verified_bonus, 1)


@router.get("/providers", response_model=list[ProviderListOut])
def search_providers(
    q: str | None = None,
    category_slug: str | None = None,
    group: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_rating: float | None = None,
    verified: bool | None = None,
    licensed: bool | None = None,
    insured: bool | None = None,
    background_checked: bool | None = None,
    emergency: bool | None = None,
    instant_booking: bool | None = None,
    free_estimate: bool | None = None,
    sort: str = Query("best_match", pattern="^(best_match|cheapest|closest|highest_rated|fastest)$"),
    limit: int = 30,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(Provider).options(joinedload(Provider.services).joinedload(Service.category))
    query = query.filter(Provider.is_available.is_(True))

    if licensed:
        query = query.filter(Provider.is_licensed.is_(True))
    if insured:
        query = query.filter(Provider.is_insured.is_(True))
    if background_checked:
        query = query.filter(Provider.is_background_checked.is_(True))
    if verified:
        query = query.filter(
            Provider.is_licensed.is_(True),
            Provider.is_insured.is_(True),
            Provider.is_background_checked.is_(True),
        )
    if min_rating:
        query = query.filter(Provider.avg_rating >= min_rating)

    if q:
        query = query.filter(Provider.business_name.ilike(f"%{q}%"))

    if category_slug:
        query = query.join(Provider.services).join(Service.category).filter(Category.slug == category_slug)
    elif group:
        query = query.join(Provider.services).join(Service.category).filter(Category.group == group)

    if emergency:
        query = query.join(Provider.services).filter(Service.is_emergency.is_(True))
    if instant_booking:
        query = query.join(Provider.services).filter(Service.is_instant_booking.is_(True))
    if free_estimate:
        query = query.join(Provider.services).filter(Service.offers_free_estimate.is_(True))

    providers = query.distinct().all()

    results = []
    for p in providers:
        prices = [s.price_min for s in p.services if s.price_min is not None]
        starting_price = min(prices) if prices else None
        if min_price is not None and (starting_price is None or starting_price < min_price):
            continue
        if max_price is not None and (starting_price is None or starting_price > max_price):
            continue

        distance = haversine_km(lat, lng, p.latitude, p.longitude) if lat and lng else None
        score = match_score(p, distance if distance is not None else 9999, starting_price)

        item = ProviderListOut.model_validate(p)
        item.services = [ServiceOut.model_validate(s) for s in p.services]
        item.distance_km = round(distance, 1) if distance is not None else None
        item.starting_price = starting_price
        item.match_score = score
        results.append(item)

    sort_key = {
        "best_match": lambda x: -x.match_score,
        "cheapest": lambda x: (x.starting_price if x.starting_price is not None else float("inf")),
        "closest": lambda x: (x.distance_km if x.distance_km is not None else float("inf")),
        "highest_rated": lambda x: -x.avg_rating,
        "fastest": lambda x: x.response_time_minutes,
    }[sort]
    results.sort(key=sort_key)

    return results[offset : offset + limit]
