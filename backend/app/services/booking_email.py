from sqlalchemy.orm import Session, joinedload

from app.core.email import send_email
from app.models.booking import Booking
from app.models.service import Service
from app.models.user import User

_SITE = "https://sevenpros.vercel.app"


def _load_booking(db: Session, booking_id: str) -> Booking | None:
    return (
        db.query(Booking)
        .options(
            joinedload(Booking.customer),
            joinedload(Booking.provider),
            joinedload(Booking.service).joinedload(Service.category),
        )
        .filter(Booking.id == booking_id)
        .first()
    )


def notify_booking_created(db: Session, booking_id: str) -> dict:
    booking = _load_booking(db, booking_id)
    if not booking:
        return {"ok": False}
    customer = booking.customer
    provider = booking.provider
    pro_user = db.get(User, provider.user_id) if provider else None
    service = booking.service
    title = service.title if service else "Service"
    when = f"{booking.scheduled_date} at {booking.scheduled_time}"
    price = booking.quoted_price or 0
    results = []

    if customer and customer.email:
        text = (
            f"Hi {customer.full_name},\n\n"
            f"Your booking with {provider.business_name if provider else 'your pro'} is confirmed.\n\n"
            f"Service: {title}\n"
            f"When: {when}\n"
            f"Address: {booking.address_line}\n"
            f"Quote: ${price:.2f}\n"
            f"Status: {booking.status.value}\n\n"
            f"View booking: {_SITE}/account/bookings/{booking.id}\n"
        )
        results.append(
            send_email(
                to=customer.email,
                subject=f"Booking confirmed — {title}",
                text=text,
            )
        )

    if pro_user and pro_user.email:
        text = (
            f"Hi {pro_user.full_name},\n\n"
            f"{customer.full_name if customer else 'A customer'} booked your service.\n\n"
            f"Service: {title}\n"
            f"When: {when}\n"
            f"Address: {booking.address_line}\n"
            f"Quote: ${price:.2f}\n\n"
            f"Manage job: {_SITE}/pro/bookings\n"
        )
        results.append(
            send_email(
                to=pro_user.email,
                subject=f"New booking — {title}",
                text=text,
            )
        )
    return {"ok": True, "deliveries": results}