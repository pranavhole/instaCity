import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import InstagramAccount, InstagramStat
from app.services.instagram.base import InstagramAccountData, InstagramStatsData


def get_account_by_user_id(db: Session, user_id: uuid.UUID) -> InstagramAccount | None:
    return db.query(InstagramAccount).filter(InstagramAccount.user_id == user_id).one_or_none()


def get_account_by_instagram_id(db: Session, instagram_user_id: str) -> InstagramAccount | None:
    return (
        db.query(InstagramAccount)
        .filter(InstagramAccount.instagram_user_id == instagram_user_id)
        .one_or_none()
    )


def upsert_instagram_account(
    db: Session,
    user_id: uuid.UUID,
    account_data: InstagramAccountData,
    encrypted_token: str,
) -> InstagramAccount:
    account = get_account_by_instagram_id(db, account_data.instagram_user_id)
    if account is None:
        account = InstagramAccount(
            user_id=user_id,
            instagram_user_id=account_data.instagram_user_id,
            username=account_data.username,
            profile_picture_url=account_data.profile_picture_url,
            account_type=account_data.account_type,
            category=account_data.category,
            access_token_encrypted=encrypted_token,
        )
        db.add(account)
    else:
        account.user_id = user_id
        account.username = account_data.username
        account.profile_picture_url = account_data.profile_picture_url
        account.account_type = account_data.account_type
        account.category = account_data.category
        account.access_token_encrypted = encrypted_token
    db.flush()
    return account


def create_stats_snapshot(
    db: Session,
    account_id: uuid.UUID,
    stats_data: InstagramStatsData,
    rate: float,
) -> InstagramStat:
    stat = InstagramStat(
        instagram_account_id=account_id,
        followers_count=stats_data.followers_count,
        follows_count=stats_data.follows_count,
        media_count=stats_data.media_count,
        avg_likes=stats_data.avg_likes,
        avg_comments=stats_data.avg_comments,
        avg_views=stats_data.avg_views,
        reels_count=stats_data.reels_count,
        engagement_rate=rate,
    )
    db.add(stat)
    account = db.get(InstagramAccount, account_id)
    if account:
        account.last_synced_at = datetime.now(timezone.utc)
    db.flush()
    return stat


def latest_stats(db: Session, account_id: uuid.UUID) -> InstagramStat | None:
    return (
        db.query(InstagramStat)
        .filter(InstagramStat.instagram_account_id == account_id)
        .order_by(InstagramStat.created_at.desc())
        .first()
    )
