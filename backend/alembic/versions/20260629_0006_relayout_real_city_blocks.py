"""relayout real city buildings into blocks

Revision ID: 20260629_0006
Revises: 20260629_0005
Create Date: 2026-06-29
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260629_0006"
down_revision: str | None = "20260629_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        WITH ordered_buildings AS (
            SELECT
                cb.id,
                ROW_NUMBER() OVER (ORDER BY ia.connected_at ASC, ia.username ASC) - 1 AS block_index
            FROM city_buildings cb
            JOIN instagram_accounts ia ON ia.id = cb.instagram_account_id
            WHERE ia.account_type = 'APIFY_PUBLIC'
              AND ia.category = 'Public profile'
        )
        UPDATE city_buildings cb
        SET
            position_x = (((ordered_buildings.block_index % 5) - 2) * 72),
            position_z = (FLOOR(ordered_buildings.block_index / 5.0) * 72),
            position_y = cb.height / 2,
            updated_at = NOW()
        FROM ordered_buildings
        WHERE cb.id = ordered_buildings.id;
        """
    )


def downgrade() -> None:
    pass
