import math
from dataclasses import dataclass

from app.services.instagram.base import InstagramAccountData, InstagramStatsData


@dataclass(frozen=True)
class GeneratedBuilding:
    building_type: str
    district: str
    height: float
    width: float
    depth: float
    floors: int
    glow_intensity: float
    material_style: str
    position_x: float
    position_y: float
    position_z: float
    color_palette: list[str]


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def engagement_rate(avg_likes: int, avg_comments: int, followers: int) -> float:
    if followers <= 0:
        return 0
    return round(((avg_likes + avg_comments) / followers) * 100, 2)


def building_type_for_followers(followers: int) -> str:
    if followers < 1_000:
        return "Small House"
    if followers < 10_000:
        return "Creator Studio"
    if followers < 50_000:
        return "Apartment Tower"
    if followers < 250_000:
        return "Skyscraper"
    if followers < 1_000_000:
        return "Landmark Tower"
    return "Iconic Mega Tower"


def district_for_category(category: str | None) -> str:
    value = (category or "").lower()
    if any(word in value for word in ["tech", "software", "startup"]):
        return "Tech"
    if any(word in value for word in ["fashion", "style", "model"]):
        return "Fashion"
    if any(word in value for word in ["food", "cook", "cafe", "restaurant"]):
        return "Food"
    if any(word in value for word in ["travel", "hotel", "airport"]):
        return "Travel"
    if any(word in value for word in ["gaming", "game", "esports"]):
        return "Gaming"
    if any(word in value for word in ["music", "concert", "artist band"]):
        return "Music"
    if any(word in value for word in ["art", "museum", "gallery", "visual"]):
        return "Art"
    return "Default"


def material_style_for_engagement(rate: float) -> str:
    if rate >= 8:
        return "premium-glass"
    if rate >= 4:
        return "polished-metal"
    if rate >= 2:
        return "clean-concrete"
    return "matte"


def palette_for_district(district: str) -> list[str]:
    palettes = {
        "Tech": ["#ff7a45", "#ff2f87", "#111326"],
        "Fashion": ["#ff2f87", "#7c2be8", "#111326"],
        "Food": ["#ffb15c", "#ff7a45", "#1a1d33"],
        "Travel": ["#b238d8", "#ff7a45", "#090b18"],
        "Gaming": ["#7c2be8", "#ff2f87", "#050712"],
        "Music": ["#ff4fb0", "#b238d8", "#111326"],
        "Art": ["#c45cff", "#ff2f87", "#1a1d33"],
        "Default": ["#ff2f87", "#7c2be8", "#111326"],
    }
    return palettes.get(district, palettes["Default"])


CITY_BLOCK_SPACING = 72
CITY_BLOCKS_PER_ROW = 5


def block_position_for_index(index: int) -> tuple[float, float]:
    safe_index = max(0, index)
    column = safe_index % CITY_BLOCKS_PER_ROW
    row = safe_index // CITY_BLOCKS_PER_ROW
    centered_column = column - ((CITY_BLOCKS_PER_ROW - 1) / 2)
    return centered_column * CITY_BLOCK_SPACING, row * CITY_BLOCK_SPACING


def generate_building(account: InstagramAccountData, stats: InstagramStatsData) -> GeneratedBuilding:
    followers = stats.followers_count
    height = round(clamp(math.log10(followers + 1) * 8, 4, 80), 2)
    width = round(clamp(math.log10(stats.avg_likes + 1) * 3, 3, 18), 2)
    floors = int(clamp(stats.media_count / 10, 1, 60))
    glow = round(clamp(math.log10(stats.avg_views + 1) / 6, 0.1, 1), 2)
    rate = engagement_rate(stats.avg_likes, stats.avg_comments, followers)
    district = district_for_category(account.category)
    x, z = block_position_for_index(0)
    return GeneratedBuilding(
        building_type=building_type_for_followers(followers),
        district=district,
        height=height,
        width=width,
        depth=width,
        floors=floors,
        glow_intensity=glow,
        material_style=material_style_for_engagement(rate),
        position_x=x,
        position_y=height / 2,
        position_z=z,
        color_palette=palette_for_district(district),
    )
