from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.booking import Booking
from app.models.message import Message
from app.models.user import User
from app.schemas.misc import MessageIn, MessageOut

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _assert_participant(booking: Booking, user: User):
    is_customer = booking.customer_id == user.id
    is_provider = user.provider_profile and booking.provider_id == user.provider_profile.id
    if not (is_customer or is_provider):
        raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/{booking_id}", response_model=list[MessageOut])
def get_thread(booking_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    _assert_participant(booking, user)
    return db.query(Message).filter(Message.booking_id == booking_id).order_by(Message.created_at).all()


@router.post("", response_model=MessageOut)
def send_message(payload: MessageIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Basic REST chat, polled by the client. Real-time push (WebSocket),
    voice/video calling, and AI auto-replies are integration points, not
    implemented here -- see README."""
    booking = db.get(Booking, payload.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    _assert_participant(booking, user)

    message = Message(booking_id=payload.booking_id, sender_id=user.id, content=payload.content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
