import asyncio

from app.config import get_settings
from app.database import SessionLocal
from app.repositories.city_repo import upsert_building
from app.repositories.instagram_repo import create_stats_snapshot, latest_stats, upsert_instagram_account
from app.repositories.user_repo import upsert_user_for_instagram
from app.services.city_generator import engagement_rate, generate_building
from app.services.instagram.mock_provider import MockInstagramProvider
from app.services.token_service import encrypt_token


SEED_CODES = [
    "tech-city",
    "fashion-arcade",
    "food-court",
    "travel-terminal",
    "gaming-neon",
    "music-hall",
    "art-museum",
    "daily-creator",
    "startup-studio",
    "luxury-style",
    "urban-eats",
    "global-roamer",
    "stream-player",
    "indie-sound",
    "gallery-maker",
    "modern-profile",
]


async def seed() -> None:
    settings = get_settings()
    provider = MockInstagramProvider(settings.frontend_url, settings.backend_url)
    db = SessionLocal()
    try:
        for code in SEED_CODES:
            token = await provider.exchange_code(code)
            account_data = await provider.fetch_account(token)
            stats_data = await provider.fetch_stats(token)
            user = upsert_user_for_instagram(db, account_data)
            encrypted = encrypt_token(token, settings.token_encryption_key)
            account = upsert_instagram_account(db, user.id, account_data, encrypted)
            rate = engagement_rate(stats_data.avg_likes, stats_data.avg_comments, stats_data.followers_count)
            if latest_stats(db, account.id) is None:
                create_stats_snapshot(db, account.id, stats_data, rate)
            upsert_building(db, account.id, generate_building(account_data, stats_data))
        db.commit()
    finally:
        db.close()


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
