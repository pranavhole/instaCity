import os

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://instacity:instacity@localhost:5432/instacity")

from app.main import app


client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_mock_login_returns_redirect_url() -> None:
    response = client.get("/auth/instagram/login")

    assert response.status_code == 200
    assert response.json()["redirect_url"].startswith("http://localhost:8000/auth/instagram/callback")
    assert "instacity_oauth_state" in response.headers["set-cookie"]


def test_users_me_requires_session() -> None:
    response = client.get("/users/me")

    assert response.status_code == 401


def test_city_buildings_returns_list(monkeypatch) -> None:
    monkeypatch.setattr("app.routers.city.list_city_buildings", lambda db: [])

    response = client.get("/city/buildings")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
