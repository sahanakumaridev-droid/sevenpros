import json
import os
import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, get_optional_user
from app.models.credit import (
    CreditLedger,
    CreditUnlock,
    CreditWallet,
    JobBid,
    JobPost,
    ListingExtra,
    ListingMessage,
    ProSubscription,
    ThreadSeen,
)
from app.models.booking import Booking, BookingStatus
from app.models.category import Category
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User

router = APIRouter(prefix="/api/credits", tags=["credits"])

PACKS = {
    "members-3": {"credits": 3, "price_cents": 1900, "label": "3 member access", "for_customer": True},
    "starter": {"credits": 100, "price_cents": 1000, "label": "Starter", "for_customer": False},
    "growth": {"credits": 275, "price_cents": 2500, "label": "Growth", "for_customer": False},
    "business": {"credits": 600, "price_cents": 5000, "label": "Business", "for_customer": False},
}
LEAD_COST = 15
UNLICENSED_LEAD_COST = 20
PLATFORM_FEE = 1
FREE_JOBS = 3
CONTACT_CAP = 3
PRO_PRICE_CENTS = 4900
# Premium revenue: customer pays quote + platform service fee when accepting a bid
BOOKING_FEE_BPS = 800  # 8%
BOOKING_FEE_MIN_CENTS = 500  # $5 minimum
BOOKING_FEE_MAX_CENTS = 15000  # $150 cap


def mask_phone(phone: str | None) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) < 4:
        return ""
    return f"(***) ***-{digits[-4:]}"


