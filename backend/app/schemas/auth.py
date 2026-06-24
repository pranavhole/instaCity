from pydantic import BaseModel


class LoginUrlResponse(BaseModel):
    redirect_url: str


class MessageResponse(BaseModel):
    message: str
