from app.models import CityBuilding, InstagramAccount, InstagramStat
from app.schemas.city import CityBuildingResponse
from app.schemas.instagram import InstagramStatsResponse


def serialize_stats(stat: InstagramStat | None) -> InstagramStatsResponse | None:
    if stat is None:
        return None
    return InstagramStatsResponse.model_validate(stat)


def latest_stat(account: InstagramAccount) -> InstagramStat | None:
    return account.stats[0] if account.stats else None


def serialize_building(building: CityBuilding) -> CityBuildingResponse:
    account = building.instagram_account
    return CityBuildingResponse(
        id=building.id,
        instagram_account_id=building.instagram_account_id,
        username=account.username,
        profile_picture_url=account.profile_picture_url,
        category=account.category,
        building_type=building.building_type,
        district=building.district,
        height=building.height,
        width=building.width,
        depth=building.depth,
        floors=building.floors,
        glow_intensity=building.glow_intensity,
        material_style=building.material_style,
        position_x=building.position_x,
        position_y=building.position_y,
        position_z=building.position_z,
        color_palette=building.color_palette,
        created_at=building.created_at,
        updated_at=building.updated_at,
        stats=serialize_stats(latest_stat(account)),
    )
