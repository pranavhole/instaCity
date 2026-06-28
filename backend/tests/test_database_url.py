from app.database import normalize_database_url


def test_railway_postgres_url_uses_installed_psycopg_driver() -> None:
    url = "postgresql://user:pass@postgres.railway.internal:5432/railway"

    assert normalize_database_url(url) == "postgresql+psycopg://user:pass@postgres.railway.internal:5432/railway"


def test_explicit_sqlalchemy_driver_url_is_preserved() -> None:
    url = "postgresql+psycopg://user:pass@postgres:5432/railway"

    assert normalize_database_url(url) == url
