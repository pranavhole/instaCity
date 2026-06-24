# InstaCity

InstaCity turns an Instagram professional profile into a building in a shared 3D city. The local app runs fully through Docker Compose and uses a mock Instagram provider by default.

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

The backend container runs Alembic migrations and seeds mock Instagram accounts before starting FastAPI.

If a previous failed run left containers around, use `docker compose down` first. The frontend host port is `3001` because another local process may already use `3000`; Redis uses host port `6380` to avoid colliding with other local Redis containers that commonly use `6379`.

## Mock Instagram Flow

1. Open http://localhost:3001.
2. Click `Login with Instagram`.
3. The backend mock provider creates a local session and redirects to the dashboard.
4. Use `Sync Instagram Data` to refresh the account stats and generated building.
5. Open the city and fly the plane with `WASD`, mouse movement, Space, and Shift.

## Useful Commands

```bash
docker compose run --rm backend alembic upgrade head
docker compose run --rm backend python -m app.scripts.seed
docker compose run --rm backend pytest -q
docker compose run --rm frontend npm run typecheck
docker compose run --rm frontend npm run build
```

## Environment

Copy `.env.example` to `.env` when overriding local defaults. The Docker setup reads `.env.example` directly for the standard local run.

`INSTAGRAM_PROVIDER=mock` is the working local mode. `INSTAGRAM_PROVIDER=meta` selects the production provider boundary, but real Meta Graph API credentials and app approval are outside this local build.
