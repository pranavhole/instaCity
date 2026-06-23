# InstaCity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Docker-first InstaCity full-stack app where Instagram profile metrics generate explorable 3D city buildings and users fly a small plane through the city.

**Architecture:** The repository is a monorepo with a Next.js frontend and FastAPI backend. Backend routers call services, services call repositories/providers, and PostgreSQL stores users, Instagram accounts, stat snapshots, and city buildings. Docker Compose runs frontend, backend, PostgreSQL, and Redis as the supported local workflow.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, React Three Fiber, Drei, Zustand, React Query, FastAPI, Python 3.11, SQLAlchemy 2, Alembic, Pydantic, PostgreSQL, Redis, Docker Compose.

---

## File Structure

Create these top-level files:

- `README.md`: Docker-first setup, mock auth flow, env vars, verification commands.
- `.env.example`: root-level documented environment defaults.
- `docker-compose.yml`: frontend, backend, postgres, redis services.

Create backend files:

- `backend/Dockerfile`
- `backend/requirements.txt`
- `backend/alembic.ini`
- `backend/app/main.py`
- `backend/app/config.py`
- `backend/app/database.py`
- `backend/app/models/__init__.py`
- `backend/app/models/user.py`
- `backend/app/models/instagram_account.py`
- `backend/app/models/instagram_stat.py`
- `backend/app/models/city_building.py`
- `backend/app/schemas/auth.py`
- `backend/app/schemas/user.py`
- `backend/app/schemas/instagram.py`
- `backend/app/schemas/city.py`
- `backend/app/routers/auth.py`
- `backend/app/routers/users.py`
- `backend/app/routers/instagram.py`
- `backend/app/routers/city.py`
- `backend/app/services/instagram/base.py`
- `backend/app/services/instagram/mock_provider.py`
- `backend/app/services/instagram/meta_provider.py`
- `backend/app/services/city_generator.py`
- `backend/app/services/token_service.py`
- `backend/app/repositories/user_repo.py`
- `backend/app/repositories/instagram_repo.py`
- `backend/app/repositories/city_repo.py`
- `backend/app/utils/security.py`
- `backend/app/utils/hashing.py`
- `backend/app/utils/pagination.py`
- `backend/app/scripts/seed.py`
- `backend/alembic/env.py`
- `backend/alembic/versions/20260623_0001_initial_schema.py`
- `backend/tests/test_city_generator.py`
- `backend/tests/test_mock_provider.py`
- `backend/tests/test_api_smoke.py`

Create frontend files:

- `frontend/Dockerfile`
- `frontend/package.json`
- `frontend/next.config.mjs`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.ts`
- `frontend/postcss.config.mjs`
- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/auth/callback/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/city/page.tsx`
- `frontend/components/providers.tsx`
- `frontend/components/landing/Hero.tsx`
- `frontend/components/landing/FeatureGrid.tsx`
- `frontend/components/landing/PreviewStrip.tsx`
- `frontend/components/dashboard/AccountCard.tsx`
- `frontend/components/dashboard/StatsGrid.tsx`
- `frontend/components/dashboard/BuildingPreview.tsx`
- `frontend/components/city/CityScene.tsx`
- `frontend/components/city/Building.tsx`
- `frontend/components/city/PlaneController.tsx`
- `frontend/components/city/CameraController.tsx`
- `frontend/components/city/ProfileModal.tsx`
- `frontend/components/city/CityLights.tsx`
- `frontend/components/city/Billboard.tsx`
- `frontend/components/city/Ground.tsx`
- `frontend/components/city/Minimap.tsx`
- `frontend/components/ui/Button.tsx`
- `frontend/components/ui/Card.tsx`
- `frontend/components/ui/LoadingState.tsx`
- `frontend/components/ui/ErrorState.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/auth.ts`
- `frontend/lib/city-mapping.ts`
- `frontend/lib/constants.ts`
- `frontend/lib/types.ts`
- `frontend/stores/authStore.ts`
- `frontend/stores/cityStore.ts`

---

### Task 1: Docker And Repository Foundation

**Files:**
- Create: `README.md`
- Create: `.env.example`
- Create: `docker-compose.yml`
- Create: `backend/Dockerfile`
- Create: `backend/requirements.txt`
- Create: `frontend/Dockerfile`
- Create: `frontend/package.json`

