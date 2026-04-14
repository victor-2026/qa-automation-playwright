# Project Guidelines

## Code Style
- **Backend (Python/FastAPI)**: Follow patterns in [backend/app/models/user.py](backend/app/models/user.py) for models, [backend/app/api/posts.py](backend/app/api/posts.py) for API endpoints with enrichment, [backend/app/core/exceptions.py](backend/app/core/exceptions.py) for error handling.
- **Frontend (React/TypeScript)**: Use hooks for data fetching in pages like [frontend/src/pages/feed/FeedPage.tsx](frontend/src/pages/feed/FeedPage.tsx), components like [frontend/src/components/post/PostCard.tsx](frontend/src/components/post/PostCard.tsx).
- **Testing**: Use `tid()` utility to shorten UUIDs for test IDs (e.g., `data-testid="post-card-25"`). Selectors follow `{domain}-{element}-{id}` pattern (e.g., `auth-email-input`, `post-card-123`).

## Architecture
This is a full-stack social media platform QA sandbox with:
- **Frontend**: React 18 + Vite + Tailwind CSS, with axios client and auto JWT refresh on 401.
- **Backend**: FastAPI with SQLAlchemy ORM (async), PostgreSQL, JWT auth (access + refresh tokens).
- **Database**: Deterministic seed data on first run (8 users, posts, comments, etc.).
- **Testing**: Playwright E2E tests, containerized with Docker Compose.

Major components: API routers (13 modules), models/schemas/services separation. See [README.md](README.md) for high-level overview.

## Build and Test
- **Full stack start**: `docker-compose up --build` (services on ports 3000, 8000, 5432, 8081).
- **Run E2E tests**: `npm test` or `npm run test:ui`.
- **Reset environment**: `docker-compose down -v && docker-compose up --build`.
- Agents will run these automatically for validation.

## Conventions
- **Authentication**: JWT Bearer tokens with 30 min access, 7 day refresh. Auto-refresh on 401.
- **Pagination**: All list endpoints return `PaginatedResponse[T]` with `items`, `total`, `pages`, etc.
- **Timestamps**: Always UTC with timezone (`datetime.now(timezone.utc)`).
- **Soft Deletes**: Posts use `is_deleted` flag for moderation.
- **Uploads**: Max 5MB images via dedicated endpoint, stored in volume.
- **Rate Limiting**: 100 req/min per IP.
- **Test Accounts**: Pre-seeded with pattern `{username}123` passwords. See [README.md](README.md) for details.
- **Error Handling**: Custom exceptions auto-convert to HTTP status codes.
- Avoid port conflicts; use `docker-compose stop` if needed.</content>
<parameter name="filePath">/Users/victor/Projects/qa-automation-sandbox/.github/copilot-instructions.md