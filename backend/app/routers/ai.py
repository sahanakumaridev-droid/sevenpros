from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db
from app.models.category import Category
from app.models.credit import JobPost
from app.models.provider import Provider
from app.models.review import Review
from app.models.service import Service
from app.routers.search import match_score

router = APIRouter(prefix="/api/ai", tags=["ai"])

INTENT_MAP = [
    (("plumb", "leak", "pipe", "drain", "faucet", "toilet", "water heater"), "Plumbing Services"),
    (("electric", "outlet", "wiring", "breaker", "panel", "light"), "Electrical Services"),
    (("hvac", "ac ", "a/c", "furnace", "heat", "air condition"), "HVAC Repair"),
    (("clean", "maid", "mess", "housekeep"), "House Cleaning"),
    (("paint", "wall color", "roller"), "Painting Services"),
    (("handy", "fix", "repair", "assemble", "mount"), "Handyman Services"),
    (("pest", "termite", "roach", "ant"), "Pest Control"),
    (("move", "reloc", "truck"), "Moving Services"),
    (("lawn", "yard", "mow", "garden"), "Lawn Care"),
    (("lock", "key", "lockout"), "Locksmith Services"),
    (("roof", "shingle", "leak roof"), "Roofing Repair"),
    (("pool",), "Pool Cleaning"),
    (("groom", "dog", "pet"), "Pet Grooming"),
    (("junk", "haul", "trash"), "Junk Removal"),
    (("carpet",), "Carpet Cleaning"),
    (("window",), "Window Cleaning"),
]


class ChatIn(BaseModel):
    message: str
    role: str = ""
    history: list[dict] = []


class MatchIn(BaseModel):
    query: str


def _intent(text: str) -> str | None:
    t = text.lower()
    for keys, cat in INTENT_MAP:
        if any(k in t for k in keys):
            return cat
    return None


def _top_providers(db: Session, category_name: str | None, city: str | None = None, limit: int = 4):
    query = db.query(Provider).options(joinedload(Provider.services).joinedload(Service.category))
    query = query.filter(Provider.is_available.is_(True))
    if city:
        query = query.filter(Provider.city.ilike(f"%{city}%"))
    if category_name:
        query = query.join(Provider.services).join(Service.category).filter(Category.name == category_name)
    providers = query.distinct().limit(24).all()
    ranked = []
    for p in providers:
        prices = [s.price_min for s in p.services]
        start = min(prices) if prices else None
        ranked.append((match_score(p, 8.0, start), p, start))
    ranked.sort(key=lambda x: x[0], reverse=True)
    out = []
    for score, p, start in ranked[:limit]:
        out.append(
            {
                "id": p.id,
                "business_name": p.business_name,
                "tagline": p.tagline,
                "city": p.city,
                "avg_rating": p.avg_rating,
                "review_count": p.review_count,
                "starting_price": start,
                "match_score": score,
                "is_verified": p.is_verified,
            }
        )
    return out


@router.post("/chat")
def chat(payload: ChatIn, db: Session = Depends(get_db)):
    msg = payload.message.strip()
    job = None
    for token in msg.replace(",", " ").split():
        if len(token) >= 8:
            job = db.get(JobPost, token)
            if job:
                break
    city = job.city if job and job.city else None
    if not city and " in " in msg.lower():
        city = msg.lower().split(" in ", 1)[1].split(",")[0].strip().title()
    intent = job.category if job else _intent(msg)
    providers = _top_providers(db, intent if not job else None, city, 3)
    if job and not providers:
        providers = _top_providers(db, None, city, 3)
    lower = msg.lower()

    if any(w in lower for w in ("hello", "hi ", "hey", "help")):
        reply = (
            "Hi — I’m SEVENPROS AI. Describe the job (leak, AC, cleaning, painting…) "
            "and I’ll rank verified California pros for you, 7 days a week."
        )
    elif any(w in lower for w in ("price", "cost", "how much")):
        reply = (
            "Typical local jobs start around $60–$150 for handyman work and $90–$400 for licensed trades. "
            "Open a pro’s profile to see their range, or tell me the job and I’ll estimate from similar bookings."
        )
    elif any(w in lower for w in ("emergency", "urgent", "now", "today")):
        reply = "For same-day help, filter Find a Pro for emergency availability. Here are fast-response matches:"
    elif job:
        reply = f"Job {job.title} in {job.city or city or 'California'}. Matches below use that job and city."
    elif intent:
        reply = (
            f"This sounds like **{intent}**. I ranked nearby pros using rating, response time, price, and verification — "
            "the same Best Match score used in search."
        )
    else:
        reply = (
            "I can match you with licensed, insured, and background-checked pros across California. "
            "Try: “leaky kitchen faucet in 94110” or “need house cleaning this weekend”."
        )

    return {
        "reply": reply,
        "intent": intent,
        "providers": providers,
        "engine": "sevenpros-matchmaker-v1",
    }


@router.post("/match")
def match(payload: MatchIn, db: Session = Depends(get_db)):
    intent = _intent(payload.query)
    providers = _top_providers(db, intent, limit=6)
    return {"intent": intent or "General home services", "providers": providers}


@router.get("/reviews/{provider_id}/summary")
def review_summary(provider_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.provider_id == provider_id).all()
    if not reviews:
        return {"summary": "No reviews yet — be the first to book and rate this pro.", "highlights": [], "count": 0}

    avg = round(sum(r.rating for r in reviews) / len(reviews), 2)
    positives = [r.comment for r in reviews if r.rating >= 4 and r.comment]
    caution = [r.comment for r in reviews if r.rating <= 3 and r.comment]
    highlights = []
    blob = " ".join((r.comment or "").lower() for r in reviews)
    if "on time" in blob or "punctual" in blob:
        highlights.append("Often praised for punctuality")
    if "professional" in blob:
        highlights.append("Described as professional")
    if "price" in blob or "fair" in blob:
        highlights.append("Fair pricing mentioned")
    if "communicat" in blob:
        highlights.append("Clear communication")
    if caution:
        highlights.append("A few notes on timing — check recent reviews")

    summary = (
        f"AI summary of {len(reviews)} reviews (avg {avg}/5): customers most often mention "
        f"{', '.join(highlights[:3]) or 'reliable workmanship'}. "
        f"{'Recent praise: ' + positives[0] if positives else ''}"
    )
    return {"summary": summary.strip(), "highlights": highlights[:5], "count": len(reviews), "avg": avg}


@router.post("/fraud-check")
def fraud_check(payload: dict):
    text = str(payload.get("text") or "")
    flags = []
    t = text.lower()
    if "wire" in t or "gift card" in t or "crypto" in t:
        flags.append("Off-platform payment request")
    if "don't tell" in t or "dont tell" in t:
        flags.append("Secrecy language")
    if len(text) > 0 and text.count("!") > 6:
        flags.append("Urgency / pressure")
    return {
        "risk": "high" if flags else "low",
        "flags": flags,
        "advice": "Keep payments on SEVENPROS until the job is complete." if flags else "No fraud signals detected.",
    }