def half_hide(value: str | None) -> str:
    text = (value or "").strip()
    if not text:
        return ""
    keep = max(1, len(text) // 2)
    return text[:keep] + ("*" * (len(text) - keep))


def mask_email(email: str | None) -> str:
    if not email or "@" not in email:
        return ""
    name, domain = email.split("@", 1)
    return f"{(name[:1] or '')}***@{domain}"


def billing_mode() -> str:
    # Default to test so demo checkout / packs / Pro plan work without Stripe keys.
    return os.environ.get("SEVENPROS_BILLING_MODE", "test")


def booking_service_fee_cents(quote_cents: int) -> int:
    raw = max(BOOKING_FEE_MIN_CENTS, int(round(quote_cents * BOOKING_FEE_BPS / 10000)))
    return min(BOOKING_FEE_MAX_CENTS, raw)


def _wallet(db: Session, user_id: str) -> CreditWallet:
    wallet = db.get(CreditWallet, user_id)
    if wallet is None:
        wallet = CreditWallet(user_id=user_id, balance=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


def _sub(db: Session, user: User) -> ProSubscription:
    row = db.get(ProSubscription, user.id)
    if row is None:
        row = ProSubscription(user_id=user.id, status="none", price_cents=PRO_PRICE_CENTS)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def _require_pro(user: User) -> None:
    if not user.is_provider:
        raise HTTPException(status_code=403, detail="Only a professional account can buy credits or unlock leads")


def _free_unlocks_left(db: Session, user_id: str) -> int:
    used = db.query(CreditUnlock).filter(CreditUnlock.user_id == user_id).count()
    return max(0, FREE_JOBS - used)


def _unlock_cost(db: Session, user: User, sub: ProSubscription) -> int:
    if sub.status == "active":
        return 0
    if _free_unlocks_left(db, user.id) > 0:
        return 0
    return _pro_lead_cost(db, user)


def _listing_media(extra: ListingExtra | None) -> tuple[list[str], str, int]:
    meta = _extra_meta(extra.image_data if extra else "")
    images = [item for item in (meta.get("images") or []) if isinstance(item, str) and item.startswith("data:image/")]
    if not images and extra and extra.image_data and not str(extra.image_data).startswith("{"):
        images = [extra.image_data]
    video = meta.get("video") if isinstance(meta.get("video"), str) else ""
    seconds = int(meta.get("video_seconds") or 0)
    return images[:5], video if video.startswith("data:video/") else "", seconds


def _job_view(job: JobPost, owner: User | None, unlocked: bool) -> dict:
    first = (owner.full_name.split()[0] if owner and owner.full_name else "Customer")
    payload = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "category": job.category,
        "city": job.city,
        "zip_code": job.zip_code,
        "customer_name": first,
        "created_at": job.created_at.isoformat(),
        "unlocked": unlocked,
        "phone_protected": not unlocked,
        "email_protected": not unlocked,
        "phone": "",
        "email": "",
        "phone_hint": mask_phone(owner.phone if owner else ""),
        "email_hint": mask_email(owner.email if owner else ""),
        "lead_cost": LEAD_COST,
    }
    if unlocked and owner:
        payload["phone_protected"] = False
        payload["email_protected"] = False
        payload["phone"] = owner.phone or ""
        payload["email"] = owner.email or ""
        payload["customer_name"] = owner.full_name
    return payload


class BuyIn(BaseModel):
    pack: str


class UnlockIn(BaseModel):
    job_id: str = Field(min_length=2)


class JobIn(BaseModel):
    title: str = Field(min_length=3)
    description: str = ""
    category: str = "General"
    city: str = ""
    zip_code: str = ""
    kind: str = "request"
    price: float = 0
    image: str = ""
    images: list[str] = []
    video: str = ""
    video_seconds: int = 0
    needed_by: str = ""
    includes_product: bool = False
    product_note: str = ""


@router.get("/me")
def my_credits(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = _wallet(db, user.id)
    sub = _sub(db, user)
    history = (
        db.query(CreditLedger)
        .filter(CreditLedger.user_id == user.id)
        .order_by(CreditLedger.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "balance": wallet.balance,
        "is_professional": bool(user.is_provider),
        "subscription_status": sub.status,
        "pro_price_cents": sub.price_cents,
        "lead_cost": LEAD_COST,
        "unlicensed_lead_cost": UNLICENSED_LEAD_COST,
        "contact_cap": CONTACT_CAP,
        "free_unlocks_left": _free_unlocks_left(db, user.id) if user and user.is_provider else 0,
        "free_contacts_left": _customer_free_contacts_left(db, user.id) if user and not user.is_provider else 0,
        "booking_fee_bps": BOOKING_FEE_BPS,
        "booking_fee_min_cents": BOOKING_FEE_MIN_CENTS,
        "billing_mode": billing_mode(),
        "revenue": {
            "pro_leads": "Pros buy credit packs or Pro ($49/mo) to unlock customer jobs.",
            "pro_bids": "First 3 bids free; then 1 credit per bid.",
            "customer_contacts": "Customers buy contact packs to open pro numbers/chat.",
            "booking_fee": f"When a customer accepts a quote, SevenPros takes {BOOKING_FEE_BPS / 100:.0f}% (min ${BOOKING_FEE_MIN_CENTS / 100:.0f}).",
        },
        "packs": [
            {"id": key, "label": value["label"], "credits": value["credits"], "price_cents": value["price_cents"]}
            for key, value in PACKS.items()
            if value["for_customer"] != bool(user.is_provider)
        ],
        "ledger": [
            {
                "id": row.id,
                "amount": row.amount,
                "kind": row.kind,
                "note": row.note,
                "balance_after": row.balance_after,
                "created_at": row.created_at.isoformat(),
            }
            for row in history
        ],
    }


@router.post("/buy")
def buy_pack(payload: BuyIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pack = PACKS.get(payload.pack)
    if not pack:
        raise HTTPException(status_code=400, detail="Unknown pack")
    if pack["for_customer"]:
        if user.is_provider:
            raise HTTPException(status_code=403, detail="Member access is for a customer account")
    else:
        _require_pro(user)
        if billing_mode() != "test":
            raise HTTPException(
                status_code=503,
                detail="Card checkout is not connected. No charge was made and no credits were added.",
            )
    wallet = _wallet(db, user.id)
    wallet.balance += pack["credits"]
    wallet.updated_at = datetime.utcnow()
    db.add(
        CreditLedger(
            user_id=user.id,
            amount=pack["credits"],
            kind="purchase_test",
            note=f"{pack['label']} test checkout ${pack['price_cents'] / 100:.0f}",
            balance_after=wallet.balance,
        )
    )
    db.commit()
    return {"balance": wallet.balance, "added": pack["credits"], "test_mode": True}


@router.post("/subscribe")
def subscribe(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_pro(user)
    sub = _sub(db, user)
    if billing_mode() != "test":
        sub.status = "pending"
        sub.updated_at = datetime.utcnow()
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Subscription checkout is not connected. Status stays pending and Pro access is not granted.",
        )
    sub.status = "active"
    sub.updated_at = datetime.utcnow()
    db.commit()
    return {"subscription_status": sub.status, "test_mode": True}


@router.get("/leads")
def leads(
    country: str = "US",
    region: str = "California",
    county: str = "",
    city: str = "",
    wide: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_pro(user)
    unlocked_ids = {
        row.target_id
        for row in db.query(CreditUnlock).filter(CreditUnlock.user_id == user.id).all()
    }
    picked = country if country in {"US", "CA"} else "US"
    county_filter = "" if wide else county
    city_filter = "" if wide else city
    rows = [
        row
        for row in db.query(JobPost).order_by(JobPost.created_at.desc()).limit(120).all()
        if _covered(row, picked, region, county_filter, city_filter)
    ]
    result = []
    for job in rows:
        if job.user_id == user.id:
            continue
        owner = db.get(User, job.user_id)
        taken = db.query(CreditUnlock).filter(CreditUnlock.target_id == job.id).count()
        view = _job_view(job, owner, job.id in unlocked_ids)
        view["slots_left"] = max(0, CONTACT_CAP - taken)
        view["bid_count"] = db.query(JobBid).filter(JobBid.job_id == job.id).count()
        extra = db.get(ListingExtra, job.id)
        view["image"] = _cover(extra.image_data if extra else "")
        meta = _extra_meta(extra.image_data if extra else "")
        view["needed_by"] = meta.get("needed_by") or ""
        view["includes_product"] = bool(meta.get("includes_product"))
        view["product_note"] = meta.get("product_note") or ""
        latest = (
            db.query(ListingMessage)
            .filter(ListingMessage.job_id == job.id, ListingMessage.sender_id != user.id)
            .order_by(ListingMessage.created_at.desc())
            .first()
        )
        if latest:
            sender = db.get(User, latest.sender_id)
            view["customer_message"] = latest.body
            view["customer_message_from"] = sender.full_name if sender else "Customer"
        result.append(view)
    return {"lead_cost": LEAD_COST, "contact_cap": CONTACT_CAP, "balance": _wallet(db, user.id).balance, "leads": result}


@router.get("/pro/bids")
def pro_bids(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Quotes this pro sent on customer job posts."""
    _require_pro(user)
    rows = (
        db.query(JobBid)
        .filter(JobBid.pro_user_id == user.id)
        .order_by(JobBid.created_at.desc())
        .limit(120)
        .all()
    )
    out = []
    for bid in rows:
        job = db.get(JobPost, bid.job_id)
        owner = db.get(User, job.user_id) if job else None
        payload = _quote_payload(db, bid)
        payload.update(
            {
                "job_id": bid.job_id,
                "job_title": job.title if job else "",
                "job_category": job.category if job else "",
                "job_city": job.city if job else "",
                "customer_name": owner.full_name if owner else "",
                "customer_id": owner.id if owner else "",
            }
        )
        out.append(payload)
    return out


@router.get("/pro/customers")
def pro_customers(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Customers this pro has unlocked or quoted (for pro CRM view)."""
    _require_pro(user)
    unlocked = {
        row.target_id
        for row in db.query(CreditUnlock).filter(CreditUnlock.user_id == user.id).all()
    }
    bid_jobs = {row.job_id for row in db.query(JobBid).filter(JobBid.pro_user_id == user.id).all()}
    job_ids = list(dict.fromkeys([*unlocked, *bid_jobs]))
    seen_users: dict[str, dict] = {}
    for job_id in job_ids:
        job = db.get(JobPost, job_id)
        if not job:
            continue
        owner = db.get(User, job.user_id)
        if not owner or owner.id == user.id:
            continue
        if owner.id not in seen_users:
            seen_users[owner.id] = {
                "id": owner.id,
                "name": owner.full_name,
                "email": owner.email,
                "phone": owner.phone or "",
                "role": "Customer",
                "status": "Active",
                "joined": owner.created_at.isoformat() if owner.created_at else "",
                "last_job_title": job.title,
            }
        else:
            seen_users[owner.id]["last_job_title"] = job.title
    rows = sorted(seen_users.values(), key=lambda r: r.get("joined") or "", reverse=True)
    return rows


@router.get("/pro/summary")
def pro_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Dashboard KPIs and monthly earnings for the logged-in pro."""
    _require_pro(user)
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    wallet = _wallet(db, user.id)
    sub = _sub(db, user)
    quotes_sent = db.query(JobBid).filter(JobBid.pro_user_id == user.id).count()
    leads_count = db.query(JobPost).filter(JobPost.user_id != user.id).count()
    earnings = 0.0
    completed_jobs = 0
    monthly: dict[str, float] = {}
    if provider:
        bookings = db.query(Booking).filter(Booking.provider_id == provider.id).all()
        for b in bookings:
            if b.status == BookingStatus.completed:
                completed_jobs += 1
            if b.payment_status == "paid" or b.status == BookingStatus.completed:
                amt = float(b.final_price or b.quoted_price or 0)
                earnings += amt
                if b.created_at:
                    label = b.created_at.strftime("%b")
                    monthly[label] = monthly.get(label, 0.0) + amt
    month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_series = [{"label": m, "value": int(round(monthly.get(m, 0)))} for m in month_order if monthly.get(m, 0) > 0]
    if not monthly_series:
        monthly_series = [{"label": datetime.utcnow().strftime("%b"), "value": 0}]
    return {
        "earnings": round(earnings, 2),
        "completed_jobs": completed_jobs,
        "quotes_sent": quotes_sent,
        "open_leads": leads_count,
        "credit_balance": wallet.balance,
        "subscription_status": sub.status,
        "pro_price_cents": sub.price_cents,
        "avg_rating": float(provider.avg_rating) if provider else 0.0,
        "review_count": int(provider.review_count) if provider else 0,
        "monthly_earnings": monthly_series,
    }


@router.get("/pro/reviews")
def pro_reviews_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_pro(user)
    from app.models.review import Review

    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if not provider:
        return []
    rows = (
        db.query(Review)
        .filter(Review.provider_id == provider.id)
        .order_by(Review.created_at.desc())
        .limit(50)
        .all()
    )
    out = []
    for row in rows:
        customer = db.get(User, row.customer_id)
        out.append(
            {
                "id": row.id,
                "rating": row.rating,
                "comment": row.comment or "",
                "created_at": row.created_at.isoformat() if row.created_at else "",
                "customer_name": customer.full_name if customer else "Customer",
            }
        )
    return out


@router.get("/pro/portfolio")
def pro_portfolio(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Accepted quotes and completed jobs with listing imagery."""
    _require_pro(user)
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    seen: set[str] = set()
    items: list[dict] = []
    bids = (
        db.query(JobBid)
        .filter(JobBid.pro_user_id == user.id)
        .order_by(JobBid.created_at.desc())
        .limit(40)
        .all()
    )
    for bid in bids:
        if bid.job_id in seen:
            continue
        job = db.get(JobPost, bid.job_id)
        if not job:
            continue
        extra = db.get(ListingExtra, job.id)
        status = getattr(bid, "status", None) or "pending"
        seen.add(bid.job_id)
        items.append(
            {
                "job_id": job.id,
                "title": job.title,
                "category": job.category,
                "image": _cover(extra.image_data if extra else ""),
                "status": status,
                "amount": bid.amount_cents / 100,
            }
        )
    if provider:
        bookings = (
            db.query(Booking)
            .filter(Booking.provider_id == provider.id, Booking.status == BookingStatus.completed)
            .order_by(Booking.created_at.desc())
            .limit(20)
            .all()
        )
        for b in bookings:
            key = f"booking-{b.id}"
            if key in seen:
                continue
            seen.add(key)
            title = b.service.title if b.service else f"Booking {b.id[:8]}"
            items.append(
                {
                    "job_id": None,
                    "booking_id": b.id,
                    "title": title,
                    "category": "Completed job",
                    "image": "",
                    "status": "completed",
                    "amount": float(b.final_price or b.quoted_price or 0),
                }
            )
    return items[:24]


@router.post("/unlock")
def unlock(payload: UnlockIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_pro(user)
    job = db.get(JobPost, payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Lead not found")
    if job.user_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot unlock your own request")
    existing = (
        db.query(CreditUnlock)
        .filter(CreditUnlock.user_id == user.id, CreditUnlock.target_id == job.id)
        .first()
    )
    owner = db.get(User, job.user_id)
    if existing:
        opened = _job_view(job, owner, True)
        opened["balance"] = _wallet(db, user.id).balance
        opened["charged"] = 0
        return opened
    taken = db.query(CreditUnlock).filter(CreditUnlock.target_id == job.id).count()
    if taken >= CONTACT_CAP:
        raise HTTPException(status_code=409, detail="This request already has 3 professionals")
    sub = _sub(db, user)
    wallet = _wallet(db, user.id)
    cost = _unlock_cost(db, user, sub)
    if wallet.balance < cost:
        free_left = _free_unlocks_left(db, user.id)
        hint = f" ({free_left} free unlocks left)" if free_left else ""
        raise HTTPException(status_code=402, detail=f"This lead costs {cost} credits{hint}")
    wallet.balance -= cost
    wallet.updated_at = datetime.utcnow()
    db.add(CreditUnlock(user_id=user.id, target_id=job.id))
    db.add(
        CreditLedger(
            user_id=user.id,
            amount=-cost,
            kind="unlock" if cost else "unlock_pro_plan",
            note=job.title[:80],
            balance_after=wallet.balance,
        )
    )
    db.commit()
    opened = _job_view(job, owner, True)
    opened["balance"] = wallet.balance
    opened["charged"] = cost
    return opened


class BidIn(BaseModel):
    job_id: str = Field(min_length=2)
    amount: float = Field(ge=0)
    message: str = ""


@router.post("/bids")
def place_bid(payload: BidIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.get(JobPost, payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Request not found")
    if job.user_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot bid on your own request")
    existing = (
        db.query(JobBid)
        .filter(JobBid.job_id == job.id, JobBid.pro_user_id == user.id)
        .first()
    )
    cents = int(round(payload.amount * 100))
    if existing:
        existing.amount_cents = cents
        existing.message = payload.message.strip()
        db.commit()
        return {"id": existing.id, "updated": True, "charged": 0}
    prior = db.query(JobBid).filter(JobBid.pro_user_id == user.id).count()
    charged = 0
    if prior >= 3:
        wallet = _wallet(db, user.id)
        if wallet.balance < 1:
            raise HTTPException(status_code=402, detail="Your 3 free bids are used. Buy credits to bid again.")
        wallet.balance -= 1
        charged = 1
        db.add(CreditLedger(user_id=user.id, amount=-1, kind="bid", note=job.title[:80], balance_after=wallet.balance))
    count = db.query(JobBid).filter(JobBid.job_id == job.id).count()
    if count >= CONTACT_CAP:
        raise HTTPException(status_code=409, detail="This request already has 3 quotes")
    row = JobBid(job_id=job.id, pro_user_id=user.id, amount_cents=cents, message=payload.message.strip())
    db.add(row)
    if payload.message.strip():
        db.add(ListingMessage(job_id=job.id, sender_id=user.id, body=payload.message.strip()))
    if not getattr(row, "status", None):
        row.status = "pending"
    db.commit()
    return {"id": row.id, "updated": False, "charged": charged, "free_bids_left": max(0, 3 - (prior + 1))}


def _quote_payload(db: Session, bid: JobBid) -> dict:
    pro = db.get(User, bid.pro_user_id)
    fee = booking_service_fee_cents(bid.amount_cents)
    return {
        "id": bid.id,
        "amount": bid.amount_cents / 100,
        "amount_cents": bid.amount_cents,
        "message": bid.message,
        "status": getattr(bid, "status", None) or "pending",
        "booking_id": getattr(bid, "booking_id", None),
        "pro_name": pro.full_name if pro else "Pro",
        "pro_user_id": bid.pro_user_id,
        "phone": (pro.phone or "") if pro else "",
        "service_fee_cents": fee,
        "total_due_cents": bid.amount_cents + fee,
        "created_at": bid.created_at.isoformat() if bid.created_at else "",
    }


def _ensure_quote_service(db: Session, provider: Provider, job: JobPost, amount: float) -> Service:
    existing = (
        db.query(Service)
        .filter(Service.provider_id == provider.id, Service.title == "Quoted job")
        .first()
    )
    if existing:
        existing.price_min = amount
        existing.price_type = "quote"
        return existing
    category = db.query(Category).filter(Category.name == job.category).first()
    if category is None:
        category = db.query(Category).order_by(Category.id.asc()).first()
    if category is None:
        category = Category(name="Home Services", slug="home-services", group="Home Services", icon="🔧")
        db.add(category)
        db.flush()
    service = Service(
        provider_id=provider.id,
        category_id=category.id,
        title="Quoted job",
        description=f"Accepted quote for: {job.title}",
        price_type="quote",
        price_min=amount,
        is_instant_booking=False,
    )
    db.add(service)
    db.flush()
    return service


@router.post("/bids/{bid_id}/accept")
def accept_bid(bid_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Customer accepts a pro quote → creates booking → pay quote + platform fee."""
    bid = db.get(JobBid, bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Quote not found")
    job = db.get(JobPost, bid.job_id)
    if not job or job.user_id != user.id:
        raise HTTPException(status_code=403, detail="Only the customer who posted this job can accept a quote")
    status = getattr(bid, "status", None) or "pending"
    if status == "accepted" and getattr(bid, "booking_id", None):
        fee = booking_service_fee_cents(bid.amount_cents)
        return {
            "bid_id": bid.id,
            "booking_id": bid.booking_id,
            "status": "accepted",
            "amount_cents": bid.amount_cents,
            "service_fee_cents": fee,
            "total_due_cents": bid.amount_cents + fee,
            "already": True,
        }
    if status == "rejected":
        raise HTTPException(status_code=409, detail="This quote was already declined")
    provider = db.query(Provider).filter(Provider.user_id == bid.pro_user_id).first()
    if not provider:
        raise HTTPException(status_code=400, detail="This pro has not finished business setup yet")
    amount = bid.amount_cents / 100
    service = _ensure_quote_service(db, provider, job, amount)
    fee = booking_service_fee_cents(bid.amount_cents)
    booking = Booking(
        customer_id=user.id,
        provider_id=provider.id,
        service_id=service.id,
        status=BookingStatus.pending,
        scheduled_date=datetime.utcnow().strftime("%Y-%m-%d"),
        scheduled_time="10:00",
        address_line=f"{job.city or 'Service area'} {job.zip_code or ''}".strip() or "Address TBD",
        notes=f"Accepted quote on job “{job.title}”. {bid.message}".strip(),
        quoted_price=amount,
        payment_status="unpaid",
    )
    db.add(booking)
    db.flush()
    bid.status = "accepted"
    bid.booking_id = booking.id
    for other in db.query(JobBid).filter(JobBid.job_id == job.id, JobBid.id != bid.id).all():
        if (getattr(other, "status", None) or "pending") == "pending":
            other.status = "rejected"
    db.add(
        ListingMessage(
            job_id=job.id,
            sender_id=user.id,
            body=f"Quote accepted at ${amount:.2f}. Platform fee ${fee / 100:.2f}. Complete payment to confirm the booking.",
        )
    )
    db.commit()
    return {
        "bid_id": bid.id,
        "booking_id": booking.id,
        "status": "accepted",
        "amount_cents": bid.amount_cents,
        "service_fee_cents": fee,
        "total_due_cents": bid.amount_cents + fee,
        "already": False,
    }


@router.get("/posts/mine")
def my_posts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(JobPost).filter(JobPost.user_id == user.id).order_by(JobPost.created_at.desc()).all()
    result = []
    for job in rows:
        bids = db.query(JobBid).filter(JobBid.job_id == job.id).order_by(JobBid.created_at.desc()).all()
        quotes = [_quote_payload(db, bid) for bid in bids]
        extra = db.get(ListingExtra, job.id)
        meta = _extra_meta(extra.image_data if extra else "")
        pending = sum(1 for q in quotes if q["status"] == "pending")
        result.append(
            {
                "id": job.id,
                "title": job.title,
                "category": job.category,
                "city": job.city,
                "zip_code": job.zip_code,
                "kind": "request",
                "needed_by": meta.get("needed_by") or "",
                "includes_product": bool(meta.get("includes_product")),
                "product_note": meta.get("product_note") or "",
                "quote_count": len(quotes),
                "pending_quotes": pending,
                "quotes": quotes,
            }
        )
    return result


def _extra_meta(raw: str) -> dict:
    if not raw or not str(raw).startswith("{"):
        return {}
    try:
        data = json.loads(raw)
    except Exception:
        return {}
    return data if isinstance(data, dict) else {}


def _cover(raw: str) -> str:
    if not raw:
        return ""
    if raw.startswith("{"):
        try:
            images = json.loads(raw).get("images") or []
            return images[0] if images else ""
        except Exception:
            return ""
    return raw


def _platform_extra(db: Session, user_id: str) -> int:
    done = db.query(CreditUnlock).filter(CreditUnlock.user_id == user_id).count()
    return PLATFORM_FEE if done >= FREE_JOBS else 0


def _pro_lead_cost(db: Session, user: User) -> int:
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    base = LEAD_COST if provider and provider.is_licensed else UNLICENSED_LEAD_COST
    return base + _platform_extra(db, user.id)


def _customer_free_contacts_left(db: Session, user_id: str) -> int:
    used = db.query(CreditUnlock).filter(CreditUnlock.user_id == user_id).count()
    return max(0, FREE_JOBS - used)


def _customer_contact_cost(db: Session, user_id: str) -> int:
    """Customers: first 3 pro/job contacts free, then 1 credit each (pros use lead unlock, not this)."""
    return 0 if _customer_free_contacts_left(db, user_id) > 0 else 1


def _member_cost(db: Session, user: User, owner: User) -> int:
    if user.is_provider:
        return 0
    return _customer_contact_cost(db, user.id)


_CANADA_POSTAL = re.compile(r"[A-Za-z]\d[A-Za-z]")
_PROVINCES = {
    "ontario": "ON",
    "british columbia": "BC",
    "alberta": "AB",
    "quebec": "QC",
    "manitoba": "MB",
    "saskatchewan": "SK",
    "nova scotia": "NS",
    "new brunswick": "NB",
    "newfoundland and labrador": "NL",
    "prince edward island": "PE",
}


def _covered(job: JobPost, country: str, region: str, county: str, city: str) -> bool:
    digits = re.sub(r"\D", "", job.zip_code or "")
    text = f"{job.city or ''} {job.zip_code or ''} {job.description or ''}"
    low = text.lower()
    ca_zip = len(digits) >= 5 and 90001 <= int(digits[:5]) <= 96162
    canada_postal = bool(_CANADA_POSTAL.search(job.zip_code or ""))
    says_california = bool(re.search(r"california|\bca\b", low))
    says_canada = "canada" in low or any(name in low or f" {code.lower()} " in f" {low} " for name, code in _PROVINCES.items())
    blank = not (job.zip_code or job.city)
    if city and city.lower() not in low:
        return False
    if county and county.lower() not in low:
        return False
    if country == "CA":
        local = bool(city or county) and ((city and city.lower() in low) or (county and county.lower() in low))
        return bool(canada_postal or says_canada or local or (region and region.lower() in low))
    if city or county:
        return ca_zip or says_california or city.lower() in low or (county and county.lower() in low)
    return bool(ca_zip or says_california or blank)


@router.get("/posts")
def list_posts(
    country: str = "US",
    region: str = "California",
    county: str = "",
    city: str = "",
    db: Session = Depends(get_db),
):
    picked = country if country in {"US", "CA"} else "US"
    rows = [
        row
        for row in db.query(JobPost).order_by(JobPost.created_at.desc()).limit(120).all()
        if _covered(row, picked, region, county, city)
    ][:40]
    result = []
    for row in rows:
        extra = db.get(ListingExtra, row.id)
        result.append(
            {
                "id": row.id,
                "title": row.title,
                "description": row.description,
                "category": row.category,
                "city": row.city,
                "zip_code": row.zip_code,
                "kind": extra.kind if extra else "request",
                "price": (extra.price_cents / 100) if extra and extra.price_cents else 0,
                "image": _cover(extra.image_data if extra else ""),
                "created_at": row.created_at.isoformat(),
            }
        )
    return result


@router.post("/posts")
def create_post(payload: JobIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = JobPost(
        user_id=user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category.strip() or "General",
        city=payload.city.strip(),
        zip_code=payload.zip_code.strip(),
    )
    db.add(row)
    db.flush()
    photos = [item for item in payload.images if item.startswith("data:image/") and len(item) < 500_000][:5]
    if payload.image.startswith("data:image/") and len(payload.image) < 500_000 and payload.image not in photos:
        photos.insert(0, payload.image)
    photos = photos[:5]
    if len(payload.images) > 5:
        raise HTTPException(status_code=400, detail="A job can include up to 5 images")
    if payload.video:
        if payload.video_seconds < 1 or payload.video_seconds > 40:
            raise HTTPException(status_code=400, detail="Video must be 40 seconds or less")
        if not payload.video.startswith("data:video/") or len(payload.video) > 1_500_000:
            raise HTTPException(status_code=400, detail="Video is too large to save. Keep it under 40 seconds.")
    image = json.dumps(
        {
            "images": photos,
            "video": payload.video if payload.video.startswith("data:video/") else "",
            "video_seconds": payload.video_seconds if payload.video else 0,
            "needed_by": payload.needed_by.strip(),
            "includes_product": payload.includes_product,
            "product_note": payload.product_note.strip(),
        }
    )
    db.add(
        ListingExtra(
            job_id=row.id,
            kind="request",
            price_cents=0,
            image_data=image,
        )
    )
    db.commit()
    db.refresh(row)
    return {"id": row.id, "title": row.title}


def _opened(db: Session, user_id: str, job_id: str) -> bool:
    return (
        db.query(CreditUnlock)
        .filter(CreditUnlock.user_id == user_id, CreditUnlock.target_id == job_id)
        .first()
        is not None
    )


@router.get("/listings/{job_id}")
def listing_detail(job_id: str, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    job = db.get(JobPost, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Listing not found")
    extra = db.get(ListingExtra, job.id)
    owner = db.get(User, job.user_id)
    mine = bool(user and user.id == job.user_id)
    bids = db.query(JobBid).filter(JobBid.job_id == job.id).all()
    replied = bool(user and any(bid.pro_user_id == user.id for bid in bids))
    unlocked = bool(user) and _opened(db, user.id, job.id)
    opened = mine or unlocked
    images, video, video_seconds = _listing_media(extra)
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "category": job.category,
        "city": job.city,
        "kind": "request",
        "needed_by": _extra_meta(extra.image_data if extra else "").get("needed_by") or "",
        "includes_product": bool(_extra_meta(extra.image_data if extra else "").get("includes_product")),
        "product_note": _extra_meta(extra.image_data if extra else "").get("product_note") or "",
        "image": images[0] if images else _cover(extra.image_data if extra else ""),
        "images": images,
        "video": video if opened or mine else "",
        "video_seconds": video_seconds,
        "seller_name": owner.full_name if owner else "Member",
        "phone_hint": mask_phone(owner.phone if owner else ""),
        "email_hint": mask_email(owner.email if owner else ""),
        "phone": (owner.phone or "") if owner and opened else "",
        "email": (owner.email or "") if owner and opened else "",
        "contact_protected": not opened and not mine,
        "has_quoted": replied,
        "balance": _wallet(db, user.id).balance if user else 0,
        "free_unlocks_left": _free_unlocks_left(db, user.id) if user and user.is_provider else 0,
        "opened": opened,
        "unlocked": unlocked,
        "is_owner": mine,
        "bids": [
            {
                **_quote_payload(db, bid),
                "name": (pro.full_name if (pro := db.get(User, bid.pro_user_id)) else "Pro"),
                "phone": (pro.phone or "") if mine and pro else "",
            }
            for bid in bids
        ],
    }


class OpenIn(BaseModel):
    job_id: str


@router.post("/open")
def open_contact(payload: OpenIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.get(JobPost, payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Listing not found")
    if job.user_id == user.id or _opened(db, user.id, job.id):
        return {"opened": True, "balance": _wallet(db, user.id).balance}
    wallet = _wallet(db, user.id)
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if provider:
        sub = _sub(db, user)
        cost = _unlock_cost(db, user, sub)
    else:
        cost = _customer_contact_cost(db, user.id)
    if wallet.balance < cost:
        left = _customer_free_contacts_left(db, user.id)
        hint = f" ({left} free contacts left)" if left else " Buy a contact pack on Credits."
        raise HTTPException(status_code=402, detail=f"This contact costs {cost} credits.{hint}")
    wallet.balance -= cost
    db.add(CreditUnlock(user_id=user.id, target_id=job.id))
    db.add(
        CreditLedger(
            user_id=user.id,
            amount=-cost,
            kind="open_contact",
            note=job.title[:80],
            balance_after=wallet.balance,
        )
    )
    db.commit()
    return {"opened": True, "balance": wallet.balance}


class MsgIn(BaseModel):
    job_id: str
    body: str = Field(min_length=1, max_length=500)


def _thread_job(db: Session, job_id: str) -> JobPost | None:
    if job_id.startswith("member:"):
        return None
    return db.get(JobPost, job_id)


def _can_read_thread(db: Session, user: User, job_id: str) -> bool:
    if job_id.startswith("member:"):
        target = job_id.split(":", 1)[1]
        return target == user.id or _opened(db, user.id, target)
    job = _thread_job(db, job_id)
    if not job:
        return False
    if job.user_id == user.id or _opened(db, user.id, job.id):
        return True
    return (
        db.query(JobBid)
        .filter(JobBid.job_id == job.id, JobBid.pro_user_id == user.id)
        .first()
        is not None
    )


def _can_send_message(db: Session, user: User, job_id: str) -> bool:
    if job_id.startswith("member:"):
        target = job_id.split(":", 1)[1]
        return target == user.id or _opened(db, user.id, target)
    job = _thread_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Listing not found")
    if job.user_id == user.id:
        return True
    if user.is_provider and not _opened(db, user.id, job.id):
        return False
    if _opened(db, user.id, job.id):
        return True
    return not user.is_provider


@router.get("/messages/{job_id}")
def list_messages(job_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _can_read_thread(db, user, job_id):
        raise HTTPException(status_code=403, detail="Unlock this lead or send a quote to view messages")
    rows = db.query(ListingMessage).filter(ListingMessage.job_id == job_id).order_by(ListingMessage.created_at.asc()).all()
    names = {}
    out = []
    for row in rows:
        if row.sender_id not in names:
            sender = db.get(User, row.sender_id)
            names[row.sender_id] = sender.full_name if sender else "Member"
        out.append(
            {
                "id": row.id,
                "body": row.body,
                "mine": row.sender_id == user.id,
                "name": names[row.sender_id],
                "sender_id": row.sender_id,
                "created_at": row.created_at.isoformat() if row.created_at else "",
            }
        )
    return out


@router.get("/messages/{job_id}/contact")
def thread_contact(job_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Who the current user can call for this job thread."""
    if not _can_read_thread(db, user, job_id):
        raise HTTPException(status_code=403, detail="Unlock this lead before calling")
    job = db.get(JobPost, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Listing not found")
    owner = db.get(User, job.user_id)
    opened_lead = _opened(db, user.id, job.id)
    if user.id == job.user_id:
        targets = []
        for row in db.query(JobBid).filter(JobBid.job_id == job.id).all():
            pro = db.get(User, row.pro_user_id)
            if pro:
                targets.append(
                    {
                        "bid_id": row.id,
                        "name": pro.full_name,
                        "phone": pro.phone or "",
                        "amount": row.amount_cents / 100,
                    }
                )
        return {"job_id": job_id, "role": "customer", "targets": targets}
    phone = (owner.phone or "") if opened_lead else ""
    return {
        "job_id": job_id,
        "role": "pro",
        "name": owner.full_name if owner else "Customer",
        "phone": phone,
    }


@router.post("/messages")
def send_message(payload: MsgIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _can_send_message(db, user, payload.job_id):
        raise HTTPException(
            status_code=403,
            detail="Unlock this customer with credits to chat (first 3 leads free, then buy credits).",
        )
    row = ListingMessage(job_id=payload.job_id, sender_id=user.id, body=payload.body.strip())
    db.add(row)
    db.commit()
    db.refresh(row)
    sender = db.get(User, user.id)
    return {
        "id": row.id,
        "job_id": row.job_id,
        "body": row.body,
        "mine": True,
        "name": sender.full_name if sender else "You",
        "sender_id": user.id,
        "created_at": row.created_at.isoformat() if row.created_at else "",
    }


def _thread_ids(db: Session, user: User) -> list[str]:
    owned = [row.id for row in db.query(JobPost.id).filter(JobPost.user_id == user.id).all()]
    bid = [row.job_id for row in db.query(JobBid.job_id).filter(JobBid.pro_user_id == user.id).all()]
    return list(dict.fromkeys([*owned, *bid]))


@router.get("/inbox")
def inbox(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ids = _thread_ids(db, user)
    items = []
    pending_quotes = 0
    owned_jobs = db.query(JobPost).filter(JobPost.user_id == user.id).all()
    for job in owned_jobs:
        pending = (
            db.query(JobBid)
            .filter(JobBid.job_id == job.id)
            .all()
        )
        fresh = [b for b in pending if (getattr(b, "status", None) or "pending") == "pending"]
        if fresh:
            pending_quotes += len(fresh)
            newest = max(fresh, key=lambda b: b.created_at or datetime.utcnow())
            pro = db.get(User, newest.pro_user_id)
            items.append(
                {
                    "job_id": job.id,
                    "title": job.title,
                    "from_name": pro.full_name if pro else "Pro",
                    "body": f"New quote ${newest.amount_cents / 100:.2f} — accept to book",
                    "mine": False,
                    "unread": True,
                    "kind": "quote",
                    "at": newest.created_at.isoformat() if newest.created_at else datetime.utcnow().isoformat(),
                }
            )
    if ids:
        rows = (
            db.query(ListingMessage)
            .filter(ListingMessage.job_id.in_(ids))
            .order_by(ListingMessage.created_at.desc())
            .all()
        )
        seen = {
            row.job_id: row.seen_at
            for row in db.query(ThreadSeen).filter(ThreadSeen.user_id == user.id, ThreadSeen.job_id.in_(ids)).all()
        }
        latest = {}
        for row in rows:
            latest.setdefault(row.job_id, row)
        for job_id, row in latest.items():
            job = db.get(JobPost, job_id)
            sender = db.get(User, row.sender_id)
            unread = row.sender_id != user.id and (job_id not in seen or seen[job_id] < row.created_at)
            items.append(
                {
                    "job_id": job_id,
                    "title": job.title if job else "Request",
                    "from_name": sender.full_name if sender else "Member",
                    "body": row.body,
                    "mine": row.sender_id == user.id,
                    "unread": unread,
                    "kind": "message",
                    "at": row.created_at.isoformat(),
                }
            )
    items.sort(key=lambda item: (item["unread"], item["at"]), reverse=True)
    return {
        "unread": sum(1 for item in items if item["unread"]),
        "pending_quotes": pending_quotes,
        "items": items[:16],
    }


@router.post("/inbox/{job_id}/seen")
def mark_seen(job_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _can_read_thread(db, user, job_id):
        raise HTTPException(status_code=403, detail="Open this member before chatting")
    row = db.query(ThreadSeen).filter(ThreadSeen.user_id == user.id, ThreadSeen.job_id == job_id).first()
    if row:
        row.seen_at = datetime.utcnow()
    else:
        db.add(ThreadSeen(user_id=user.id, job_id=job_id, seen_at=datetime.utcnow()))
    db.commit()
    return {"ok": True}


def _seller(db: Session, provider_id: str) -> User:
    provider = db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Listing not found")
    owner = db.get(User, provider.user_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Seller not found")
    return owner


def _member_payload(db: Session, user: User | None, owner: User) -> dict:
    opened = bool(user and (user.id == owner.id or _opened(db, user.id, owner.id)))
    free_left = _customer_free_contacts_left(db, user.id) if user and not user.is_provider else 0
    next_cost = 0 if opened else (_member_cost(db, user, owner) if user else 0)
    return {
        "opened": opened,
        "balance": _wallet(db, user.id).balance if user else 0,
        "free_contacts_left": free_left,
        "next_contact_cost": next_cost,
        "phone_hint": mask_phone(owner.phone),
        "email_hint": mask_email(owner.email),
        "phone": owner.phone if opened else "",
        "email": owner.email if opened else "",
        "thread": f"member:{owner.id}",
    }


@router.get("/member/{provider_id}")
def member_contact(provider_id: str, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    return _member_payload(db, user, _seller(db, provider_id))


@router.post("/member/{provider_id}/open")
def open_member(provider_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.is_provider:
        raise HTTPException(
            status_code=403,
            detail="Switch to customer mode to chat or call this pro. Pros reach customers from Find Jobs.",
        )
    owner = _seller(db, provider_id)
    if user.id == owner.id or _opened(db, user.id, owner.id):
        payload = _member_payload(db, user, owner)
        return payload
    wallet = _wallet(db, user.id)
    cost = _member_cost(db, user, owner)
    if wallet.balance < cost:
        left = _customer_free_contacts_left(db, user.id)
        hint = f" ({left} free contacts left)" if not user.is_provider and left else ""
        raise HTTPException(status_code=402, detail=f"This contact costs {cost} credits.{hint}")
    wallet.balance -= cost
    db.add(CreditUnlock(user_id=user.id, target_id=owner.id))
    db.add(
        CreditLedger(
            user_id=user.id,
            amount=-cost,
            kind="open_contact",
            note=owner.full_name or "Member",
            balance_after=wallet.balance,
        )
    )
    db.commit()
    return _member_payload(db, user, owner)


def _public_row(listing_id: str) -> dict:
    from app.routers.search import load_public_listings

    row = next((item for item in load_public_listings() if item.get("id") == listing_id), None)
    if not row:
        raise HTTPException(status_code=404, detail="Listing not found")
    return row


def _public_view(row: dict, opened: bool, balance: int) -> dict:
    view = {
        "id": row.get("id"),
        "name": row.get("name"),
        "category": row.get("category"),
        "city": row.get("city"),
        "state": row.get("state") or "CA",
        "opened": opened,
        "balance": balance,
        "credit_cost": 1,
    }
    if opened:
        view["street"] = row.get("street") or ""
        view["postcode"] = row.get("postcode") or ""
        view["hours"] = row.get("hours") or ""
        view["phone"] = row.get("phone") or ""
        view["website"] = row.get("website") or ""
    return view


@router.get("/public/{listing_id}")
def public_preview(listing_id: str, db: Session = Depends(get_db), user: User | None = Depends(get_optional_user)):
    row = _public_row(listing_id)
    opened = bool(user and _opened(db, user.id, listing_id))
    balance = _wallet(db, user.id).balance if user else 0
    return _public_view(row, opened, balance)


@router.post("/public/{listing_id}/open")
def open_public(listing_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = _public_row(listing_id)
    if _opened(db, user.id, listing_id):
        return _public_view(row, True, _wallet(db, user.id).balance)
    wallet = _wallet(db, user.id)
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    cost = 0 if not provider else 1 + _platform_extra(db, user.id)
    if wallet.balance < cost:
        raise HTTPException(status_code=402, detail=f"This contact costs {cost} credits.")
    wallet.balance -= cost
    db.add(CreditUnlock(user_id=user.id, target_id=listing_id))
    db.add(
        CreditLedger(
            user_id=user.id,
            amount=-cost,
            kind="open_public",
            note=(row.get("name") or "Public listing")[:80],
            balance_after=wallet.balance,
        )
    )
    db.commit()
    return _public_view(row, True, wallet.balance)
