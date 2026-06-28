import uuid
from collections.abc import Sequence
from datetime import datetime, timezone
from typing import TypeVar

from sqlalchemy.orm import Session

from app.models import InstagramAccount, InstagramPost, InstagramStat
from app.services.instagram.base import InstagramAccountData, InstagramPostData, InstagramStatsData

StatsSnapshot = TypeVar("StatsSnapshot")


def get_account_by_user_id(db: Session, user_id: uuid.UUID) -> InstagramAccount | None:
    return db.query(InstagramAccount).filter(InstagramAccount.user_id == user_id).one_or_none()


def get_account_by_instagram_id(db: Session, instagram_user_id: str) -> InstagramAccount | None:
    return (
        db.query(InstagramAccount)
        .filter(InstagramAccount.instagram_user_id == instagram_user_id)
        .one_or_none()
    )


def get_account_by_username(db: Session, username: str) -> InstagramAccount | None:
    return (
        db.query(InstagramAccount)
        .filter(InstagramAccount.username == username)
        .one_or_none()
    )


def upsert_instagram_account(
    db: Session,
    user_id: uuid.UUID,
    account_data: InstagramAccountData,
    encrypted_token: str,
) -> InstagramAccount:
    account = get_account_by_instagram_id(db, account_data.instagram_user_id) or get_account_by_username(db, account_data.username)
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
        account.instagram_user_id = account_data.instagram_user_id
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
        top_post_image_url=stats_data.top_post_image_url,
        top_post_url=stats_data.top_post_url,
        engagement_rate=rate,
    )
    db.add(stat)
    account = db.get(InstagramAccount, account_id)
    if account:
        account.last_synced_at = datetime.now(timezone.utc)
    db.flush()
    return stat


def replace_posts(db: Session, account_id: uuid.UUID, posts: list[InstagramPostData]) -> list[InstagramPost]:
    db.query(InstagramPost).filter(InstagramPost.instagram_account_id == account_id).delete()
    rows = [
        InstagramPost(
            instagram_account_id=account_id,
            shortcode=post.shortcode,
            url=post.url,
            image_url=post.image_url,
            caption=post.caption,
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            video_view_count=post.video_view_count,
            taken_at=post.taken_at,
            raw_data=post.raw_data,
        )
        for post in posts
    ]
    db.add_all(rows)
    db.flush()
    return rows


def preferred_stats_snapshot(stats: Sequence[StatsSnapshot]) -> StatsSnapshot | None:
    if not stats:
        return None
    for stat in stats:
        if _has_complete_engagement_stats(stat):
            return stat
    return stats[0]


def _has_complete_engagement_stats(stat) -> bool:
    has_top_post_image = bool(getattr(stat, "top_post_image_url", None))
    has_engagement_metrics = (
        getattr(stat, "avg_likes", 0) > 0
        or getattr(stat, "avg_comments", 0) > 0
        or getattr(stat, "avg_views", 0) > 0
    )
    return has_top_post_image and has_engagement_metrics


def latest_stats(db: Session, account_id: uuid.UUID) -> InstagramStat | None:
    stats = (
        db.query(InstagramStat)
        .filter(InstagramStat.instagram_account_id == account_id)
        .order_by(InstagramStat.created_at.desc())
        .all()
    )
    return preferred_stats_snapshot(stats)
