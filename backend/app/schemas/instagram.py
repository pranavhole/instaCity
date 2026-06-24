from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InstagramAccountResponse(BaseModel):
    id: UUID
    username: str
    profile_picture_url: str | None
    account_type: str
    category: str | None
    last_synced_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class InstagramStatsResponse(BaseModel):
    followers_count: int
    follows_count: int
    media_count: int
    avg_likes: int
    avg_comments: int
    avg_views: int
    reels_count: int
    engagement_rate: float

    model_config = ConfigDict(from_attributes=True)
