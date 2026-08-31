from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from app.schemas.misc import PaymentIn, PaymentOut

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/charge", response_model=PaymentOut)
def charge(payload: PaymentIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mock checkout. No card processor is called here -- to go live, swap this
    body for a Stripe PaymentIntent using STRIPE_SECRET_KEY (see .env.example)
    and only mark the booking paid after the webhook confirms success."""
    booking = db.get(Booking, payload.booking_id)
    if not booking or booking.customer_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    payment = Payment(
        booking_id=payload.booking_id,
        amount=payload.amount,
        tip=payload.tip,
        coupon_code=payload.coupon_code,
        method=payload.method,
        status="succeeded",
    )
    db.add(payment)
    booking.payment_status = "paid"
    booking.final_price = payload.amount + payload.tip
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/booking/{booking_id}", response_model=list[PaymentOut])
def payments_for_booking(booking_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db.query(Payment).filter(Payment.booking_id == booking_id).all()
