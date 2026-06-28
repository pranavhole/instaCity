from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]


def test_backend_startup_does_not_seed_dummy_profiles() -> None:
    checked_files = [
        BACKEND_ROOT / "Dockerfile",
        BACKEND_ROOT / "railway.toml",
    ]

    for path in checked_files:
        content = path.read_text()
        assert "app.scripts.seed" not in content, f"{path} still seeds dummy profiles at startup"


def test_dummy_seed_modules_are_removed() -> None:
    removed_files = [
        BACKEND_ROOT / "app" / "scripts" / "seed.py",
        BACKEND_ROOT / "app" / "services" / "instagram" / "mock_provider.py",
    ]

    for path in removed_files:
        assert not path.exists(), f"{path} should not exist"


def test_cleanup_migration_removes_dummy_and_stale_cache_rows() -> None:
    migration = BACKEND_ROOT / "alembic" / "versions" / "20260628_0003_remove_dummy_and_stale_cache.py"
    content = migration.read_text()

    for username in ["tech-city", "design-avenue", "coffee-corner", "travel-tower"]:
        assert username in content

    assert "avg_likes = 0" in content
    assert "avg_comments = 0" in content
    assert "avg_views = 0" in content
    assert "top_post_image_url IS NULL" in content


def test_stale_zero_stats_cleanup_migration_is_present() -> None:
    migration = BACKEND_ROOT / "alembic" / "versions" / "20260629_0004_remove_stale_zero_stats.py"
    content = migration.read_text()

    for username in ["tech-city", "design-avenue", "coffee-corner", "travel-tower"]:
        assert username in content

    assert "DELETE FROM instagram_stats" in content
    assert "avg_likes = 0" in content
    assert "avg_comments = 0" in content
    assert "avg_views = 0" in content
    assert "top_post_image_url IS NULL" in content
