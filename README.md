# Oinsta City

Oinsta City turns a public Instagram profile into a building in a shared 3D city. The local app runs fully through Docker Compose and caches scraped public profile data in PostgreSQL.

## Services

- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API health: http://localhost:8000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6380 on the host, `redis:6379` inside Docker

## Run Locally With Docker

```bash
docker compose up --build
```

The backend container runs Alembic migrations before starting FastAPI. It does not seed dummy profile data.

If a previous failed run left containers around, use `docker compose down` first. The frontend host port is `3001` because another local process may already use `3000`; Redis uses host port `6380` to avoid colliding with other local Redis containers that commonly use `6379`.

## Public Profile Flow

1. Open http://localhost:3001.
2. Enter a public Instagram profile URL or username.
3. If the profile already exists in PostgreSQL, the backend returns cached stats and posts without calling Apify.
4. If the profile is not cached, the backend uses the Apify Instagram scraper actor, stores the posts/stats, and generates a building.
5. Open the city and fly the paper plane. Mouse up/down and `W`/`S` control altitude; arrow up/down moves forward/backward.

## Useful Commands

```bash
docker compose run --rm backend alembic upgrade head
docker compose run --rm backend pytest -q
docker compose run --rm frontend npm run typecheck
docker compose run --rm frontend npm run build
```

## Environment

Copy `.env.example` to `.env` when overriding local defaults. The Docker setup reads `.env.example` directly for the standard local run.

Set `APIFY_API_TOKEN` on the backend to enable live profile imports through `apify/instagram-scraper`. Without that token, already-cached database profiles still render, but new imports cannot run.
