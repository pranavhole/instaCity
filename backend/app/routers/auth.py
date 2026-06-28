from urllib.parse import urlparse

from fastapi import APIRouter, Response

from app.config import Settings
from app.schemas.auth import MessageResponse
from app.services.token_service import SESSION_COOKIE_NAME

router = APIRouter(prefix="/auth", tags=["auth"])


def auth_cookie_options(settings: Settings) -> dict[str, bool | str]:
    frontend = urlparse(settings.frontend_url)
    backend = urlparse(settings.backend_url)
    frontend_origin = (frontend.scheme, frontend.netloc)
    backend_origin = (backend.scheme, backend.netloc)
    secure = backend.scheme == "https"
    cross_origin_https = secure and frontend.scheme == "https" and frontend_origin != backend_origin

    return {
        "secure": secure,
        "samesite": "none" if cross_origin_https else "lax",
    }


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(SESSION_COOKIE_NAME)
    return MessageResponse(message="Logged out")
