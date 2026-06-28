from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.models import InstagramAccount, InstagramStat
from app.repositories.city_repo import get_building_by_account_id, upsert_building
from app.repositories.instagram_repo import (
    create_stats_snapshot,
    get_account_by_user_id,
    get_account_by_username,
    latest_stats,
    replace_posts,
    upsert_instagram_account,
)
from app.repositories.user_repo import upsert_user_for_instagram
from app.routers._serializers import serialize_building
from app.routers.auth import auth_cookie_options
from app.schemas.city import SyncResponse
from app.schemas.instagram import InstagramStatsResponse, PublicInstagramImportRequest
from app.services.city_generator import engagement_rate, generate_building
from app.services.instagram.apify_provider import ApifyInstagramProvider
from app.services.instagram.base import ProviderConfigurationError
from app.services.token_service import decrypt_token
from app.services.token_service import SESSION_COOKIE_NAME, create_session_token, encrypt_token
from app.utils.security import require_current_user

router = APIRouter(prefix="/instagram", tags=["instagram"])
PUBLIC_TOKEN_PREFIX = "apify:"
LEGACY_PUBLIC_TOKEN_PREFIX = "public:"


def _profile_provider(settings: Settings) -> ApifyInstagramProvider:
    return ApifyInstagramProvider(
        api_token=settings.apify_api_token,
        actor_id=settings.apify_actor_id,
        results_limit=settings.apify_results_limit,
    )


def _cache_username(identifier: str) -> str:
    value = identifier.strip().removeprefix("@").strip("/")
    if value.startswith("http://") or value.startswith("https://"):
        parsed = urlparse(value)
        segments = [segment for segment in parsed.path.split("/") if segment]
        return segments[0] if segments else "public_profile"
    return value or "public_profile"


def _cached_sync_response(db: Session, account: InstagramAccount) -> SyncResponse | None:
    stat = latest_stats(db, account.id)
    building = get_building_by_account_id(db, account.id)
    if stat is None or building is None:
        return None
    if not _has_complete_scraped_cache(account, stat):
        return None
    return SyncResponse(stats=InstagramStatsResponse.model_validate(stat), building=serialize_building(building))


def _has_complete_scraped_cache(account: InstagramAccount, stat: InstagramStat) -> bool:
    has_post_rows = bool(account.posts)
    has_top_post_image = bool(stat.top_post_image_url)
    has_engagement_metrics = stat.avg_likes > 0 or stat.avg_comments > 0 or stat.avg_views > 0
    return has_post_rows and has_top_post_image and has_engagement_metrics


def _profile_identifier_from_token(token: str, fallback_username: str) -> str:
    if token.startswith(PUBLIC_TOKEN_PREFIX):
        return token.removeprefix(PUBLIC_TOKEN_PREFIX)
    if token.startswith(LEGACY_PUBLIC_TOKEN_PREFIX):
        return token.removeprefix(LEGACY_PUBLIC_TOKEN_PREFIX)
    return fallback_username


def _set_session_cookie(response: Response, user_id, settings: Settings) -> None:
    cookie_options = auth_cookie_options(settings)
    response.set_cookie(
        SESSION_COOKIE_NAME,
        create_session_token(user_id, settings.session_secret),
        httponly=True,
        secure=bool(cookie_options["secure"]),
        samesite=str(cookie_options["samesite"]),
        max_age=60 * 60 * 24 * 14,
    )


@router.post("/public/import", response_model=SyncResponse)
async def import_public_instagram(
    payload: PublicInstagramImportRequest,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> SyncResponse:
    cached_account = get_account_by_username(db, _cache_username(payload.identifier))
    if cached_account is not None:
        cached = _cached_sync_response(db, cached_account)
        if cached is not None:
            _set_session_cookie(response, cached_account.user_id, settings)
            return cached

    provider = _profile_provider(settings)
    try:
        snapshot = await provider.fetch_public_profile(payload.identifier)
    except ProviderConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    user = upsert_user_for_instagram(db, snapshot.account)
    encrypted_token = encrypt_token(f"{PUBLIC_TOKEN_PREFIX}{snapshot.account.username}", settings.token_encryption_key)
    account = upsert_instagram_account(db, user.id, snapshot.account, encrypted_token)
    rate = engagement_rate(snapshot.stats.avg_likes, snapshot.stats.avg_comments, snapshot.stats.followers_count)
    stat = create_stats_snapshot(db, account.id, snapshot.stats, rate)
    replace_posts(db, account.id, snapshot.posts)
    building = upsert_building(db, account.id, generate_building(snapshot.account, snapshot.stats))
    db.commit()
    db.refresh(building)

    _set_session_cookie(response, user.id, settings)
    return SyncResponse(stats=InstagramStatsResponse.model_validate(stat), building=serialize_building(building))


@router.post("/sync", response_model=SyncResponse)
async def sync_instagram(
    user=Depends(require_current_user),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> SyncResponse:
    account = get_account_by_user_id(db, user.id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cached public profile")

    token = decrypt_token(account.access_token_encrypted, settings.token_encryption_key)
    cached = _cached_sync_response(db, account)
    if cached is not None:
        return cached

    provider = _profile_provider(settings)
    try:
        snapshot = await provider.fetch_public_profile(_profile_identifier_from_token(token, account.username))
    except ProviderConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    account_data = snapshot.account
    stats_data = snapshot.stats
    account.username = account_data.username
    account.profile_picture_url = account_data.profile_picture_url
    account.account_type = account_data.account_type
    account.category = account_data.category
    rate = engagement_rate(stats_data.avg_likes, stats_data.avg_comments, stats_data.followers_count)
    stat = create_stats_snapshot(db, account.id, stats_data, rate)
    replace_posts(db, account.id, snapshot.posts)
    building = upsert_building(db, account.id, generate_building(account_data, stats_data))
    db.commit()
    db.refresh(building)
    return SyncResponse(stats=InstagramStatsResponse.model_validate(stat), building=serialize_building(building))


@router.get("/me/stats", response_model=InstagramStatsResponse)
def my_stats(user=Depends(require_current_user), db: Session = Depends(get_db)) -> InstagramStatsResponse:
    account = get_account_by_user_id(db, user.id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cached public profile")
    stat = latest_stats(db, account.id)
    if stat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Instagram stats synced")
    return InstagramStatsResponse.model_validate(stat)
