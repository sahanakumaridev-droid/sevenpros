import json
import os
import shutil
import urllib.error
import urllib.request
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import settings

BLOB_PATH = "accounts/sevenpros.db"
_token = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
_saving = False


def _blob_request(url: str, data: bytes | None = None, method: str | None = None, headers: dict | None = None):
    merged = {"authorization": f"Bearer {_token}", "x-api-version": "11"}
    if headers:
        merged.update(headers)
    request = urllib.request.Request(url, data=data, method=method, headers=merged)
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def _blob_url() -> str | None:
    raw = _blob_request(f"https://vercel.com/api/blob?prefix={BLOB_PATH}")
    payload = json.loads(raw.decode())
    for blob in payload.get("blobs", []):
        if blob.get("pathname") == BLOB_PATH:
            return blob.get("url")
    return None


def _download_db(dest: Path) -> bool:
    url = _blob_url()
    if not url:
        return False
    dest.write_bytes(_blob_request(url))
    return dest.stat().st_size > 0


def _upload_db(path: Path) -> None:
    if not _token or not path.exists():
        return
    _blob_request(
        f"https://vercel.com/api/blob?pathname={BLOB_PATH}",
        data=path.read_bytes(),
        method="PUT",
        headers={
            "content-type": "application/octet-stream",
            "x-content-type": "application/octet-stream",
            "x-vercel-blob-access": "private",
            "x-add-random-suffix": "0",
            "x-allow-overwrite": "1",
        },
    )


def _mark_write(session: Session) -> None:
    if session.new or session.dirty or session.deleted:
        session.info["persist_db"] = True


def _persist_after_commit(session: Session) -> None:
    global _saving
    if not session.info.pop("persist_db", False):
        return
    if not _token or not os.environ.get("VERCEL") or _saving:
        return
    _saving = True
    try:
        _upload_db(Path("/tmp/sevenpros.db"))
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"database save failed: {exc}")
    finally:
        _saving = False


database_url = settings.database_url
if os.environ.get("VERCEL"):
    seed = Path(__file__).resolve().parent.parent / "sevenpros.db"
    live = Path("/tmp/sevenpros.db")
    restored = False
    if _token:
        try:
            restored = _download_db(live)
        except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            print(f"database restore failed: {exc}")
    if not restored and seed.exists() and not live.exists():
        shutil.copy(seed, live)
    database_url = "sqlite:////tmp/sevenpros.db"

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

event.listen(Session, "before_commit", _mark_write)
event.listen(Session, "after_commit", _persist_after_commit)