- [ ] **Step 1: Define root environment defaults**

Create `.env.example` with these values:

```dotenv
POSTGRES_DB=instacity
POSTGRES_USER=instacity
POSTGRES_PASSWORD=instacity
DATABASE_URL=postgresql+psycopg://instacity:instacity@postgres:5432/instacity
REDIS_URL=redis://redis:6379/0
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_CORS_ORIGINS=http://localhost:3000
INSTAGRAM_PROVIDER=mock
SESSION_SECRET=change-me-in-local-env
TOKEN_ENCRYPTION_KEY=local-dev-token-key-32-bytes-long
```

- [ ] **Step 2: Add Docker Compose**

Create `docker-compose.yml` with services named `postgres`, `redis`, `backend`, and `frontend`. The backend command must run migrations, seed data, and start uvicorn:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: instacity
      POSTGRES_USER: instacity
      POSTGRES_PASSWORD: instacity
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U instacity -d instacity"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    env_file: .env.example
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend:/app
    command: sh -c "alembic upgrade head && python -m app.scripts.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

- [ ] **Step 3: Add backend package manifest**

Create `backend/requirements.txt`:

```text
alembic==1.13.2
cryptography==42.0.8
fastapi==0.111.0
httpx==0.27.0
psycopg[binary]==3.2.1
pydantic-settings==2.3.4
pytest==8.2.2
pytest-asyncio==0.23.7
python-jose[cryptography]==3.3.0
redis==5.0.7
SQLAlchemy==2.0.31
uvicorn[standard]==0.30.1
```

- [ ] **Step 4: Add frontend package manifest**

Create `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start -H 0.0.0.0",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@react-three/drei": "^9.108.3",
    "@react-three/fiber": "^8.16.8",
    "@tanstack/react-query": "^5.51.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.166.1",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.166.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3"
  }
}
```

