from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.category import Category
from app.schemas.category import CategoryGroupOut, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])

GROUP_ICONS = {
    "Home Services": "🏠", "Automotive": "🚗", "Cleaning": "🧹", "Plumbing": "🚰",
    "Electrical": "💡", "HVAC": "❄️", "Remodeling": "🛠️", "Painting": "🎨",
    "Roofing": "🏚️", "Landscaping": "🌿", "Pool Services": "🏊", "Pest Control": "🐜",
    "Moving": "📦", "Appliance Repair": "🔌", "Beauty & Wellness": "💆", "Pet Services": "🐾",
    "Tutors": "📚", "Events": "🎉", "Professional Services": "💼", "Business Services": "🏢",
}


@router.get("", response_model=list[CategoryOut])
def list_categories(popular_only: bool = False, group: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Category)
    if popular_only:
        q = q.filter(Category.is_popular.is_(True))
    if group:
        q = q.filter(Category.group == group)
    return q.order_by(Category.name).all()


@router.get("/grouped", response_model=list[CategoryGroupOut])
def list_categories_grouped(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.group, Category.name).all()
    grouped: dict[str, list[Category]] = {}
    for c in cats:
        grouped.setdefault(c.group, []).append(c)
    return [
        CategoryGroupOut(group=g, icon=GROUP_ICONS.get(g, "🔧"), categories=items)
        for g, items in grouped.items()
    ]


@router.get("/search", response_model=list[CategoryOut])
def search_categories(q: str, db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.name.ilike(f"%{q}%")).order_by(Category.name).limit(20).all()
