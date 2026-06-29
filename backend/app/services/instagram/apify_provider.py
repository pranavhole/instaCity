from __future__ import annotations

from datetime import datetime
from typing import Any
from urllib.parse import urlparse

import httpx

from app.services.instagram.base import (
    InstagramAccountData,
    InstagramPostData,
    InstagramProfileSnapshot,
    InstagramStatsData,
    ProviderConfigurationError,
)


APIFY_API_BASE_URL = "https://api.apify.com/v2"
DEFAULT_ACTOR_ID = "apify/instagram-scraper"
FALLBACK_POSTS_LIMIT = 12


class ApifyInstagramProvider:
    def __init__(
        self,
        api_token: str | None,
        actor_id: str = DEFAULT_ACTOR_ID,
        results_limit: int = 100,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self.api_token = api_token
        self.actor_id = actor_id
        self.results_limit = results_limit
        self.http_client = http_client

    async def fetch_public_profile(self, identifier: str) -> InstagramProfileSnapshot:
        if not self.api_token:
            raise ProviderConfigurationError("Public profile import requires APIFY_API_TOKEN on the backend.")

        direct_url = self._direct_profile_url(identifier)
        details = await self._profile_details(direct_url)
        items = self._latest_posts_from_details(details)
        if not items:
            try:
                items = await self._run_actor(direct_url, results_type="posts", results_limit=self.results_limit)
            except ProviderConfigurationError as exc:
                if self.results_limit <= FALLBACK_POSTS_LIMIT or not self._is_timeout_error(exc):
                    raise
                items = await self._run_actor(direct_url, results_type="posts", results_limit=FALLBACK_POSTS_LIMIT)
            if not items:
                raise ProviderConfigurationError("Apify Instagram scraper returned no posts for that profile.")
            items = self._usable_items_or_raise(items)

        profile_items = [details, *items] if details else items

        username = self._first_string(profile_items, "username", "ownerUsername") or self._username_from_identifier(identifier)
        profile_picture = self._first_string(profile_items, "profilePicUrl", "profilePicUrlHD", "ownerProfilePicUrl")
        account_id = self._string(details, "id") if details else None
        account_id = account_id or self._first_string(items, "ownerId", "owner_id") or f"apify:{username}"
        followers = self._first_int(profile_items, "followersCount", "ownerFollowersCount", "followers_count") or 0
        follows = self._first_int(profile_items, "followsCount", "followingCount", "follows_count") or 0
        media_count = self._first_int(profile_items, "postsCount", "ownerPostsCount", "mediaCount", "media_count") or len(items)
        posts = [self._post_from_item(item, index) for index, item in enumerate(items)]
        likes = [post.likes_count for post in posts]
        comments = [post.comments_count for post in posts]
        views = [post.video_view_count for post in posts]
        reels_count = sum(1 for item in items if self._is_video_or_reel(item))
        top_post = max(posts, key=self._viral_score)

        return InstagramProfileSnapshot(
            account=InstagramAccountData(
                instagram_user_id=account_id,
                username=username,
                profile_picture_url=profile_picture,
                account_type="APIFY_PUBLIC",
                category="Public profile",
            ),
            stats=InstagramStatsData(
                followers_count=followers,
                follows_count=follows,
                media_count=media_count,
                avg_likes=self._average(likes),
                avg_comments=self._average(comments),
                avg_views=self._average(views),
                reels_count=reels_count,
                top_post_image_url=top_post.image_url,
                top_post_url=top_post.url,
            ),
            posts=posts,
        )

    async def _profile_details(self, direct_url: str) -> dict[str, Any] | None:
        try:
            items = await self._run_actor(direct_url, results_type="details", results_limit=1)
        except ProviderConfigurationError:
            return None
        usable = [item for item in items if not item.get("error") and not item.get("errorDescription")]
        return usable[0] if usable else None

    @staticmethod
    def _latest_posts_from_details(details: dict[str, Any] | None) -> list[dict[str, Any]]:
        if not details:
            return []
        posts = details.get("latestPosts") or details.get("latest_posts")
        if not isinstance(posts, list):
            return []
        return [post for post in posts if isinstance(post, dict)]

    async def _run_actor(self, direct_url: str, results_type: str, results_limit: int) -> list[dict[str, Any]]:
        own_client = self.http_client is None
        client = self.http_client or httpx.AsyncClient(timeout=180)
        try:
            response = await client.post(
                self._run_sync_dataset_url(),
                params={
                    "token": self.api_token,
                    "clean": "true",
                    "format": "json",
                    "timeout": "120",
                },
                json={
                    "resultsType": results_type,
                    "directUrls": [direct_url],
                    "resultsLimit": results_limit,
                    "searchType": "hashtag",
                    "searchLimit": 10,
                },
            )
        except httpx.HTTPError as exc:
            raise ProviderConfigurationError(f"Apify Instagram scraper request failed: {exc}") from exc
        finally:
            if own_client:
                await client.aclose()

        if response.status_code >= 400:
            raise ProviderConfigurationError(f"Apify Instagram scraper returned {response.status_code}: {self._error_detail(response)}")

        try:
            payload = response.json()
        except ValueError as exc:
            raise ProviderConfigurationError("Apify Instagram scraper returned invalid JSON.") from exc

        if isinstance(payload, list):
            return [item for item in payload if isinstance(item, dict)]
        if isinstance(payload, dict) and isinstance(payload.get("items"), list):
            return [item for item in payload["items"] if isinstance(item, dict)]
        raise ProviderConfigurationError("Apify Instagram scraper returned an unexpected response.")

    @classmethod
    def _usable_items_or_raise(cls, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        usable = [item for item in items if not item.get("error") and not item.get("errorDescription")]
        if usable:
            return usable
        first_error = items[0] if items else {}
        detail = cls._string(first_error, "errorDescription", "error") or "Apify returned only error rows for that profile."
        raise ProviderConfigurationError(detail)

    def _run_sync_dataset_url(self) -> str:
        actor_path = self.actor_id.replace("/", "~")
        return f"{APIFY_API_BASE_URL}/acts/{actor_path}/run-sync-get-dataset-items"

    def _post_from_item(self, item: dict[str, Any], index: int) -> InstagramPostData:
        shortcode = self._string(item, "shortCode", "shortcode", "code", "id") or f"post-{index}"
        return InstagramPostData(
            shortcode=shortcode,
            url=self._string(item, "url", "postUrl"),
            image_url=self._image_url(item),
            caption=self._string(item, "caption", "text", "alt"),
            likes_count=self._int(item, "likesCount", "likeCount", "likes_count"),
            comments_count=self._int(item, "commentsCount", "comments_count"),
            video_view_count=self._int(item, "videoViewCount", "videoPlayCount", "video_view_count"),
            taken_at=self._datetime(item, "timestamp", "takenAt", "taken_at"),
            raw_data=item,
        )

    @classmethod
    def _direct_profile_url(cls, identifier: str) -> str:
        value = identifier.strip()
        if not value:
            raise ProviderConfigurationError("Enter an Instagram profile URL or username.")
        if value.startswith("http://") or value.startswith("https://"):
            return value
        username = value.removeprefix("@").strip().strip("/")
        return f"https://www.instagram.com/{username}/"

    @classmethod
    def _username_from_identifier(cls, identifier: str) -> str:
        value = identifier.strip().removeprefix("@").strip("/")
        if value.startswith("http://") or value.startswith("https://"):
            parsed = urlparse(value)
            segments = [segment for segment in parsed.path.split("/") if segment]
            return segments[0] if segments else "public_profile"
        return value or "public_profile"

    @classmethod
    def _first_string(cls, items: list[dict[str, Any]], *keys: str) -> str | None:
        for item in items:
            value = cls._string(item, *keys)
            if value:
                return value
        return None

    @classmethod
    def _first_int(cls, items: list[dict[str, Any]], *keys: str) -> int | None:
        for item in items:
            for key in keys:
                if key not in item:
                    continue
                return cls._coerce_int(item.get(key))
        return None

    @classmethod
    def _string(cls, item: dict[str, Any], *keys: str) -> str | None:
        for key in keys:
            value = item.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
            if isinstance(value, int):
                return str(value)
        return None

    @classmethod
    def _int(cls, item: dict[str, Any], *keys: str) -> int:
        for key in keys:
            if key in item:
                return cls._coerce_int(item.get(key))
        return 0

    @staticmethod
    def _coerce_int(value: Any) -> int:
        if isinstance(value, bool) or value is None:
            return 0
        if isinstance(value, int):
            return max(0, value)
        if isinstance(value, float):
            return max(0, int(value))
        if isinstance(value, str):
            try:
                return max(0, int(float(value.replace(",", ""))))
            except ValueError:
                return 0
        return 0

    @classmethod
    def _datetime(cls, item: dict[str, Any], *keys: str) -> datetime | None:
        value = cls._string(item, *keys)
        if not value:
            return None
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None

    @classmethod
    def _image_url(cls, item: dict[str, Any]) -> str | None:
        direct = cls._string(item, "displayUrl", "imageUrl", "thumbnailUrl", "firstImage")
        if direct:
            return direct
        images = item.get("images")
        if isinstance(images, list) and images:
            first = images[0]
            if isinstance(first, str):
                return first
            if isinstance(first, dict):
                return cls._string(first, "url", "src")
        return None

    @classmethod
    def _is_video_or_reel(cls, item: dict[str, Any]) -> bool:
        kind = " ".join(
            value.lower()
            for value in [
                cls._string(item, "type"),
                cls._string(item, "productType"),
                cls._string(item, "mediaType"),
            ]
            if value
        )
        return "video" in kind or "reel" in kind

    @staticmethod
    def _average(values: list[int]) -> int:
        if not values:
            return 0
        return int(sum(values) / len(values))

    @staticmethod
    def _is_timeout_error(exc: ProviderConfigurationError) -> bool:
        message = str(exc).lower()
        return "timed-out" in message or "timed out" in message or "timeout" in message

    @staticmethod
    def _viral_score(post: InstagramPostData) -> float:
        return post.likes_count + (post.comments_count * 4) + (post.video_view_count * 0.05)

    @staticmethod
    def _error_detail(response: httpx.Response) -> str:
        try:
            payload = response.json()
        except ValueError:
            return response.text[:300]
        if isinstance(payload, dict):
            message = payload.get("error") or payload.get("message")
            if isinstance(message, dict):
                return str(message.get("message") or message)
            if message:
                return str(message)
        return str(payload)[:300]
