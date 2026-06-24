import uuid

from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import CityBuilding, InstagramAccount
from app.services.city_generator import GeneratedBuilding


def upsert_building(db: Session, account_id: uuid.UUID, generated: GeneratedBuilding) -> CityBuilding:
    building = (
        db.query(CityBuilding)
        .filter(CityBuilding.instagram_account_id == account_id)
        .one_or_none()
    )
    data = {
        "building_type": generated.building_type,
        "district": generated.district,
        "height": generated.height,
        "width": generated.width,
        "depth": generated.depth,
        "floors": generated.floors,
        "glow_intensity": generated.glow_intensity,
        "material_style": generated.material_style,
        "position_x": generated.position_x,
        "position_y": generated.position_y,
        "position_z": generated.position_z,
        "color_palette": generated.color_palette,
    }
    if building is None:
        building = CityBuilding(instagram_account_id=account_id, **data)
        db.add(building)
    else:
        for key, value in data.items():
            setattr(building, key, value)
    db.flush()
    return building


def list_city_buildings(db: Session) -> list[CityBuilding]:
    return (
        db.query(CityBuilding)
        .join(CityBuilding.instagram_account)
        .options(
            joinedload(CityBuilding.instagram_account).selectinload(InstagramAccount.stats),
        )
        .order_by(CityBuilding.created_at.asc())
        .all()
    )


def get_city_building(db: Session, building_id: uuid.UUID) -> CityBuilding | None:
    return (
        db.query(CityBuilding)
        .options(joinedload(CityBuilding.instagram_account).selectinload(InstagramAccount.stats))
        .filter(CityBuilding.id == building_id)
        .one_or_none()
    )


def get_building_by_account_id(db: Session, account_id: uuid.UUID) -> CityBuilding | None:
    return (
        db.query(CityBuilding)
        .options(selectinload(CityBuilding.instagram_account).selectinload(InstagramAccount.stats))
        .filter(CityBuilding.instagram_account_id == account_id)
        .one_or_none()
    )
