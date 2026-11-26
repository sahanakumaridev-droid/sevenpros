from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_db
from app.models.booking import Booking
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return user


class VerifyIn(BaseModel):
    kyc_status: str


@router.get("/summary")
def summary(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {
        "users": db.query(User).count(),
        "providers": db.query(Provider).count(),
        "bookings": db.query(Booking).count(),
        "pending_verification": db.query(Provider).filter(Provider.kyc_status != "verified").count(),
    }


@router.get("/users")
def users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "is_provider": u.is_provider,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
        }
        for u in rows
    ]


@router.get("/providers")
def providers(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = (
        db.query(Provider)
        .options(joinedload(Provider.user), joinedload(Provider.services).joinedload(Service.category))
        .order_by(Provider.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": p.id,
            "business_name": p.business_name,
            "city": p.city,
            "state": p.state,
            "email": p.user.email if p.user else None,
            "kyc_status": p.kyc_status,
            "is_licensed": p.is_licensed,
            "license_number": p.license_number,
            "service": p.services[0].title if p.services else None,
        }
        for p in rows
    ]


@router.patch("/providers/{provider_id}/verification")
def set_verification(
    provider_id: str,
    payload: VerifyIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if payload.kyc_status not in {"pending", "verified", "rejected"}:
        raise HTTPException(status_code=400, detail="Status must be pending, verified, or rejected")
    provider = db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider.kyc_status = payload.kyc_status
    db.commit()
    return {"id": provider.id, "kyc_status": provider.kyc_status}


@router.get("/bookings")
def bookings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = (
        db.query(Booking)
        .options(joinedload(Booking.provider), joinedload(Booking.service), joinedload(Booking.customer))
        .order_by(Booking.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": b.id,
            "status": b.status.value if hasattr(b.status, "value") else b.status,
            "when": f"{b.scheduled_date} {b.scheduled_time}",
            "address": b.address_line,
            "customer": b.customer.full_name if b.customer else None,
            "provider": b.provider.business_name if b.provider else None,
            "service": b.service.title if b.service else None,
            "payment_status": b.payment_status,
            "amount": b.final_price if b.final_price is not None else b.quoted_price,
        }
        for b in rows
    ]
