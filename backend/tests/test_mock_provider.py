import pytest

from app.services.instagram.mock_provider import MockInstagramProvider


@pytest.mark.asyncio
async def test_mock_provider_returns_deterministic_account() -> None:
    provider = MockInstagramProvider(frontend_url="http://localhost:3000")

    token = await provider.exchange_code("local-user")
    first = await provider.fetch_account(token)
    second = await provider.fetch_account(token)

    assert first == second
    assert first.instagram_user_id
    assert first.username.startswith("creator_")
    assert first.account_type in {"BUSINESS", "CREATOR"}


@pytest.mark.asyncio
async def test_mock_provider_returns_normalized_non_negative_stats() -> None:
    provider = MockInstagramProvider(frontend_url="http://localhost:3000")

    token = await provider.exchange_code("local-user")
    stats = await provider.fetch_stats(token)

    assert stats.followers_count >= 0
    assert stats.follows_count >= 0
    assert stats.media_count >= 0
    assert stats.avg_likes >= 0
    assert stats.avg_comments >= 0
    assert stats.avg_views >= 0
    assert stats.reels_count >= 0


def test_mock_provider_login_url_targets_backend_callback() -> None:
    provider = MockInstagramProvider(frontend_url="http://localhost:3000")

    login_url = provider.get_login_url("state-123")

    assert "/auth/instagram/callback" in login_url
    assert "provider=mock" in login_url
    assert "state=state-123" in login_url
