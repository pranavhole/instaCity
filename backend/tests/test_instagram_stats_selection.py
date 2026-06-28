import os
from types import SimpleNamespace

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://instacity:instacity@localhost:5432/instacity")

from app.repositories.instagram_repo import preferred_stats_snapshot


def test_preferred_stats_snapshot_uses_complete_engagement_before_newer_zero_snapshot() -> None:
    newer_zero = SimpleNamespace(
        avg_likes=0,
        avg_comments=0,
        avg_views=0,
        top_post_image_url=None,
    )
    older_complete = SimpleNamespace(
        avg_likes=188,
        avg_comments=5,
        avg_views=0,
        top_post_image_url="https://example.com/top.jpg",
    )

    assert preferred_stats_snapshot([newer_zero, older_complete]) is older_complete


def test_preferred_stats_snapshot_falls_back_to_latest_when_no_complete_snapshot_exists() -> None:
    newer_zero = SimpleNamespace(
        avg_likes=0,
        avg_comments=0,
        avg_views=0,
        top_post_image_url=None,
    )
    older_zero = SimpleNamespace(
        avg_likes=0,
        avg_comments=0,
        avg_views=0,
        top_post_image_url=None,
    )

    assert preferred_stats_snapshot([newer_zero, older_zero]) is newer_zero
