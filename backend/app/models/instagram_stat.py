import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InstagramStat(Base):
    __tablename__ = "instagram_stats"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instagram_account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("instagram_accounts.id", ondelete="CASCADE"), index=True)
    followers_count: Mapped[int] = mapped_column(Integer, nullable=False)
    follows_count: Mapped[int] = mapped_column(Integer, nullable=False)
    media_count: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_likes: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_comments: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_views: Mapped[int] = mapped_column(Integer, nullable=False)
    reels_count: Mapped[int] = mapped_column(Integer, nullable=False)
    top_post_image_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    top_post_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    engagement_rate: Mapped[float] = mapped_column(Float, nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    instagram_account = relationship("InstagramAccount", back_populates="stats")
