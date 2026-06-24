from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.repositories.city_repo import upsert_building
from app.repositories.instagram_repo import create_stats_snapshot, get_account_by_user_id, latest_stats
from app.routers._serializers import serialize_building
from app.routers.auth import get_instagram_provider
from app.schemas.city import SyncResponse
from app.schemas.instagram import InstagramStatsResponse
from app.services.city_generator import engagement_rate, generate_building
from app.services.token_service import decrypt_token
from app.utils.security import require_current_user

router = APIRouter(prefix="/instagram", tags=["instagram"])


@router.post("/sync", response_model=SyncResponse)
async def sync_instagram(
    user=Depends(require_current_user),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> SyncResponse:
    account = get_account_by_user_id(db, user.id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No connected Instagram account")

    provider = get_instagram_provider(settings)
    token = decrypt_token(account.access_token_encrypted, settings.token_encryption_key)
    account_data = await provider.fetch_account(token)
    stats_data = await provider.fetch_stats(token)
    account.username = account_data.username
    account.profile_picture_url = account_data.profile_picture_url
    account.account_type = account_data.account_type
    account.category = account_data.category
    rate = engagement_rate(stats_data.avg_likes, stats_data.avg_comments, stats_data.followers_count)
    stat = create_stats_snapshot(db, account.id, stats_data, rate)
    building = upsert_building(db, account.id, generate_building(account_data, stats_data))
    db.commit()
    db.refresh(building)
    return SyncResponse(stats=InstagramStatsResponse.model_validate(stat), building=serialize_building(building))


@router.get("/me/stats", response_model=InstagramStatsResponse)
def my_stats(user=Depends(require_current_user), db: Session = Depends(get_db)) -> InstagramStatsResponse:
    account = get_account_by_user_id(db, user.id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No connected Instagram account")
    stat = latest_stats(db, account.id)
    if stat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Instagram stats synced")
    return InstagramStatsResponse.model_validate(stat)
