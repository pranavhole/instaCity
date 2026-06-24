from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.instagram import InstagramAccountResponse


class UserResponse(BaseModel):
    id: UUID
    email: str | None
    display_name: str
    avatar_url: str | None

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    user: UserResponse
    instagram_account: InstagramAccountResponse | None
