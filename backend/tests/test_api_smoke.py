import os
import uuid

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://instacity:instacity@localhost:5432/instacity")

from app.config import Settings, get_settings
from app.main import app
from app.services.instagram.base import (
    InstagramAccountData,
    InstagramPostData,
    InstagramProfileSnapshot,
    InstagramStatsData,
)


client = TestClient(app)


def production_settings() -> Settings:
    return Settings(
        database_url="postgresql+psycopg://instacity:instacity@localhost:5432/instacity",
        frontend_url="https://frontend.example.com",
        backend_url="https://backend.example.com",
        backend_cors_origins="https://frontend.example.com",
        apify_api_token="server-token",
        session_secret="test-session-secret",
        token_encryption_key="test-token-key-32-bytes-long",
    )


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_instagram_oauth_login_route_is_removed() -> None:
    response = client.get("/auth/instagram/login")

    assert response.status_code == 404


def test_public_instagram_import_sets_cross_site_session_cookie(monkeypatch) -> None:
    identifier = f"public_creator_{uuid.uuid4().hex}"

    class FakeApifyProvider:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def fetch_public_profile(self, identifier: str) -> InstagramProfileSnapshot:
            return InstagramProfileSnapshot(
                account=InstagramAccountData(
                    instagram_user_id=f"apify-{identifier}",
                    username=identifier,
                    profile_picture_url="https://example.com/profile.jpg",
                    account_type="APIFY_PUBLIC",
                    category="Public profile",
                ),
                stats=InstagramStatsData(
                    followers_count=0,
                    follows_count=0,
                    media_count=1,
                    avg_likes=50,
                    avg_comments=5,
                    avg_views=100,
                    reels_count=0,
                    top_post_image_url="https://example.com/top.jpg",
                    top_post_url="https://www.instagram.com/p/top/",
                ),
                posts=[
                    InstagramPostData(
                        shortcode="top",
                        url="https://www.instagram.com/p/top/",
                        image_url="https://example.com/top.jpg",
                        caption="top post",
                        likes_count=50,
                        comments_count=5,
                        video_view_count=100,
                    )
                ],
            )

    monkeypatch.setattr("app.routers.instagram.ApifyInstagramProvider", FakeApifyProvider, raising=False)
    app.dependency_overrides[get_settings] = production_settings
    try:
        response = client.post("/instagram/public/import", json={"identifier": identifier})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["building"]["username"] == identifier
    session_cookie = [
        cookie for cookie in response.headers.get_list("set-cookie") if cookie.startswith("instacity_session=")
    ][0].lower()
    assert "samesite=none" in session_cookie
    assert "secure" in session_cookie


def test_public_instagram_import_returns_cached_profile_without_second_apify_call(monkeypatch) -> None:
    identifier = f"cache_creator_{uuid.uuid4().hex}"
    calls = 0

    class FakeApifyProvider:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def fetch_public_profile(self, requested_identifier: str) -> InstagramProfileSnapshot:
            nonlocal calls
            calls += 1
            return InstagramProfileSnapshot(
                account=InstagramAccountData(
                    instagram_user_id=f"apify-{requested_identifier}",
                    username=requested_identifier,
                    profile_picture_url="https://example.com/profile.jpg",
                    account_type="APIFY_PUBLIC",
                    category="Public profile",
                ),
                stats=InstagramStatsData(
                    followers_count=1000,
                    follows_count=100,
                    media_count=2,
                    avg_likes=250,
                    avg_comments=20,
                    avg_views=5000,
                    reels_count=1,
                    top_post_image_url="https://example.com/viral.jpg",
                    top_post_url="https://www.instagram.com/p/viral/",
                ),
                posts=[
                    InstagramPostData(
                        shortcode="viral",
                        url="https://www.instagram.com/p/viral/",
                        image_url="https://example.com/viral.jpg",
                        caption="viral post",
                        likes_count=250,
                        comments_count=20,
                        video_view_count=5000,
                    )
                ],
            )

    monkeypatch.setattr("app.routers.instagram.ApifyInstagramProvider", FakeApifyProvider, raising=False)
    app.dependency_overrides[get_settings] = production_settings
    try:
        first = client.post("/instagram/public/import", json={"identifier": identifier})
        second = client.post("/instagram/public/import", json={"identifier": identifier})
    finally:
        app.dependency_overrides.clear()

    assert first.status_code == 200
    assert second.status_code == 200
    assert calls == 1
    assert second.json()["stats"]["top_post_image_url"] == "https://example.com/viral.jpg"


