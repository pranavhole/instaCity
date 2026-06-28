"""remove stale zero stat snapshots

Revision ID: 20260629_0004
Revises: 20260628_0003
Create Date: 2026-06-29
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260629_0004"
down_revision: str | None = "20260628_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        WITH seed_usernames(username) AS (
            VALUES
                ('tech-city'),
                ('design-avenue'),
                ('coffee-corner'),
                ('travel-tower')
        ),
        deleted_seed_accounts AS (
            DELETE FROM instagram_accounts ia
            USING seed_usernames su
            WHERE ia.username = su.username
            RETURNING ia.user_id
        ),
        deleted_stale_stats AS (
            DELETE FROM instagram_stats ist
            WHERE ist.avg_likes = 0
              AND ist.avg_comments = 0
              AND ist.avg_views = 0
              AND ist.top_post_image_url IS NULL
            RETURNING ist.instagram_account_id
        ),
        deleted_empty_accounts AS (
            DELETE FROM instagram_accounts ia
            WHERE NOT EXISTS (
                SELECT 1
                FROM instagram_stats ist
                WHERE ist.instagram_account_id = ia.id
            )
            AND NOT EXISTS (
                SELECT 1
                FROM instagram_posts ip
                WHERE ip.instagram_account_id = ia.id
            )
            RETURNING ia.user_id
        ),
        deleted_user_ids AS (
            SELECT user_id FROM deleted_seed_accounts
            UNION
            SELECT user_id FROM deleted_empty_accounts
        )
        DELETE FROM users u
        USING deleted_user_ids dui
        WHERE u.id = dui.user_id
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
