import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.city_repo import get_building_by_account_id, get_city_building, list_city_buildings
from app.repositories.instagram_repo import get_account_by_user_id
from app.routers._serializers import serialize_building
from app.schemas.city import CityBuildingResponse
from app.utils.security import require_current_user

router = APIRouter(prefix="/city", tags=["city"])


@router.get("/buildings", response_model=list[CityBuildingResponse])
def buildings(db: Session = Depends(get_db)) -> list[CityBuildingResponse]:
    return [serialize_building(building) for building in list_city_buildings(db)]


@router.get("/buildings/{building_id}", response_model=CityBuildingResponse)
def building(building_id: uuid.UUID, db: Session = Depends(get_db)) -> CityBuildingResponse:
    item = get_city_building(db, building_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    return serialize_building(item)


@router.get("/me/building", response_model=CityBuildingResponse)
def my_building(user=Depends(require_current_user), db: Session = Depends(get_db)) -> CityBuildingResponse:
    account = get_account_by_user_id(db, user.id)
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No connected Instagram account")
    item = get_building_by_account_id(db, account.id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No building generated")
    return serialize_building(item)
