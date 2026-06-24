from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.instagram_repo import get_account_by_user_id
from app.schemas.instagram import InstagramAccountResponse
from app.schemas.user import MeResponse, UserResponse
from app.utils.security import require_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=MeResponse)
def me(user=Depends(require_current_user), db: Session = Depends(get_db)) -> MeResponse:
    account = get_account_by_user_id(db, user.id)
    return MeResponse(
        user=UserResponse.model_validate(user),
        instagram_account=InstagramAccountResponse.model_validate(account) if account else None,
    )
