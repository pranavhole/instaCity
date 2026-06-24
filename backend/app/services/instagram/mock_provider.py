import hashlib
from urllib.parse import urlencode

from app.services.instagram.base import InstagramAccountData, InstagramStatsData


MOCK_CATEGORIES = ["Tech", "Fashion", "Food", "Travel", "Gaming", "Music", "Art", "Default"]


class MockInstagramProvider:
    def __init__(self, frontend_url: str, backend_url: str = "http://localhost:8000") -> None:
        self.frontend_url = frontend_url.rstrip("/")
        self.backend_url = backend_url.rstrip("/")

    def get_login_url(self, state: str) -> str:
        query = urlencode({"code": "local-user", "state": state, "provider": "mock"})
        return f"{self.backend_url}/auth/instagram/callback?{query}"

    async def exchange_code(self, code: str) -> str:
        digest = hashlib.sha256(code.encode("utf-8")).hexdigest()[:18]
        return f"mock-token-{digest}"

    async def fetch_account(self, access_token: str) -> InstagramAccountData:
        seed = self._seed(access_token)
        category = MOCK_CATEGORIES[seed % len(MOCK_CATEGORIES)]
        username = f"creator_{seed % 100000:05d}"
        return InstagramAccountData(
            instagram_user_id=f"ig_{seed}",
            username=username,
            profile_picture_url=f"https://api.dicebear.com/8.x/initials/svg?seed={username}",
            account_type="CREATOR" if seed % 2 else "BUSINESS",
            category=category,
        )

    async def fetch_stats(self, access_token: str) -> InstagramStatsData:
        seed = self._seed(access_token)
        followers = [640, 3200, 14500, 82000, 470000, 1_450_000][seed % 6]
        avg_likes = max(12, int(followers * (0.025 + (seed % 18) / 1000)))
        avg_comments = max(2, int(avg_likes * (0.035 + (seed % 7) / 200)))
        avg_views = max(avg_likes * 4, int(followers * (0.45 + (seed % 25) / 100)))
        return InstagramStatsData(
            followers_count=followers,
            follows_count=120 + seed % 4000,
            media_count=24 + seed % 640,
            avg_likes=avg_likes,
            avg_comments=avg_comments,
            avg_views=avg_views,
            reels_count=seed % 48,
        )

    @staticmethod
    def _seed(value: str) -> int:
        return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:12], 16)
