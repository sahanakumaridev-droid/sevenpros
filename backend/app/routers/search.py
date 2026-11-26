import json
import math
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path

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


_DATA = Path(__file__).resolve().parents[2] / "data" / "public_listings.json"

# Search words on the page map onto the free OpenStreetMap craft/shop tags.
_CRAFT_HINTS = {
    "plumb": {"plumber"},
    "electric": {"electrician", "electrical"},
    "hvac": {"hvac", "heating_engineer"},
    "heat": {"hvac", "heating_engineer"},
    "air": {"hvac"},
    "clean": {"cleaning"},
    "paint": {"painter", "paint"},
    "handyman": {"handyman", "builder", "carpenter"},
    "furniture": {"upholsterer"},
    "lock": {"locksmith"},
    "roof": {"roofer"},
    "garden": {"gardener", "garden_centre"},
    "landscape": {"gardener", "garden_centre"},
    "floor": {"floorer", "flooring"},
    "tile": {"tiler", "tiles"},
    "window": {"window_construction", "glazier"},
    "appliance": {"electronics_repair"},
    "kitchen": {"kitchen"},
    "bathroom": {"bathroom_furnishing"},
    "hardware": {"hardware", "doityourself", "trade"},
}


_CACHE_TTL = 6 * 60 * 60
_live_cache: dict = {"at": 0.0, "payload": None}
_BBOX = "32.53,-117.65,33.55,-116.05"
_OVERPASS_QUERY = f"""
[out:json][timeout:25];
(
  node["name"]["craft"]({_BBOX});
  way["name"]["craft"]({_BBOX});
  node["name"]["shop"~"hardware|doityourself|paint|tiles|garden_centre|trade|electronics_repair"]({_BBOX});
  way["name"]["shop"~"hardware|doityourself|paint|tiles|garden_centre|trade|electronics_repair"]({_BBOX});
);
out center tags;
"""
_CRAFT_LABELS = {
    "plumber": "Plumbing",
    "electrician": "Electrical",
    "electrical": "Electrical",
    "hvac": "HVAC",
    "heating_engineer": "HVAC",
    "painter": "Painting",
    "paint": "Painting",
    "cleaning": "Cleaning",
    "handyman": "Handyman",
    "builder": "Builder",
    "carpenter": "Carpentry",
    "roofer": "Roofing",
    "locksmith": "Locksmith",
    "gardener": "Gardening",
    "garden_centre": "Gardening",
    "tiler": "Tiling",
    "tiles": "Tiling",
    "floorer": "Flooring",
    "flooring": "Flooring",
    "window_construction": "Windows",
    "glazier": "Windows",
    "upholsterer": "Upholstery",
    "bathroom_furnishing": "Bathroom",
    "kitchen": "Kitchen",
    "electronics_repair": "Appliance Repair",
    "hardware": "Hardware",
    "doityourself": "Hardware",
    "trade": "Hardware",
}


def load_public_listings() -> list[dict]:
    return _public_payload().get("listings", [])


def _snapshot_payload() -> dict:
    if not _DATA.exists():
        return {"attribution": "© OpenStreetMap contributors", "area": "", "listings": [], "live": False}
    payload = json.loads(_DATA.read_text())
    payload["live"] = False
    return payload


def _cache_file() -> Path:
    if os.environ.get("VERCEL"):
        return Path("/tmp/public_listings_live.json")
    return _DATA.parent / "public_listings_live.json"


def _listing_from_element(element: dict) -> dict | None:
    tags = element.get("tags") or {}
    name = (tags.get("name") or "").strip()
    if not name:
        return None
    craft = (tags.get("craft") or tags.get("shop") or "").split(";")[0].strip()
    center = element.get("center") or {}
    street = " ".join(
        part for part in (tags.get("addr:housenumber"), tags.get("addr:street")) if part
    ).strip()
    return {
        "id": f"osm-{element.get('type', 'node')}-{element.get('id')}",
        "name": name,
        "category": _CRAFT_LABELS.get(craft, craft.replace("_", " ").title() or "Service"),
        "craft": craft,
        "street": street,
        "city": tags.get("addr:city") or "",
        "state": "CA",
        "postcode": tags.get("addr:postcode") or "",
        "phone": tags.get("phone") or tags.get("contact:phone") or "",
        "website": tags.get("website") or tags.get("contact:website") or "",
        "hours": tags.get("opening_hours") or "",
        "lat": element.get("lat") or center.get("lat"),
        "lng": element.get("lon") or center.get("lng") or center.get("lon"),
    }


