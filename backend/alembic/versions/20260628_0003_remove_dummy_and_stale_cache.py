"""remove dummy seed data and stale zero-metric caches

Revision ID: 20260628_0003
Revises: 20260628_0002
Create Date: 2026-06-28
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260628_0003"
down_revision: str | None = "20260628_0002"
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
        accounts_to_remove AS (
            SELECT DISTINCT ia.id, ia.user_id
            FROM instagram_accounts ia
            LEFT JOIN seed_usernames su ON su.username = ia.username
            WHERE su.username IS NOT NULL
               OR EXISTS (
                    SELECT 1
                    FROM instagram_stats ist
                    WHERE ist.instagram_account_id = ia.id
                      AND ist.avg_likes = 0
                      AND ist.avg_comments = 0
                      AND ist.avg_views = 0
                      AND ist.top_post_image_url IS NULL
               )
        ),
        deleted_accounts AS (
            DELETE FROM instagram_accounts ia
            USING accounts_to_remove atr
            WHERE ia.id = atr.id
            RETURNING atr.user_id
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
