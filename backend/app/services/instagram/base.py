from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


class ProviderConfigurationError(RuntimeError):
    pass


@dataclass(frozen=True)
class InstagramAccountData:
    instagram_user_id: str
    username: str
    profile_picture_url: str | None
    account_type: str
    category: str | None


@dataclass(frozen=True)
class InstagramStatsData:
    followers_count: int
    follows_count: int
    media_count: int
    avg_likes: int
    avg_comments: int
    avg_views: int
    reels_count: int
    top_post_image_url: str | None = None
    top_post_url: str | None = None


@dataclass(frozen=True)
class InstagramPostData:
    shortcode: str
    url: str | None
    image_url: str | None
    caption: str | None
    likes_count: int
    comments_count: int
    video_view_count: int
    taken_at: datetime | None = None
    raw_data: dict | None = None


@dataclass(frozen=True)
class InstagramProfileSnapshot:
    account: InstagramAccountData
    stats: InstagramStatsData
    posts: list[InstagramPostData]


class InstagramProvider(Protocol):
    async def fetch_public_profile(self, identifier: str) -> InstagramProfileSnapshot:
        ...
