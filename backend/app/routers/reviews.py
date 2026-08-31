import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_db
from app.models.booking import Booking, BookingStatus
from app.models.provider import Provider
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut, ReviewReply

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


def _recompute_rating(provider_id: str, db: Session):
    reviews = db.query(Review).filter(Review.provider_id == provider_id).all()
    provider = db.get(Provider, provider_id)
    provider.review_count = len(reviews)
    provider.avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0.0
    db.commit()


@router.post("", response_model=ReviewOut)
def create_review(payload: ReviewCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.get(Booking, payload.booking_id)
    if not booking or booking.customer_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.completed:
        raise HTTPException(status_code=400, detail="Booking must be completed before reviewing")
    if booking.review:
        raise HTTPException(status_code=400, detail="Booking already reviewed")

    review = Review(
        booking_id=payload.booking_id,
        customer_id=user.id,
        provider_id=booking.provider_id,
        rating=payload.rating,
        comment=payload.comment,
        photo_urls=json.dumps(payload.photo_urls) if payload.photo_urls else None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    _recompute_rating(booking.provider_id, db)
    return db.query(Review).options(joinedload(Review.customer)).get(review.id)


@router.get("/provider/{provider_id}", response_model=list[ReviewOut])
def provider_reviews(provider_id: str, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .options(joinedload(Review.customer))
        .filter(Review.provider_id == provider_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.post("/{review_id}/reply", response_model=ReviewOut)
def reply_to_review(
    review_id: str, payload: ReviewReply, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if not user.provider_profile or review.provider_id != user.provider_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    review.provider_reply = payload.reply
    db.commit()
    return db.query(Review).options(joinedload(Review.customer)).get(review_id)


@router.post("/{review_id}/report")
def report_review(review_id: str, db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_reported = True
    db.commit()
    return {"message": "Review reported for moderation"}
