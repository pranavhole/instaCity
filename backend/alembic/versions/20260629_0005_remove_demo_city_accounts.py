"""remove demo city accounts

Revision ID: 20260629_0005
Revises: 20260629_0004
Create Date: 2026-06-29
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260629_0005"
down_revision: str | None = "20260629_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        WITH demo_usernames(username) AS (
            VALUES
                ('art-museum'),
                ('daily-creator'),
                ('fashion-arcade'),
                ('food-court'),
                ('gallery-maker'),
                ('gaming-neon'),
                ('global-roamer'),
                ('indie-sound'),
                ('luxury-style'),
                ('modern-profile'),
                ('music-hall'),
                ('startup-studio'),
                ('stream-player'),
                ('travel-terminal'),
                ('urban-eats')
        ),
        deleted_accounts AS (
            DELETE FROM instagram_accounts ia
            USING demo_usernames du
            WHERE ia.username = du.username
               OR ia.username ~ '^creator_[0-9]+$'
            RETURNING ia.user_id
        )
        DELETE FROM users u
        USING deleted_accounts da
        WHERE u.id = da.user_id
          AND u.email IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM instagram_accounts ia
              WHERE ia.user_id = u.id
          );
        """
    )


def downgrade() -> None:
    pass
