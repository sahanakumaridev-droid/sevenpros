from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_provider_user, get_current_user, get_db
from app.models.favorite import Favorite
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User
from app.schemas.provider import (
    ProviderDetailOut,
    ProviderUpdate,
    ServiceIn,
    ServiceOut,
)

router = APIRouter(prefix="/api/providers", tags=["providers"])


def _attach_extras(provider: Provider, current_user: User | None, db: Session) -> ProviderDetailOut:
    out = ProviderDetailOut.model_validate(provider)
    out.services = [ServiceOut.model_validate(s) for s in provider.services]
    if current_user:
        fav = (
            db.query(Favorite)
            .filter(Favorite.customer_id == current_user.id, Favorite.provider_id == provider.id)
            .first()
        )
        out.is_favorite = fav is not None
    return out


@router.get("/me", response_model=ProviderDetailOut)
def get_my_provider_profile(
    user: User = Depends(get_current_provider_user), db: Session = Depends(get_db)
):
    return _attach_extras(user.provider_profile, user, db)


@router.patch("/me", response_model=ProviderDetailOut)
def update_my_provider_profile(
    payload: ProviderUpdate,
    user: User = Depends(get_current_provider_user),
    db: Session = Depends(get_db),
):
    provider = user.provider_profile
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return _attach_extras(provider, user, db)


@router.post("/me/services", response_model=ServiceOut)
def add_service(
    payload: ServiceIn,
    user: User = Depends(get_current_provider_user),
    db: Session = Depends(get_db),
):
    service = Service(provider_id=user.provider_profile.id, **payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.patch("/me/services/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: str,
    payload: ServiceIn,
    user: User = Depends(get_current_provider_user),
    db: Session = Depends(get_db),
):
    service = db.get(Service, service_id)
    if not service or service.provider_id != user.provider_profile.id:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in payload.model_dump().items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/me/services/{service_id}")
def delete_service(
    service_id: str,
    user: User = Depends(get_current_provider_user),
    db: Session = Depends(get_db),
):
    service = db.get(Service, service_id)
    if not service or service.provider_id != user.provider_profile.id:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"message": "Service deleted"}


@router.post("/{provider_id}/favorite")
def toggle_favorite(
    provider_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    existing = (
        db.query(Favorite)
        .filter(Favorite.customer_id == user.id, Favorite.provider_id == provider_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"is_favorite": False}
    db.add(Favorite(customer_id=user.id, provider_id=provider_id))
    db.commit()
    return {"is_favorite": True}


@router.get("/{provider_id}", response_model=ProviderDetailOut)
def get_provider(provider_id: str, db: Session = Depends(get_db)):
    provider = db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return _attach_extras(provider, None, db)
