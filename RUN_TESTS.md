# Running Tests Locally - Quick Guide

## Prerequisites

Before running tests, ensure Docker is running:

```bash
docker ps
```

If Docker is not running, start Docker Desktop app.

---

## Start the Application

```bash
# From project root
docker-compose up --build -d

# Wait ~30 seconds for all services to start
docker-compose ps
```

### Verify Services

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | Should show React app |
| Backend API | http://localhost:8000/docs | Swagger UI |
| Database UI | http://localhost:8081 | pgweb |

---

## Run Tests

```bash
# All tests
npm test

# Chromium only (faster for UI tests)
npm test --project=chromium

# Smoke tests (quick check)
npm test e2e/smoke.spec.ts

# Sanity tests
npm test e2e/sanity.spec.ts

# API tests only
npm test e2e/api/

# Specific module
npm test e2e/api/auth.spec.ts
npm test e2e/api/posts.spec.ts
```

---

## Project Structure

```
e2e/
├── smoke.spec.ts           # 7 smoke tests
├── sanity.spec.ts         # 19 sanity tests  
├── buzzhive.spec.ts     # UI E2E tests
└── api/
    ├── auth.spec.ts     # 12 auth tests
    ├── users.spec.ts   # 18 user tests
    ├── posts.spec.ts   # 27 post tests
    ├── notifications.spec.ts
    ├── conversations.spec.ts
    └── health.spec.ts
```

---

## Troubleshooting

### Tests fail with 500 errors?

- **Backend unstable** — known issue
- Tests already use `retries: 2` for handling
- Try running again

### "Connection refused" errors?

```bash
# Check what's running
docker-compose ps

# Backend logs
docker-compose logs backend

# Restart if needed
docker-compose restart
```

### Need to reset data after tests?

```bash
curl -X POST http://localhost:8000/api/reset
```

---

## CI / GitHub Actions

In CI, Docker services are automatically started via GitHub Actions services matrix. No additional setup needed.

Tests skip automatically if backend is unavailable.

---

## Test Accounts

Use pre-seeded accounts:

| Username | Password | Role |
|----------|----------|------|
| alice@buzzhive.com | alice123 | User |
| admin@buzzhive.com | admin123 | Admin |
| mod@buzzhive.com | mod123 | Moderator |
| frank@buzzhive.com | frank123 | Banned |

---

*For more details, see README.md*