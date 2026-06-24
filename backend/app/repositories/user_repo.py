import uuid

from sqlalchemy.orm import Session, selectinload

from app.models import InstagramAccount, User
from app.services.instagram.base import InstagramAccountData


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.get(User, user_id)


def get_user_with_account(db: Session, user_id: uuid.UUID) -> User | None:
    return (
        db.query(User)
        .options(selectinload(User.instagram_accounts))
        .filter(User.id == user_id)
        .one_or_none()
    )


def upsert_user_for_instagram(db: Session, account_data: InstagramAccountData) -> User:
    account = (
        db.query(InstagramAccount)
        .filter(InstagramAccount.instagram_user_id == account_data.instagram_user_id)
        .one_or_none()
    )
    if account:
        account.user.display_name = account_data.username
        account.user.avatar_url = account_data.profile_picture_url
        return account.user

    user = User(
        display_name=account_data.username,
        avatar_url=account_data.profile_picture_url,
        email=None,
    )
    db.add(user)
    db.flush()
    return user
