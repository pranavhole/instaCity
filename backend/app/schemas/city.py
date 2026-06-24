from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.instagram import InstagramStatsResponse


class CityBuildingResponse(BaseModel):
    id: UUID
    instagram_account_id: UUID
    username: str
    profile_picture_url: str | None
    category: str | None
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
    created_at: datetime
    updated_at: datetime
    stats: InstagramStatsResponse | None


class SyncResponse(BaseModel):
    stats: InstagramStatsResponse
    building: CityBuildingResponse
