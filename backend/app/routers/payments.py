from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.booking import Booking
from app.models.credit import CreditLedger
from app.models.payment import CheckoutOrder, Payment
from app.models.user import User
from app.models.booking import BookingStatus
from app.routers.credits import PACKS, PRO_PRICE_CENTS, booking_service_fee_cents, _sub, _wallet
from app.schemas.misc import PaymentIn, PaymentOut

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CheckoutIn(BaseModel):
    purpose: str
    pack: str = ""
    booking_id: str = ""
    tip: float = 0


def _quote(db: Session, user: User, payload: CheckoutIn) -> tuple[int, str, int]:
    """Returns amount_cents, label, platform_fee_cents."""
    if payload.purpose == "credits":
        pack = PACKS.get(payload.pack)
        if not pack:
            raise HTTPException(status_code=400, detail="Unknown pack")
        if pack["for_customer"] and user.is_provider:
            raise HTTPException(status_code=403, detail="Member access is for a customer account")
        if not pack["for_customer"] and not user.is_provider:
            raise HTTPException(status_code=403, detail="Credit packs for leads are for a professional account")
        return pack["price_cents"], f"{pack['label']} · {pack['credits']} credits", 0
    if payload.purpose == "subscription":
        if not user.is_provider:
            raise HTTPException(status_code=403, detail="SevenPros Pro is for a professional account")
        return PRO_PRICE_CENTS, "SevenPros Pro · 1 month", 0
    if payload.purpose == "booking":
        booking = db.get(Booking, payload.booking_id)
        if not booking or booking.customer_id != user.id:
            raise HTTPException(status_code=404, detail="Booking not found")
        quote_cents = int(round(float(booking.quoted_price or 0) * 100))
        tip_cents = int(round(max(0, payload.tip) * 100))
        fee = booking_service_fee_cents(quote_cents)
        total = quote_cents + tip_cents + fee
        return total, f"Booking · quote ${quote_cents / 100:.2f} + fee ${fee / 100:.2f}", fee
    raise HTTPException(status_code=400, detail="Unknown checkout")


def _deliver(db: Session, user: User, order: CheckoutOrder) -> None:
    if order.purpose == "credits":
        pack = PACKS[order.pack]
        wallet = _wallet(db, user.id)
        wallet.balance += pack["credits"]
        wallet.updated_at = datetime.utcnow()
        db.add(
            CreditLedger(
                user_id=user.id,
                amount=pack["credits"],
                kind="purchase",
                note=order.label,
                balance_after=wallet.balance,
            )
        )
        return
    if order.purpose == "subscription":
        sub = _sub(db, user)
        sub.status = "active"
        sub.updated_at = datetime.utcnow()
        return
    booking = db.get(Booking, order.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.add(
        Payment(
            booking_id=booking.id,
            amount=order.amount_cents / 100,
            method="checkout",
            status="succeeded",
        )
    )
    booking.payment_status = "paid"
    booking.final_price = order.amount_cents / 100
    booking.status = BookingStatus.accepted


@router.post("/checkout")
def start_checkout(payload: CheckoutIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    amount, label, fee = _quote(db, user, payload)
    order = CheckoutOrder(
        user_id=user.id,
        purpose=payload.purpose,
        pack=payload.pack,
        booking_id=payload.booking_id,
        amount_cents=amount,
        label=label,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {
        "id": order.id,
        "purpose": order.purpose,
        "label": order.label,
        "amount_cents": order.amount_cents,
        "platform_fee_cents": fee,
        "status": order.status,
        "charged": False,
        "test_mode": True,
    }


@router.get("/checkout/{order_id}")
def read_checkout(order_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(CheckoutOrder, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Checkout not found")
    return {
        "id": order.id,
        "purpose": order.purpose,
        "label": order.label,
        "amount_cents": order.amount_cents,
        "status": order.status,
        "charged": False,
        "test_mode": True,
    }


@router.post("/checkout/{order_id}/confirm")
def confirm_checkout(order_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(CheckoutOrder, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Checkout not found")
    if order.status != "paid":
        _deliver(db, user, order)
        order.status = "paid"
        db.commit()
    return {
        "id": order.id,
        "status": "paid",
        "label": order.label,
        "amount_cents": order.amount_cents,
        "purpose": order.purpose,
        "booking_id": order.booking_id,
        "charged": False,
        "test_mode": True,
    }


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
