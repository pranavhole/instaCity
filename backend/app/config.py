from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://redis:6379/0"
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    backend_cors_origins: str = "http://localhost:3000"
    apify_api_token: str | None = None
    apify_actor_id: str = "apify/instagram-scraper"
    apify_results_limit: int = 12
    session_secret: str = "change-me"
    token_encryption_key: str = "local-dev-token-key-32-bytes-long"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
