from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401 -- ensures all models are registered on Base
from app.config import settings
from app.database import Base, engine
from app.routers import admin, ai, auth, bookings, categories, chat, credits, favorites, payments, providers, reviews, search, users

Base.metadata.create_all(bind=engine)


def ensure_schema() -> None:
    """Add columns introduced after the first SQLite create (safe no-ops if present)."""
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "job_bids" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("job_bids")}
    with engine.begin() as conn:
        if "status" not in cols:
            conn.execute(text("ALTER TABLE job_bids ADD COLUMN status VARCHAR DEFAULT 'pending'"))
        if "booking_id" not in cols:
            conn.execute(text("ALTER TABLE job_bids ADD COLUMN booking_id VARCHAR"))


ensure_schema()

ADMIN_ID = "00000000-0000-4000-8000-0000000000a1"


def ensure_admin() -> None:
    """Every server has the same staff account so a login works on the next request."""
    from app.core.security import hash_password
    from app.database import SessionLocal
    from app.models.user import AuthProvider, User

    db = SessionLocal()
    try:
        other = db.query(User).filter(User.email == "admin@sevenpros.com", User.id != ADMIN_ID).first()
        if other:
            other.email = f"retired-admin-{other.id[:8]}@sevenpros.com"
            db.commit()
        admin = db.get(User, ADMIN_ID)
        if admin is None:
            admin = User(
                id=ADMIN_ID,
                email="admin@sevenpros.com",
                full_name="SevenPros Admin",
                hashed_password=hash_password("password123"),
                auth_provider=AuthProvider.email,
                is_verified=True,
                is_admin=True,
                referral_code="crmadmin01",
            )
            db.add(admin)
        else:
            admin.email = "admin@sevenpros.com"
            admin.is_admin = True
            admin.hashed_password = hash_password("password123")
        db.commit()
    finally:
        db.close()


ensure_admin()

app = FastAPI(title="SevenPros API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.(vercel\.app|nip\.io)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(providers.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
app.include_router(payments.router)
app.include_router(credits.router)
app.include_router(chat.router)
app.include_router(ai.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
