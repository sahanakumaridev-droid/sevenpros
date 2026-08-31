import os
import shutil
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

database_url = settings.database_url
if os.environ.get("VERCEL"):
    src = Path(__file__).resolve().parent.parent / "sevenpros.db"
    dst = Path("/tmp/sevenpros.db")
    if src.exists() and not dst.exists():
        shutil.copy(src, dst)
    database_url = "sqlite:////tmp/sevenpros.db"

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