def test_public_instagram_import_returns_zero_follower_engagement_cache_without_slow_refresh(monkeypatch) -> None:
    identifier = f"zero_followers_creator_{uuid.uuid4().hex}"
    calls = 0

    class FakeApifyProvider:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def fetch_public_profile(self, requested_identifier: str) -> InstagramProfileSnapshot:
            nonlocal calls
            calls += 1
            return InstagramProfileSnapshot(
                account=InstagramAccountData(
                    instagram_user_id=f"apify-{requested_identifier}",
                    username=requested_identifier,
                    profile_picture_url="https://example.com/profile.jpg",
                    account_type="APIFY_PUBLIC",
                    category="Public profile",
                ),
                stats=InstagramStatsData(
                    followers_count=0,
                    follows_count=0,
                    media_count=1,
                    avg_likes=188,
                    avg_comments=5,
                    avg_views=0,
                    reels_count=0,
                    top_post_image_url="https://example.com/top.jpg",
                    top_post_url="https://www.instagram.com/p/top/",
                ),
                posts=[
                    InstagramPostData(
                        shortcode="top",
                        url="https://www.instagram.com/p/top/",
                        image_url="https://example.com/top.jpg",
                        caption="top post",
                        likes_count=188,
                        comments_count=5,
                        video_view_count=0,
                    )
                ],
            )

    monkeypatch.setattr("app.routers.instagram.ApifyInstagramProvider", FakeApifyProvider, raising=False)
    app.dependency_overrides[get_settings] = production_settings
    try:
        stale_response = client.post("/instagram/public/import", json={"identifier": identifier})
        fresh_response = client.post("/instagram/public/import", json={"identifier": identifier})
    finally:
        app.dependency_overrides.clear()

    assert stale_response.status_code == 200
    assert fresh_response.status_code == 200
    assert calls == 1
    assert fresh_response.json()["stats"]["followers_count"] == 0
    assert fresh_response.json()["stats"]["avg_likes"] == 188
    assert fresh_response.json()["stats"]["avg_comments"] == 5


def test_public_instagram_import_refreshes_stale_zero_metric_cache(monkeypatch) -> None:
    identifier = f"stale_creator_{uuid.uuid4().hex}"
    calls = 0

    class FakeApifyProvider:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def fetch_public_profile(self, requested_identifier: str) -> InstagramProfileSnapshot:
            nonlocal calls
            calls += 1
            stale = calls == 1
            return InstagramProfileSnapshot(
                account=InstagramAccountData(
                    instagram_user_id=f"apify-{requested_identifier}",
                    username=requested_identifier,
                    profile_picture_url="https://example.com/profile.jpg",
                    account_type="APIFY_PUBLIC",
                    category="Public profile",
                ),
                stats=InstagramStatsData(
                    followers_count=1000,
                    follows_count=0,
                    media_count=3,
                    avg_likes=0 if stale else 150,
                    avg_comments=0 if stale else 12,
                    avg_views=0 if stale else 2400,
                    reels_count=0 if stale else 1,
                    top_post_image_url=None if stale else "https://example.com/fresh.jpg",
                    top_post_url=None if stale else "https://www.instagram.com/p/fresh/",
                ),
                posts=[]
                if stale
                else [
                    InstagramPostData(
                        shortcode="fresh",
                        url="https://www.instagram.com/p/fresh/",
                        image_url="https://example.com/fresh.jpg",
                        caption="fresh post",
                        likes_count=150,
                        comments_count=12,
                        video_view_count=2400,
                    )
                ],
            )

    monkeypatch.setattr("app.routers.instagram.ApifyInstagramProvider", FakeApifyProvider, raising=False)
    app.dependency_overrides[get_settings] = production_settings
    try:
        stale_response = client.post("/instagram/public/import", json={"identifier": identifier})
        fresh_response = client.post("/instagram/public/import", json={"identifier": identifier})
    finally:
        app.dependency_overrides.clear()

    assert stale_response.status_code == 200
    assert fresh_response.status_code == 200
    assert calls == 2
    assert fresh_response.json()["stats"]["avg_likes"] == 150
    assert fresh_response.json()["stats"]["avg_comments"] == 12
    assert fresh_response.json()["stats"]["top_post_image_url"] == "https://example.com/fresh.jpg"


def test_users_me_requires_session() -> None:
    response = client.get("/users/me")

    assert response.status_code == 401


def public_import_settings_without_token() -> Settings:
    return Settings(
        database_url="postgresql+psycopg://instacity:instacity@localhost:5432/instacity",
        frontend_url="https://frontend.example.com",
        backend_url="https://backend.example.com",
        backend_cors_origins="https://frontend.example.com",
        apify_api_token=None,
        session_secret="test-session-secret",
        token_encryption_key="test-token-key-32-bytes-long",
    )


def test_public_instagram_import_requires_server_token() -> None:
    app.dependency_overrides[get_settings] = public_import_settings_without_token
    try:
        response = client.post("/instagram/public/import", json={"identifier": f"uncached_{uuid.uuid4().hex}"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json()["detail"] == "Public profile import requires APIFY_API_TOKEN on the backend."


def test_city_buildings_returns_list(monkeypatch) -> None:
    monkeypatch.setattr("app.routers.city.list_city_buildings", lambda db: [])

    response = client.get("/city/buildings")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
