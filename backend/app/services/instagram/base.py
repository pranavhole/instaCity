from dataclasses import dataclass
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


class InstagramProvider(Protocol):
    def get_login_url(self, state: str) -> str:
        ...

    async def exchange_code(self, code: str) -> str:
        ...

    async def fetch_account(self, access_token: str) -> InstagramAccountData:
        ...

    async def fetch_stats(self, access_token: str) -> InstagramStatsData:
        ...
