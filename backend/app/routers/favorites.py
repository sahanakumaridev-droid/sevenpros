from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user, get_db
from app.models.favorite import Favorite
from app.models.provider import Provider
from app.models.service import Service
from app.models.user import User
from app.schemas.provider import ProviderListOut, ServiceOut

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("", response_model=list[ProviderListOut])
def list_favorites(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favorites = db.query(Favorite).filter(Favorite.customer_id == user.id).all()
    results = []
    for fav in favorites:
        provider = db.query(Provider).options(joinedload(Provider.services).joinedload(Service.category)).get(
            fav.provider_id
        )
        if not provider:
            continue
        item = ProviderListOut.model_validate(provider)
        item.services = [ServiceOut.model_validate(s) for s in provider.services]
        item.is_favorite = True
        results.append(item)
    return results
