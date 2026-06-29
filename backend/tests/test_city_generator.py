from app.services.city_generator import (
    block_position_for_index,
    building_type_for_followers,
    district_for_category,
    engagement_rate,
    generate_building,
)
from app.services.instagram.base import InstagramAccountData, InstagramStatsData


def account(instagram_user_id: str = "creator-001", category: str | None = "Tech") -> InstagramAccountData:
    return InstagramAccountData(
        instagram_user_id=instagram_user_id,
        username="creator",
        profile_picture_url=None,
        account_type="BUSINESS",
        category=category,
    )


def stats(
    followers: int = 12500,
    media_count: int = 160,
    avg_likes: int = 900,
    avg_comments: int = 45,
    avg_views: int = 12000,
    reels_count: int = 14,
) -> InstagramStatsData:
    return InstagramStatsData(
        followers_count=followers,
        follows_count=400,
        media_count=media_count,
        avg_likes=avg_likes,
        avg_comments=avg_comments,
        avg_views=avg_views,
        reels_count=reels_count,
    )


def test_building_tier_thresholds() -> None:
    assert building_type_for_followers(999) == "Small House"
    assert building_type_for_followers(1_000) == "Creator Studio"
    assert building_type_for_followers(10_000) == "Apartment Tower"
    assert building_type_for_followers(50_000) == "Skyscraper"
    assert building_type_for_followers(250_000) == "Landmark Tower"
    assert building_type_for_followers(1_000_000) == "Iconic Mega Tower"


def test_metric_formulas_are_clamped() -> None:
    generated = generate_building(
        account(instagram_user_id="tiny"),
        stats(followers=0, media_count=0, avg_likes=0, avg_views=0),
    )

    assert generated.height == 4
    assert generated.width == 3
    assert generated.depth == 3
    assert generated.floors == 1
    assert generated.glow_intensity == 0.1

    generated = generate_building(
        account(instagram_user_id="huge"),
        stats(
            followers=10_000_000_000,
            media_count=10_000,
            avg_likes=10_000_000,
            avg_views=10_000_000_000,
        ),
    )

    assert generated.height == 80
    assert generated.width == 18
    assert generated.depth == 18
    assert generated.floors == 60
    assert generated.glow_intensity == 1


def test_zero_followers_engagement_is_zero() -> None:
    assert engagement_rate(avg_likes=50, avg_comments=10, followers=0) == 0


def test_city_block_positions_grow_row_by_row() -> None:
    assert block_position_for_index(0) == (-144, 0)
    assert block_position_for_index(1) == (-72, 0)
    assert block_position_for_index(2) == (0, 0)
    assert block_position_for_index(3) == (72, 0)
    assert block_position_for_index(4) == (144, 0)
    assert block_position_for_index(5) == (-144, 72)


def test_generated_building_defaults_to_first_city_block() -> None:
    generated = generate_building(account(instagram_user_id="stable-id"), stats())

    assert (generated.position_x, generated.position_z) == block_position_for_index(0)


def test_district_maps_category_keywords() -> None:
    assert district_for_category("software creator") == "Tech"
    assert district_for_category("fashion model") == "Fashion"
    assert district_for_category("home cooking") == "Food"
    assert district_for_category("travel blogger") == "Travel"
    assert district_for_category("gaming video creator") == "Gaming"
    assert district_for_category("independent music") == "Music"
    assert district_for_category("visual artist") == "Art"
    assert district_for_category(None) == "Default"


def test_generated_building_palette_uses_oinsta_city_brand_colors() -> None:
    generated = generate_building(account(category="fashion model"), stats())

    assert "#ff2f87" in generated.color_palette
    assert "#7c2be8" in generated.color_palette or "#ff7a45" in generated.color_palette
