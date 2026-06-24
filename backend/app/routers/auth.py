import secrets

from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.repositories.instagram_repo import upsert_instagram_account
from app.repositories.user_repo import upsert_user_for_instagram
from app.schemas.auth import LoginUrlResponse, MessageResponse
from app.services.instagram.base import ProviderConfigurationError
from app.services.instagram.meta_provider import MetaInstagramProvider
from app.services.instagram.mock_provider import MockInstagramProvider
from app.services.token_service import SESSION_COOKIE_NAME, create_session_token, encrypt_token

router = APIRouter(prefix="/auth", tags=["auth"])
OAUTH_STATE_COOKIE_NAME = "instacity_oauth_state"


def get_instagram_provider(settings: Settings):
    if settings.instagram_provider == "mock":
        return MockInstagramProvider(settings.frontend_url, settings.backend_url)
    if settings.instagram_provider == "meta":
        return MetaInstagramProvider()
    raise HTTPException(status_code=500, detail=f"Unsupported Instagram provider: {settings.instagram_provider}")


@router.get("/instagram/login", response_model=LoginUrlResponse)
def instagram_login(response: Response, settings: Settings = Depends(get_settings)) -> LoginUrlResponse:
    provider = get_instagram_provider(settings)
    state = secrets.token_urlsafe(16)
    response.set_cookie(
        OAUTH_STATE_COOKIE_NAME,
        state,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=10 * 60,
    )
    try:
        return LoginUrlResponse(redirect_url=provider.get_login_url(state))
    except ProviderConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


@router.get("/instagram/callback")
async def instagram_callback(
    code: str = Query(...),
    state: str = Query(...),
    stored_state: str | None = Cookie(default=None, alias=OAUTH_STATE_COOKIE_NAME),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    if not stored_state or not secrets.compare_digest(state, stored_state):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")

    provider = get_instagram_provider(settings)
    try:
        access_token = await provider.exchange_code(code)
        account_data = await provider.fetch_account(access_token)
    except ProviderConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    user = upsert_user_for_instagram(db, account_data)
    encrypted_token = encrypt_token(access_token, settings.token_encryption_key)
    upsert_instagram_account(db, user.id, account_data, encrypted_token)
    db.commit()

    response = RedirectResponse(f"{settings.frontend_url}/dashboard", status_code=status.HTTP_302_FOUND)
    response.delete_cookie(OAUTH_STATE_COOKIE_NAME)
    response.set_cookie(
        SESSION_COOKIE_NAME,
        create_session_token(user.id, settings.session_secret),
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 14,
    )
    return response


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(SESSION_COOKIE_NAME)
    return MessageResponse(message="Logged out")