def _fetch_overpass() -> dict:
    body = urllib.parse.urlencode({"data": _OVERPASS_QUERY}).encode()
    request = urllib.request.Request(
        "https://overpass.kumi.systems/api/interpreter",
        data=body,
        headers={"User-Agent": "SevenPros/1.0 (local service marketplace; contact sevenpros.vercel.app)"},
    )
    with urllib.request.urlopen(request, timeout=8) as response:
        raw = json.loads(response.read().decode())
    listings = []
    seen = set()
    for element in raw.get("elements", []):
        item = _listing_from_element(element)
        if not item or item["id"] in seen:
            continue
        seen.add(item["id"])
        listings.append(item)
    return {
        "source": "OpenStreetMap",
        "attribution": "© OpenStreetMap contributors",
        "license": "ODbL",
        "area": "San Diego County, California",
        "fetched_at": time.time(),
        "live": True,
        "count": len(listings),
        "listings": listings,
    }


def _read_fresh_cache() -> dict | None:
    path = _cache_file()
    if not path.exists():
        return None
    try:
        saved = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return None
    if not saved.get("listings"):
        return None
    if time.time() - float(saved.get("fetched_at") or 0) >= _CACHE_TTL:
        return None
    saved["live"] = True
    return saved


def _public_payload() -> dict:
    now = time.time()
    cached = _live_cache.get("payload")
    if cached and now - float(_live_cache.get("at") or 0) < _CACHE_TTL:
        return cached
    saved = _read_fresh_cache()
    if saved:
        _live_cache["payload"] = saved
        _live_cache["at"] = now
        return saved
    try:
        fresh = _fetch_overpass()
    except Exception:
        fresh = None
    if fresh and fresh.get("listings"):
        try:
            _cache_file().write_text(json.dumps(fresh))
        except OSError:
            pass
        _live_cache["payload"] = fresh
        _live_cache["at"] = now
        return fresh
    snapshot = _snapshot_payload()
    _live_cache["payload"] = snapshot
    _live_cache["at"] = now - _CACHE_TTL + 120
    return snapshot


def _public_matches(item: dict, q: str | None, category_slug: str | None) -> bool:
    blob = " ".join(
        [
            item.get("name") or "",
            item.get("category") or "",
            item.get("craft") or "",
            item.get("city") or "",
            item.get("street") or "",
        ]
    ).lower()
    hints: set[str] = set()
    for text in (q or "", (category_slug or "").replace("-", " ")):
        low = text.lower()
        for needle, crafts in _CRAFT_HINTS.items():
            if needle in low:
                hints |= crafts
    if hints and item.get("craft") not in hints and not (q and q.lower() in blob):
        return False
    if q and q.lower() not in blob and item.get("craft") not in hints:
        return False
    return True


@router.get("/public")
def search_public(
    q: str | None = None,
    category_slug: str | None = None,
    country: str = "US",
    city: str = "",
    county: str = "",
    limit: int = 500,
):
    """Real businesses from the free OpenStreetMap dataset (cached snapshot)."""
    payload = _public_payload()
    want = " ".join(part for part in (city, county) if part).lower()
    listings = []
    for item in payload.get("listings", []):
        if not (item.get("street") or item.get("city")):
            continue
        if not _public_matches(item, q, category_slug):
            continue
        state = (item.get("state") or "CA").upper()
        if country == "CA" and state in {"CA", "CALIFORNIA"}:
            continue
        blob = f"{item.get('city') or ''} {item.get('street') or ''}".lower()
        needles = [part.lower() for part in (city, county) if part]
        if needles and not any(part in blob for part in needles):
            continue
        listings.append(item)
    from app.routers.credits import mask_phone

    shown = []
    for item in listings[: max(1, min(limit, 400))]:
        copy = dict(item)
        copy["phone_hint"] = mask_phone(copy.get("phone"))
        copy["has_phone"] = bool(copy.get("phone"))
        copy["has_website"] = bool(copy.get("website"))
        copy["phone"] = ""
        copy["website"] = ""
        shown.append(copy)
    return {
        "source": payload.get("source", "OpenStreetMap"),
        "attribution": payload.get("attribution", "© OpenStreetMap contributors"),
        "area": ", ".join(part for part in (city, county) if part) or payload.get("area", ""),
        "live": bool(payload.get("live")),
        "fetched_at": payload.get("fetched_at"),
        "total": len(listings),
        "listings": shown,
    }
