# InstaCity Design Spec

## Purpose

InstaCity is a professional full-stack web application that turns an Instagram professional profile into a personalized 3D building inside a shared social city. Users authenticate with Instagram in production or mock Instagram locally, sync profile metrics, see their generated building on a dashboard, and fly a small plane through the city to inspect other users' buildings.

The first complete local build will run fully through Docker Compose: frontend, backend, PostgreSQL, and Redis. Local development uses a mock Instagram provider with seeded accounts and deterministic city generation. Production Instagram integration is isolated behind a Meta Graph API provider boundary so React components and city logic never depend on fake or hardcoded social data.

## Scope

The build includes:

- A Docker-first monorepo with `frontend/`, `backend/`, `docker-compose.yml`, root README, and environment examples.
- Next.js 14 frontend using TypeScript, Tailwind CSS, React Query, Zustand, React Three Fiber, and Drei.
- FastAPI backend using Python 3.11+, SQLAlchemy, Alembic, Pydantic schemas, PostgreSQL, Redis, repository-service-router boundaries, and httpOnly session cookies.
- Mock Instagram login and sync for local use.
- Production Meta provider stub with explicit unsupported-operation errors and configuration validation.
- Landing page, auth callback page, dashboard, fullscreen 3D city page, and building profile modal.
- Flyable 3D plane as the primary city exploration control.
- Deterministic building generation from Instagram metrics.
- Alembic migration and seed script for mock accounts, stats, and buildings.
- Loading, error, and empty states across the frontend.

The build does not include live Meta app approval, real Instagram OAuth credentials, production deployment automation, payments, social graph features, user chat, or real recent media fetching. The UI will include a recent-media preview panel with static mock tiles and clear source labeling.

## Architecture

The repository will be a two-app monorepo:

- `frontend/` contains the Next.js app. It communicates only with FastAPI over typed API client functions in `frontend/lib/api.ts`.
- `backend/` contains the FastAPI app. Routers handle HTTP concerns, services contain business logic, repositories own database access, and providers isolate external Instagram behavior.
- `docker-compose.yml` defines `frontend`, `backend`, `postgres`, and `redis` services on one network. All application services run through Docker for the normal local workflow.

The backend is the source of truth for authentication, Instagram tokens, stats, generated buildings, and city API responses. The frontend stores only UI state and session-derived user/account data returned by backend APIs.

## Frontend Design

### Routes

- `app/page.tsx`: landing page with a first-viewport brand signal, hero copy "Turn your Instagram profile into a living 3D city", Instagram login CTA, feature cards, and 3D preview section.
- `app/auth/callback/page.tsx`: reads OAuth/mock callback params, calls backend callback completion, shows loading/error/success states, then routes to the dashboard.
- `app/dashboard/page.tsx`: shows the connected Instagram account, stat cards, sync button, building preview card, and city entry button.
- `app/city/page.tsx`: fullscreen 3D city canvas with loading state, error state, minimap/radar overlay, and profile modal.

### Component Structure

- `components/landing/`: hero, feature cards, preview section.
- `components/dashboard/`: account card, stat cards, sync panel, building preview.
- `components/city/`: `CityScene`, `Building`, `PlaneController`, `CameraController`, `ProfileModal`, `CityLights`, `Billboard`, `Ground`, `Minimap`.
- `components/auth/`: auth callback status components.
- `components/ui/`: reusable button, card, stat, modal, loading, and error primitives.

### State And Data

- React Query handles backend API reads and mutations.
- `authStore` holds lightweight authenticated user/session UI state.
- `cityStore` holds selected building, plane position, movement state, and UI overlays.
- TypeScript domain types live in `lib/types.ts`.
- City metric mapping helpers live in `lib/city-mapping.ts` and mirror backend formulas for display only; backend remains authoritative.

## 3D City Design

The city page is a fullscreen React Three Fiber experience. The city is generated from `/city/buildings`, where each building includes position, dimensions, style, palette, and linked Instagram profile summary.

### Flyable Plane

The plane is the primary city navigation model:

- `W`, `A`, `S`, `D` control forward/back/turn or strafe movement.
- Mouse movement controls camera/heading while pointer lock is active.
- Space and Shift control climb and descent.
- Speed is clamped to keep navigation stable and reduce motion sickness.
- The camera follows the plane in third-person view with smoothing.
- The plane remains above ground and inside a broad city boundary.
- Users can target or click nearby buildings to open the profile modal.
- The minimap/radar shows nearby building dots and the plane heading.

The implementation will use simple procedural geometry for the plane instead of an external model so the app works immediately without asset downloads.

### Building Rendering

Buildings are rendered procedurally from backend-generated fields:

- `height`: vertical scale.
- `width` and `depth`: footprint.
- `floors`: window rows.
- `glow_intensity`: emissive/neon strength.
- `material_style`: material preset based on engagement quality.
- `district`: style theme derived from account category.
- `color_palette`: JSON palette generated by backend.
- `reels_count`: billboard count/screens on or near the building.
- `avg_comments`: nearby tree/park object density.

District themes:

- Tech: futuristic glass.
- Fashion: luxury mall.
- Food: cafe/restaurant.
- Travel: hotel/airport.
- Gaming: cyberpunk neon.
- Music: concert hall.
- Art: museum/gallery.
- Default: modern city.

## Backend Design

### Modules

Backend structure:

