# AGENTS.md — qa-automation-sandbox

## Purpose
This file defines the working rules for AI agents and contributors in this repository.

## Core Rules
- Read `session-checkpoint.md` at the start of each session.
- **MANDATORY: Save checkpoint before closing session.** Update `session-checkpoint.md` AND `~/.opencode-memory.md` at end of each session. No exceptions. If you close without saving — you failed the session.
- Use commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`.
- Never commit PAT/API tokens or secrets; use `gh auth`.
- Keep test code and documentation aligned when flows change.
- Do not hardcode credentials; use env vars and test-only accounts.

## Boundaries

| Область | AI может | AI спросить | AI нельзя |
|---------|----------|-------------|-----------|
| `e2e/*.spec.ts` | ✅ edit | | |
| `e2e/api/*` | ✅ edit | | |
| `e2e/ui/*` | ✅ edit | | |
| `e2e/mutation/*` | ✅ edit | | |
| `e2e/pages/*.ts` | ✅ edit | | |
| `e2e/fixtures.ts` | | ✅ ask | |
| `e2e/setup/*` | ✅ edit | | |
| `e2e/teardown/*` | ✅ edit | | |
| `e2e/utils/*` | ✅ edit | | |
| `e2e/load/*` | | ✅ ask | |
| `backend/` | | | ❌ never |
| `go-backend/` | | | ❌ never |
| `csharp-backend/` | | | ❌ never |
| `frontend/` | | | ❌ never |
| `.github/workflows/*` | | ✅ ask | |
| `render.yaml` | | ✅ ask | |
| `session-checkpoint.md` | ✅ edit | | |
| `AGENTS.md` | | ✅ ask | |
| `.env*`, secrets | | | ❌ never |

## Sources of Truth (порядок чтения)

1. **AGENTS.md** — permanent project rules (this file)
2. **session-checkpoint.md** — current state, next steps, blockers
3. **`.opencode-memory.md`** — global cross-project memory
4. **skills/** — domain-specific instructions

При конфликте источников — выше в списке важнее.

## Project Context
- Repository: `victor-2026/qa-automation-playwright`
- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- API base: `http://localhost:8000/api`
- Render: `https://buzzhive-test.onrender.com`

## Architecture

```
qa-automation-sandbox/
├── e2e/              — Playwright E2E + API tests
│   ├── api/          — Domain API tests (auth, posts, admin, etc.)
│   ├── ui/           — UI tests (auth, profile, navigation, etc.)
│   ├── pages/        — Page Objects
│   ├── fixtures.ts   — Shared test fixtures
│   ├── setup/        — Test setup (credentials, tokens)
│   └── teardown/     — Cleanup after tests
├── backend/          — FastAPI + SQLAlchemy (Docker, AI never edits)
├── frontend/         — React (Docker, AI never edits)
├── .github/workflows/— CI/CD pipelines
├── render.yaml       — Render deployment config
├── AGENTS.md         — Project rules (this file)
└── session-checkpoint.md — Current state handover
```

## Test Stack
- Playwright (E2E + API)
- Jest + `pg` (DB tests)
- Jest + `fast-check` (property-based tests)
- Cucumber (Gherkin)

## Runbook
```bash
# Local full run with Docker
docker-compose up --build -d
npm test

# Render smoke
npm run test:render
```

## CI Notes
- Quality gates: `lint` + `typecheck` + `audit`.
- For Render, run API-smoke coverage rather than the full Docker suite.
- For unstable backend behavior, limited retries are allowed where justified.

## Testing Priorities
- Keep smoke tests fast and stable.
- Validate auth, profile/me, posts (read/write), and unauthorized scenarios.
- Maintain cleanup in teardown for created entities.
- Add explicit assertions for response schema and status codes.

## Session Checklist
1. Read `session-checkpoint.md`.
2. Verify environment (`docker`, URLs, required env vars).
3. Run targeted tests first, then broader suites.
4. Update docs/checkpoint with what changed and why.
5. Commit with the correct prefix and clear scope.
6. Update `~/.opencode-memory.md` with session summary.

## session-checkpoint.md Template
Minimum sections to keep updated:

```md
# Session Checkpoint - qa-automation-sandbox

**Date:** YYYY-MM-DD
**Status:** IN PROGRESS | COMPLETE | BLOCKED

## Work Completed
- ...

## Modified Files
- `path/to/file` - short reason

## Verification Results
- Command: `...`
- Result: PASS | FAIL
- Key details: ...

## Active API Endpoints (relevant to session)
- `GET /health` — health check
- `POST /auth/login` — login
- `POST /auth/refresh` — refresh token
- `GET /auth/me` — current user profile
- `GET /posts` — list posts
- `POST /posts` — create post

## No-Go Zones (require human approval)
- Modifying `backend/` or `frontend/` source code
- Changing CI/CD pipelines (`.github/workflows/*`, `render.yaml`)
- Editing `AGENTS.md` directly — AI may suggest changes only
- Committing any `.env*` files or secrets

## Blockers
- ...

## Next Steps
1. ...
2. ...
```

## E2E Test Rules (AI-generated tests)

### Selector Reuse
- Before writing any new `[data-testid=...]` locator, grep `e2e/pages/` for existing Page Objects
- Use Page Objects from fixtures: `loginPage.login()`, `navPage.*`, `feedPage.*`
- Never write raw `page.fill('[data-testid="auth-email-input"]')` when `loginPage.login()` exists
- If a Page Object doesn't cover a selector, add it to the existing Page Object class

### Spec Structure
- Each spec file tests ONE domain (auth, posts, admin, etc.)
- Import `{ test, expect }` from `../fixtures` — never from `@playwright/test`
- Use `test.beforeAll` for token acquisition, `test.afterEach` for screenshots on failure
- Naming: `DOMAIN-API-NNN:` or `DOMAIN-UI-NNN:` prefix

### Assertion Coverage
- CRUD tests must verify persisted state (reload → data persists)
- Don't assert success toasts — assert the actual state change
- Negative assertions: use `expect(locator).not.toBeVisible()` or `toHaveCount(0)`, not absence-by-omission
- API tests: assert status code + response schema (fields, types)

### Flake Prevention
- Never use `page.waitForTimeout()` — use `expect(locator).toBeVisible()` or `waitForResponse()`
- Retries: max 2, use `trace: 'on-first-retry'`
- If a test fails intermittently, add `await page.waitForLoadState('networkidle')` or increase timeout

### Data-Driven Tests
- Use `test.each` for parameterized inputs (SQLi patterns, XSS vectors, boundary values)
- Test data: valid, boundary, invalid, malicious — at least 3 variants per input type

## Code Conventions

### Naming
- Spec files: `DOMAIN-subdomain.spec.ts` (e.g., `auth-login.spec.ts`, `admin-users.spec.ts`)
- Page Objects: `{Name}Page.ts` (e.g., `LoginPage.ts`, `FeedPage.ts`)
- Fixtures: `{name}Fixtures.ts` for shared setup
- Test titles: `DOMAIN-API-NNN: description` or `DOMAIN-UI-NNN: description`

### Page Objects
- One class per page/component, stored in `e2e/pages/`
- Selectors defined as private fields: `readonly #emailInput = this.page.getByTestId('auth-email-input')`
- Methods return Promises: `async login(email: string, password: string): Promise<void>`
- Import from `../fixtures` — never from `@playwright/test`

### Imports
- `import { test, expect } from '../fixtures'` — always, never `@playwright/test`
- API helpers: `import { apiClient } from './setup/apiClient'`
- Test data: `import { testUsers } from './setup/credentials'`

## Review & PR Guidelines

### Before Commit
1. Run `npm run typecheck` — no type errors
2. Run `npm run lint` — no lint errors
3. Verify tests pass for changed domain
4. Check no secrets/tokens in diff
5. Update `session-checkpoint.md`

### Commit Format
`prefix(scope): description`
- `feat:` — new test or feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — maintenance, refactoring

### Self-Review Checklist
- [ ] Tests actually test what they claim
- [ ] No hardcoded credentials or URLs
- [ ] Negative scenarios covered, not just happy path
- [ ] Page Objects reused, not duplicated
- [ ] Teardown/cleanup in place for created entities

## End-of-Session Report Template (chat/PR)
Use this short repeatable format:

```md
## Outcomes
- Completed: ...
- Verified: ...
- Risks/limitations: ...
- Next step: ...
```

## AGENTS.md Constraints

- **No secrets** — never store tokens, passwords, API keys in this file
- **No dated facts** — avoid dates that become stale; use relative time
- **No model-specific instructions** — rules must work with any AI model
- **Size ≤ 32 KiB** — file must fit in one context window
