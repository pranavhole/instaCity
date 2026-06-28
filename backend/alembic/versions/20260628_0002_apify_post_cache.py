"""add apify post cache fields

Revision ID: 20260628_0002
Revises: 20260623_0001
Create Date: 2026-06-28
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "20260628_0002"
down_revision: str | None = "20260623_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("instagram_stats", sa.Column("top_post_image_url", sa.String(length=2000), nullable=True))
    op.add_column("instagram_stats", sa.Column("top_post_url", sa.String(length=1000), nullable=True))
    op.create_table(
        "instagram_posts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instagram_account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("shortcode", sa.String(length=255), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=True),
        sa.Column("image_url", sa.String(length=2000), nullable=True),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("likes_count", sa.Integer(), nullable=False),
        sa.Column("comments_count", sa.Integer(), nullable=False),
        sa.Column("video_view_count", sa.Integer(), nullable=False),
        sa.Column("taken_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("raw_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["instagram_account_id"], ["instagram_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_instagram_posts_instagram_account_id"), "instagram_posts", ["instagram_account_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_instagram_posts_instagram_account_id"), table_name="instagram_posts")
    op.drop_table("instagram_posts")
    op.drop_column("instagram_stats", "top_post_url")
    op.drop_column("instagram_stats", "top_post_image_url")