- `app/main.py`: FastAPI app, middleware, router registration, health endpoint.
- `app/config.py`: Pydantic settings from environment.
- `app/database.py`: SQLAlchemy engine, session factory, base metadata.
- `app/models/`: SQLAlchemy models for users, Instagram accounts, stats, and city buildings.
- `app/schemas/`: Pydantic request/response schemas.
- `app/routers/`: auth, Instagram, city, users.
- `app/services/instagram/`: provider interface, mock provider, Meta provider.
- `app/services/city_generator.py`: deterministic metric-to-building logic.
- `app/services/token_service.py`: token encryption/decryption and session token helpers.
- `app/repositories/`: user, Instagram, and city database operations.
- `app/utils/`: security, hashing, pagination, and rate-limit integration helpers.

### API Endpoints

- `GET /health`: service health.
- `GET /auth/instagram/login`: returns redirect URL for Meta mode or mock callback URL for local mode.
- `GET /auth/instagram/callback`: completes auth, creates/updates user/account, stores encrypted token, sets httpOnly session cookie, redirects to frontend dashboard.
- `POST /auth/logout`: clears session cookie.
- `GET /users/me`: returns current user and connected Instagram account summary.
- `POST /instagram/sync`: syncs provider data, stores stats snapshot, regenerates the user's building.
- `GET /instagram/me/stats`: returns latest authenticated user's stats.
- `GET /city/buildings`: returns all generated city buildings with public profile summaries.
- `GET /city/buildings/{id}`: returns one building.
- `GET /city/me/building`: returns the authenticated user's generated building.

### Instagram Provider Boundary

The provider interface returns normalized account and stat data:

- Instagram user id, username, profile picture URL, account type, category.
- Followers, follows, media count, average likes, average comments, average views, reels count.

`MockInstagramProvider` returns realistic deterministic data for local login and sync. `MetaInstagramProvider` owns all future Meta Graph API calls and raises clear configuration or not-implemented errors where real credentials/scopes are required.

No frontend component will generate or fake Instagram metrics.

## Data Model

Tables:

- `users`: `id`, `email`, `display_name`, `avatar_url`, `created_at`, `updated_at`.
- `instagram_accounts`: `id`, `user_id`, `instagram_user_id`, `username`, `profile_picture_url`, `account_type`, `category`, `access_token_encrypted`, `token_expires_at`, `connected_at`, `last_synced_at`.
- `instagram_stats`: `id`, `instagram_account_id`, `followers_count`, `follows_count`, `media_count`, `avg_likes`, `avg_comments`, `avg_views`, `reels_count`, `engagement_rate`, `snapshot_date`, `created_at`.
- `city_buildings`: `id`, `instagram_account_id`, `building_type`, `district`, `height`, `width`, `depth`, `floors`, `glow_intensity`, `material_style`, `position_x`, `position_y`, `position_z`, `color_palette`, `created_at`, `updated_at`.

UUID primary keys are used for all domain records. The `instagram_user_id` is unique. Each account can have multiple stat snapshots and one current generated building.

## City Generation

Generation is deterministic and backend-owned. It uses normalized metrics, not raw metric values directly.

Formulas:

- `height = clamp(log10(followers + 1) * 8, 4, 80)`
- `width = clamp(log10(avg_likes + 1) * 3, 3, 18)`
- `depth = width`
- `floors = clamp(media_count / 10, 1, 60)`
- `glow = clamp(log10(avg_views + 1) / 6, 0.1, 1)`
- `engagement_rate = ((avg_likes + avg_comments) / followers) * 100`, with a zero-follower guard returning `0`.

Building tiers:

- `<1k`: Small House.
- `1k-10k`: Creator Studio.
- `10k-50k`: Apartment Tower.
- `50k-250k`: Skyscraper.
- `250k-1M`: Landmark Tower.
- `1M+`: Iconic Mega Tower.

Placement:

- A stable hash of `instagram_user_id` maps each account to a grid cell.
- Grid placement prevents building overlap.
- Coordinates remain stable between syncs unless the account id changes.
- The seed script creates enough varied accounts to make the city feel populated on first run.

## Security

- Instagram access tokens are never returned to the frontend.
- Tokens are encrypted before database storage.
- Sessions use backend-issued httpOnly cookies.
- CORS allows the configured frontend origin only.
- API routes validate inputs and outputs with Pydantic.
- Protected routes require a valid session.
- A Redis-backed rate-limit scaffold will be wired as middleware-friendly utility code, with conservative no-op defaults for local development.

## Error Handling

Backend:

- Provider errors are converted into structured HTTP errors.
- Database lookup failures return 404.
- Unauthenticated access returns 401.
- Invalid provider mode or missing production config returns explicit startup or request-time errors.

Frontend:

- Landing login CTA handles backend login URL failures.
- Auth callback shows loading, success, and failure states.
- Dashboard shows empty connected-account state, stat loading skeletons, sync errors, and retry actions.
- City page shows loading fallback before building data is ready, error panel on API/canvas failures, and empty-city state if no buildings exist.

## Testing Strategy

Backend tests:

- City generation formulas, tier mapping, district mapping, and stable grid placement.
- Mock Instagram provider normalization.
- Repository/service behavior for sync and building generation.
- API smoke tests for health, user session, sync, and city endpoints.

Frontend tests:

- Mapping helper tests.
- API client shape tests with mocked fetch.
- Component smoke tests for dashboard states where practical.

Manual verification:

- `docker compose up --build` starts all services.
- Landing CTA starts mock auth.
- Callback creates a user and account.
- Dashboard sync updates stats and building.
- City renders seeded buildings.
- Plane movement works and profile modal opens from a building interaction.

## Delivery Notes

The implementation should keep files focused and avoid large catch-all components. Comments should be rare and reserved for non-obvious logic such as deterministic placement and plane control smoothing. The README must document Docker workflow first, because Docker is the expected way to run all services locally.
