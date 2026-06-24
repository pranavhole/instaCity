import base64
import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from cryptography.fernet import Fernet
from jose import JWTError, jwt

SESSION_ALGORITHM = "HS256"
SESSION_COOKIE_NAME = "instacity_session"


def _fernet(secret: str) -> Fernet:
    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_token(token: str, secret: str) -> str:
    return _fernet(secret).encrypt(token.encode("utf-8")).decode("utf-8")


def decrypt_token(encrypted_token: str, secret: str) -> str:
    return _fernet(secret).decrypt(encrypted_token.encode("utf-8")).decode("utf-8")


def create_session_token(user_id: uuid.UUID, secret: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(days=14)
    return jwt.encode({"sub": str(user_id), "exp": expires_at}, secret, algorithm=SESSION_ALGORITHM)


def verify_session_token(token: str, secret: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, secret, algorithms=[SESSION_ALGORITHM])
        subject = payload.get("sub")
        return uuid.UUID(subject) if subject else None
    except (JWTError, ValueError, TypeError):
        return None