- [ ] **Step 5: Add Dockerfiles**

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3000
```

- [ ] **Step 6: Commit foundation**

Run:

```bash
git add README.md .env.example docker-compose.yml backend/Dockerfile backend/requirements.txt frontend/Dockerfile frontend/package.json
git commit -m "chore: add dockerized app foundation"
```

---

### Task 2: Backend Database Models And Migration

**Files:**
- Create: `backend/app/config.py`
- Create: `backend/app/database.py`
- Create: `backend/app/models/*.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/versions/20260623_0001_initial_schema.py`

- [ ] **Step 1: Add settings and database setup**

Implement `Settings` with fields matching `.env.example`, then create SQLAlchemy `engine`, `SessionLocal`, `Base`, and `get_db`.

Core signatures:

```python
class Settings(BaseSettings):
    database_url: str
    redis_url: str
    frontend_url: str
    backend_cors_origins: str
    instagram_provider: str = "mock"
    session_secret: str
    token_encryption_key: str

def get_settings() -> Settings: ...
def get_db() -> Generator[Session, None, None]: ...
```

- [ ] **Step 2: Add SQLAlchemy models**

Use UUID primary keys and UTC timestamps. Relationships:

```python
User.instagram_accounts -> list[InstagramAccount]
InstagramAccount.user -> User
InstagramAccount.stats -> list[InstagramStat]
InstagramAccount.building -> CityBuilding
CityBuilding.instagram_account -> InstagramAccount
```

Column names must match the approved spec exactly.

- [ ] **Step 3: Add Alembic migration**

Create tables `users`, `instagram_accounts`, `instagram_stats`, and `city_buildings`. Use PostgreSQL UUID columns, JSON for `color_palette`, timestamp columns, unique constraint on `instagram_accounts.instagram_user_id`, and indexes on foreign keys.

- [ ] **Step 4: Verify migration syntax**

Run:

```bash
docker compose run --rm backend alembic upgrade head
```

Expected: migration completes and creates all four tables.

- [ ] **Step 5: Commit database layer**

Run:

```bash
git add backend/app/config.py backend/app/database.py backend/app/models backend/alembic.ini backend/alembic
git commit -m "feat: add backend database schema"
```

---

### Task 3: Backend Schemas, Providers, And City Generator

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/instagram.py`
- Create: `backend/app/schemas/city.py`
- Create: `backend/app/services/instagram/base.py`
- Create: `backend/app/services/instagram/mock_provider.py`
- Create: `backend/app/services/instagram/meta_provider.py`
- Create: `backend/app/services/city_generator.py`
- Create: `backend/tests/test_city_generator.py`
- Create: `backend/tests/test_mock_provider.py`

- [ ] **Step 1: Write city generator tests first**

Create tests that assert:

```python
def test_building_tier_thresholds(): ...
def test_metric_formulas_are_clamped(): ...
def test_zero_followers_engagement_is_zero(): ...
def test_same_instagram_id_gets_same_position(): ...
def test_different_ids_use_different_grid_cells(): ...
```

- [ ] **Step 2: Implement provider dataclasses**

`base.py` must define:

```python
@dataclass(frozen=True)
class InstagramAccountData:
    instagram_user_id: str
    username: str
    profile_picture_url: str | None
    account_type: str
    category: str | None

@dataclass(frozen=True)
class InstagramStatsData:
    followers_count: int
    follows_count: int
    media_count: int
    avg_likes: int
    avg_comments: int
    avg_views: int
    reels_count: int

class InstagramProvider(Protocol):
    def get_login_url(self, state: str) -> str: ...
    async def exchange_code(self, code: str) -> str: ...
    async def fetch_account(self, access_token: str) -> InstagramAccountData: ...
    async def fetch_stats(self, access_token: str) -> InstagramStatsData: ...
```

- [ ] **Step 3: Implement mock provider**

`MockInstagramProvider` must return deterministic accounts from token/code values and include varied categories: Tech, Fashion, Food, Travel, Gaming, Music, Art, and Default.

- [ ] **Step 4: Implement Meta provider stub**

`MetaInstagramProvider` must expose the same methods and raise `ProviderConfigurationError` or `NotImplementedError` with actionable messages when real Meta credentials are missing or API calls are attempted.

- [ ] **Step 5: Implement city generator**

Functions:

```python
def engagement_rate(avg_likes: int, avg_comments: int, followers: int) -> float: ...
def building_type_for_followers(followers: int) -> str: ...
def district_for_category(category: str | None) -> str: ...
def generate_building(account: InstagramAccountData, stats: InstagramStatsData) -> GeneratedBuilding: ...
```

Use the formulas and tier thresholds from the design spec.

- [ ] **Step 6: Run tests**

Run:

```bash
docker compose run --rm backend pytest tests/test_city_generator.py tests/test_mock_provider.py -q
```

Expected: all tests pass.

- [ ] **Step 7: Commit provider and generator layer**

Run:

```bash
git add backend/app/schemas backend/app/services backend/tests/test_city_generator.py backend/tests/test_mock_provider.py
git commit -m "feat: add instagram providers and city generator"
```

---

### Task 4: Backend Repositories, Services, Routers, And Seed Data

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/app/repositories/user_repo.py`
- Create: `backend/app/repositories/instagram_repo.py`
- Create: `backend/app/repositories/city_repo.py`
- Create: `backend/app/services/token_service.py`
- Create: `backend/app/utils/security.py`
- Create: `backend/app/utils/hashing.py`
- Create: `backend/app/utils/pagination.py`
- Create: `backend/app/routers/auth.py`
- Create: `backend/app/routers/users.py`
- Create: `backend/app/routers/instagram.py`
- Create: `backend/app/routers/city.py`
- Create: `backend/app/scripts/seed.py`
- Create: `backend/tests/test_api_smoke.py`

- [ ] **Step 1: Write API smoke tests first**

Tests must verify:

```python
def test_health_returns_ok(): ...
def test_mock_login_returns_redirect_url(): ...
def test_city_buildings_returns_seeded_public_buildings(): ...
def test_users_me_requires_session(): ...
```

- [ ] **Step 2: Implement token and session helpers**

`token_service.py` must encrypt/decrypt provider tokens and create/verify session JWTs. Cookie name: `instacity_session`. Cookie settings: httpOnly, sameSite lax, secure false for local Docker.

- [ ] **Step 3: Implement repositories**

Repositories must expose focused functions:

```python
get_user_by_id(db, user_id)
upsert_user_for_instagram(db, account_data)
get_account_by_user_id(db, user_id)
create_stats_snapshot(db, account_id, stats_data, engagement_rate)
upsert_building(db, account_id, generated_building)
list_city_buildings(db)
get_city_building(db, building_id)
```

- [ ] **Step 4: Implement routers**

Routes must match the approved endpoint list and return Pydantic response models. Auth callback must set the session cookie and redirect to `${FRONTEND_URL}/dashboard`.

- [ ] **Step 5: Implement seed script**

`python -m app.scripts.seed` must create at least 16 public mock accounts, stats snapshots, and city buildings. Running it twice must not duplicate accounts.

- [ ] **Step 6: Run backend checks**

Run:

```bash
docker compose run --rm backend alembic upgrade head
docker compose run --rm backend python -m app.scripts.seed
docker compose run --rm backend pytest tests -q
```

Expected: migrations succeed, seed is idempotent, tests pass.

- [ ] **Step 7: Commit backend API**

Run:

```bash
git add backend/app backend/tests
git commit -m "feat: add backend api and seed data"
```

---

### Task 5: Frontend Foundation And API Client

**Files:**
- Create: `frontend/next.config.mjs`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.mjs`
- Create: `frontend/app/globals.css`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/components/providers.tsx`
- Create: `frontend/lib/api.ts`
- Create: `frontend/lib/auth.ts`
- Create: `frontend/lib/city-mapping.ts`
- Create: `frontend/lib/constants.ts`
- Create: `frontend/lib/types.ts`
- Create: `frontend/stores/authStore.ts`
- Create: `frontend/stores/cityStore.ts`

- [ ] **Step 1: Add TypeScript domain types**

Types must include:

```ts
export type User = { id: string; email: string | null; display_name: string; avatar_url: string | null };
export type InstagramAccount = { id: string; username: string; profile_picture_url: string | null; account_type: string; category: string | null; last_synced_at: string | null };
export type InstagramStats = { followers_count: number; follows_count: number; media_count: number; avg_likes: number; avg_comments: number; avg_views: number; reels_count: number; engagement_rate: number };
export type CityBuilding = { id: string; username: string; profile_picture_url: string | null; building_type: string; district: string; height: number; width: number; depth: number; floors: number; glow_intensity: number; material_style: string; position_x: number; position_y: number; position_z: number; color_palette: string[]; stats: InstagramStats };
```

- [ ] **Step 2: Add API client**

`api.ts` must use `fetch` with `credentials: "include"` and expose:

```ts
getLoginUrl()
getMe()
syncInstagram()
getMyStats()
getBuildings()
getBuilding(id: string)
getMyBuilding()
logout()
```

- [ ] **Step 3: Add providers and stores**

Wrap the app in `QueryClientProvider`. Zustand stores must track auth user/account and city selected building/plane state.

- [ ] **Step 4: Add Tailwind/global styles**

Use a professional SaaS visual system with dark city accents, high-contrast cards, responsive grids, and no single-hue-only palette.

- [ ] **Step 5: Run frontend static checks**

Run:

```bash
docker compose run --rm frontend npm run typecheck
```

Expected: TypeScript has no errors.

- [ ] **Step 6: Commit frontend foundation**

Run:

```bash
git add frontend
git commit -m "feat: add frontend foundation and api client"
```

---

### Task 6: Landing, Auth Callback, And Dashboard UI

**Files:**
- Create: `frontend/app/page.tsx`
- Create: `frontend/app/auth/callback/page.tsx`
- Create: `frontend/app/dashboard/page.tsx`
- Create: `frontend/components/landing/Hero.tsx`
- Create: `frontend/components/landing/FeatureGrid.tsx`
- Create: `frontend/components/landing/PreviewStrip.tsx`
- Create: `frontend/components/dashboard/AccountCard.tsx`
- Create: `frontend/components/dashboard/StatsGrid.tsx`
- Create: `frontend/components/dashboard/BuildingPreview.tsx`
- Create: `frontend/components/ui/Button.tsx`
- Create: `frontend/components/ui/Card.tsx`
- Create: `frontend/components/ui/LoadingState.tsx`
- Create: `frontend/components/ui/ErrorState.tsx`

- [ ] **Step 1: Build reusable UI primitives**

Implement typed `Button`, `Card`, `LoadingState`, and `ErrorState`. Buttons should support icons from `lucide-react`.

- [ ] **Step 2: Build landing page**

Landing page must include:

```text
Hero: "Turn your Instagram profile into a living 3D city"
CTA: "Login with Instagram"
Feature cards: Sync metrics, Generate a building, Fly through the city
Preview strip: stylized city/building preview built with CSS, not a fake data API
```

- [ ] **Step 3: Build auth callback page**

The callback page must show processing state and navigate to `/dashboard` after backend session completion.

- [ ] **Step 4: Build dashboard**

Dashboard must show account identity, stat cards for followers/posts/avg likes/avg views/engagement, sync button, building preview, and city entry button.

- [ ] **Step 5: Run frontend checks**

Run:

```bash
docker compose run --rm frontend npm run typecheck
docker compose run --rm frontend npm run build
```

Expected: typecheck passes and production build completes.

- [ ] **Step 6: Commit UI pages**

Run:

```bash
git add frontend/app frontend/components
git commit -m "feat: add landing auth and dashboard ui"
```

---

### Task 7: Fullscreen 3D City With Flyable Plane

**Files:**
- Create: `frontend/app/city/page.tsx`
- Create: `frontend/components/city/CityScene.tsx`
- Create: `frontend/components/city/Building.tsx`
- Create: `frontend/components/city/PlaneController.tsx`
- Create: `frontend/components/city/CameraController.tsx`
- Create: `frontend/components/city/ProfileModal.tsx`
- Create: `frontend/components/city/CityLights.tsx`
- Create: `frontend/components/city/Billboard.tsx`
- Create: `frontend/components/city/Ground.tsx`
- Create: `frontend/components/city/Minimap.tsx`

- [ ] **Step 1: Build city route shell**

`app/city/page.tsx` must query `/city/buildings`, render fullscreen canvas, show loading/error states, and keep overlays outside the canvas.

- [ ] **Step 2: Build procedural building component**

`Building.tsx` must render a mesh from backend dimensions, floor/window rows, glow material, billboards for reels, and park objects for comments.

- [ ] **Step 3: Build procedural plane and controls**

`PlaneController.tsx` must create a simple plane from geometry and update movement from keyboard state:

```ts
const keys = { forward: false, backward: false, left: false, right: false, up: false, down: false };
const speed = Math.min(maxSpeed, Math.max(minSpeed, currentSpeed));
```

Controls: `WASD`, mouse heading when pointer lock is active, Space for climb, Shift for descent. Clamp altitude and city bounds.

- [ ] **Step 4: Build follow camera**

`CameraController.tsx` must smooth camera position behind and above the plane using linear interpolation every frame.

- [ ] **Step 5: Build profile modal and minimap**

Profile modal must show username, image, stats, building type, recent-media mock tiles with source label, and Instagram visit button. Minimap must show building dots and plane heading.

- [ ] **Step 6: Verify city manually**

Run:

```bash
docker compose up --build
```

Open `http://localhost:3000/city`. Expected: seeded buildings render, plane is visible, keyboard movement changes plane position, and building click opens modal.

- [ ] **Step 7: Commit city experience**

Run:

```bash
git add frontend/app/city frontend/components/city frontend/stores/cityStore.ts
git commit -m "feat: add flyable 3d city"
```

---

### Task 8: README, Final Verification, And Polish

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Modify: any frontend/backend files needed for final integration issues.

- [ ] **Step 1: Finish README**

README must document:

```text
Docker setup
Mock Instagram login
Service URLs
Useful commands
Alembic migration command
Seed command
Environment variables
Known production integration boundary for Meta Login
```

- [ ] **Step 2: Run full verification**

Run:

```bash
docker compose up --build
docker compose exec backend pytest -q
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run build
```

Expected: services start, backend tests pass, frontend typecheck passes, frontend build passes.

- [ ] **Step 3: Browser verification**

Open `http://localhost:3000` and verify:

```text
Landing page CTA redirects through mock auth.
Dashboard shows connected mock account and stats.
Sync button refreshes stats/building.
City page shows buildings and flyable plane.
Profile modal opens from a building click.
Responsive layout works at desktop and mobile widths.
```

- [ ] **Step 4: Commit final polish**

Run:

```bash
git add README.md .env.example frontend backend docker-compose.yml
git commit -m "docs: add instacity setup and verification"
```
