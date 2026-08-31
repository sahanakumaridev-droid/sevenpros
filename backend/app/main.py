from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401 -- ensures all models are registered on Base
from app.config import settings
from app.database import Base, engine
from app.routers import ai, auth, bookings, categories, chat, favorites, payments, providers, reviews, search, users

Base.metadata.create_all(bind=engine)

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
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(providers.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
app.include_router(payments.router)
app.include_router(chat.router)
app.include_router(ai.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
