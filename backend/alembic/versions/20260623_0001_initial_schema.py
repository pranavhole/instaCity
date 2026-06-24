"""initial schema

Revision ID: 20260623_0001
Revises:
Create Date: 2026-06-23
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260623_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("avatar_url", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "instagram_accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instagram_user_id", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=False),
        sa.Column("profile_picture_url", sa.String(length=1000), nullable=True),
        sa.Column("account_type", sa.String(length=80), nullable=False),
        sa.Column("category", sa.String(length=255), nullable=True),
        sa.Column("access_token_encrypted", sa.String(length=3000), nullable=False),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_instagram_accounts_instagram_user_id"), "instagram_accounts", ["instagram_user_id"], unique=True)
    op.create_index(op.f("ix_instagram_accounts_user_id"), "instagram_accounts", ["user_id"], unique=False)
    op.create_table(
        "instagram_stats",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instagram_account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("followers_count", sa.Integer(), nullable=False),
        sa.Column("follows_count", sa.Integer(), nullable=False),
        sa.Column("media_count", sa.Integer(), nullable=False),
        sa.Column("avg_likes", sa.Integer(), nullable=False),
        sa.Column("avg_comments", sa.Integer(), nullable=False),
        sa.Column("avg_views", sa.Integer(), nullable=False),
        sa.Column("reels_count", sa.Integer(), nullable=False),
        sa.Column("engagement_rate", sa.Float(), nullable=False),
        sa.Column("snapshot_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["instagram_account_id"], ["instagram_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_instagram_stats_instagram_account_id"), "instagram_stats", ["instagram_account_id"], unique=False)
    op.create_table(
        "city_buildings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instagram_account_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("building_type", sa.String(length=120), nullable=False),
        sa.Column("district", sa.String(length=80), nullable=False),
        sa.Column("height", sa.Float(), nullable=False),
        sa.Column("width", sa.Float(), nullable=False),
        sa.Column("depth", sa.Float(), nullable=False),
        sa.Column("floors", sa.Integer(), nullable=False),
        sa.Column("glow_intensity", sa.Float(), nullable=False),
        sa.Column("material_style", sa.String(length=120), nullable=False),
        sa.Column("position_x", sa.Float(), nullable=False),
        sa.Column("position_y", sa.Float(), nullable=False),
        sa.Column("position_z", sa.Float(), nullable=False),
        sa.Column("color_palette", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["instagram_account_id"], ["instagram_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_city_buildings_instagram_account_id"), "city_buildings", ["instagram_account_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_city_buildings_instagram_account_id"), table_name="city_buildings")
    op.drop_table("city_buildings")
    op.drop_index(op.f("ix_instagram_stats_instagram_account_id"), table_name="instagram_stats")
    op.drop_table("instagram_stats")
    op.drop_index(op.f("ix_instagram_accounts_user_id"), table_name="instagram_accounts")
    op.drop_index(op.f("ix_instagram_accounts_instagram_user_id"), table_name="instagram_accounts")
    op.drop_table("instagram_accounts")
    op.drop_table("users")
