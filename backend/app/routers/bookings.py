import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_db
from app.models.booking import Booking, BookingStatus
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

_LOAD_OPTS = [
    joinedload(Booking.service).joinedload(Service.category),
    joinedload(Booking.provider),
    joinedload(Booking.customer),
]


@router.post("", response_model=BookingOut)
def create_booking(payload: BookingCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.get(Provider, payload.provider_id)
    service = db.get(Service, payload.service_id)
    if not provider or not service:
        raise HTTPException(status_code=404, detail="Provider or service not found")

    booking = Booking(
        customer_id=user.id,
        provider_id=payload.provider_id,
        service_id=payload.service_id,
        scheduled_date=payload.scheduled_date,
        scheduled_time=payload.scheduled_time,
        address_line=payload.address_line,
        notes=payload.notes,
        image_urls=json.dumps(payload.image_urls) if payload.image_urls else None,
        is_emergency=payload.is_emergency,
        status=BookingStatus.pending,
        quoted_price=service.price_min,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return db.query(Booking).options(*_LOAD_OPTS).get(booking.id)


@router.get("/mine", response_model=list[BookingOut])
def my_bookings(status: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Booking).options(*_LOAD_OPTS).filter(Booking.customer_id == user.id)
    if status:
        q = q.filter(Booking.status == status)
    return q.order_by(Booking.created_at.desc()).all()


@router.get("/provider", response_model=list[BookingOut])
def provider_bookings(status: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.is_provider or not user.provider_profile:
        raise HTTPException(status_code=403, detail="Not a provider")
    q = db.query(Booking).options(*_LOAD_OPTS).filter(Booking.provider_id == user.provider_profile.id)
    if status:
        q = q.filter(Booking.status == status)
    return q.order_by(Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).options(*_LOAD_OPTS).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    is_owner_customer = booking.customer_id == user.id
    is_owner_provider = user.provider_profile and booking.provider_id == user.provider_profile.id
    if not (is_owner_customer or is_owner_provider):
        raise HTTPException(status_code=403, detail="Not authorized")
    return booking


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_owner_customer = booking.customer_id == user.id
    is_owner_provider = user.provider_profile and booking.provider_id == user.provider_profile.id
    if not (is_owner_customer or is_owner_provider):
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        new_status = BookingStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    booking.status = new_status
    db.commit()
    return db.query(Booking).options(*_LOAD_OPTS).get(booking_id)
