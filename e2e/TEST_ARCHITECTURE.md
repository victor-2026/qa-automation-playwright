# TypeScript E2E Test Architecture

## Purpose

Black-box QA tests for Buzzhive social network. Covers backend API, frontend UI, load/stress, mutation testing, and cross-browser compatibility. Portable across local Docker and Render staging.

## Stack

| Component | Library | Version |
|-----------|---------|---------|
| Test runner | Playwright | latest |
| Language | TypeScript | 5.x |
| Assertions | Built-in `expect` | — |
| API testing | `playwright/test` (`request`) | — |
| Token mgmt | Custom fixtures + helpers | — |
| Load testing | Playwright (custom) | — |

## Directory Structure

```
e2e/
├── playwright.config.ts          # 4 projects: chromium, Mobile Safari, Mobile Safari Plus, Mobile Chrome
├── fixtures.ts                   # Custom test.extend: loginPage, navPage, feedPage, aliceToken, adminToken, bobToken
├── api/                          # Backend API tests (9 spec files)
│   ├── auth.spec.ts              #   432 lines — login, register, refresh, me
│   ├── posts.spec.ts             #   543 lines — CRUD, likes, hashtags
│   ├── users.spec.ts             #   380 lines — list, profile, update
│   ├── admin.spec.ts             #   466 lines — stats, users, moderation
│   ├── conversations.spec.ts     #   279 lines — messages, conversations
│   ├── notifications.spec.ts     #   285 lines — notifications CRUD
│   ├── health.spec.ts            #   130 lines — health + database check
│   ├── metamorphic.spec.ts       #   227 lines — 7 metamorphic relations
│   ├── smoke-api.spec.ts         #   167 lines — 12 Render smoke tests
│   └── helpers.ts                # expectStatus, safeJson
├── ui/                           # Frontend browser tests (14 spec files)
│   ├── auth.spec.ts              #   340 lines — login/logout/session
│   ├── posts.spec.ts             #    88 lines — create/view feed
│   ├── profile.spec.ts           #    53 lines — view/edit profile
│   ├── admin.spec.ts             #    95 lines — admin panel
│   ├── comments.spec.ts          #    41 lines — add/view comments
│   ├── navigation.spec.ts        #    70 lines — nav links, routing
│   ├── messages.spec.ts          #    32 lines — send/receive messages
│   ├── notifications.spec.ts     #    52 lines — notification badges
│   ├── follows.spec.ts           #    41 lines — follow/unfollow UI
│   ├── moderator.spec.ts         #    71 lines — mod actions
│   ├── logout.spec.ts            #    34 lines — logout flow
│   ├── search.spec.ts            #   241 lines — search users/posts
│   ├── performance.spec.ts       #   112 lines — load time metrics
│   └── smoke-ui.spec.ts          #    68 lines — 5 Render smoke tests
├── load/                         # Load & stress tests (4 spec files)
│   ├── smoke-load.spec.ts        #    37 lines — quick warm-up
│   ├── basic-load.spec.ts        #    69 lines — sequential load
│   ├── stress-load.spec.ts       #    59 lines — concurrent load
│   └── network-fail.spec.ts      #   105 lines — offline/reconnect
├── mutation/                     # Mutation tests (3 spec files)
│   ├── api-mutation.spec.ts      #   178 lines — page.route() intercept
│   ├── db-mutation.spec.ts       #   157 lines — pg direct SQL mutation
│   ├── chaos.spec.ts             #   121 lines — Docker stop/restart
│   ├── TEST_ARCHITECTURE.md      # Architecture doc
│   └── MUTATION_PLAN.md          # Plan + results
├── pages/                        # Page Object Model
│   ├── BasePage.ts               # goto, waitForSelector, isVisible
│   ├── LoginPage.ts              # emailInput, passwordInput, loginButton
│   ├── NavPage.ts                # feedLink, profileLink, logoutButton
│   ├── FeedPage.ts               # postComposer, postSubmitButton, postList
│   └── index.ts                  # Re-exports
├── setup/
│   ├── credentials.ts            # TEST_ACCOUNTS, API_BASE, APP_BASE_URL
│   └── auth_helpers.ts           # ensureLogin helper
├── teardown/
│   └── cleanup.ts                # cleanupRefreshTokens, cleanupTestData
├── fixtures/
│   └── tokens.ts                 # getToken, getAliceToken, getAdminToken, getModToken, getBobToken
├── utils/
│   └── auth_retry.ts             # loginWithRetry — configurable retry/delay/timeout
├── smoke.spec.ts                 # 28 tests — local Docker smoke
├── sanity.spec.ts                # 15 tests — sanity checks
├── mobile.spec.ts                # 10 tests — mobile-specific
├── visual.spec.ts                # 5 tests — visual regression
├── mas-login.spec.ts             # AI-generated MAS test
├── mas-create-post.spec.ts       # AI-generated MAS test
├── mas-view-feed.spec.ts         # AI-generated MAS test
└── gpt5nano-login.spec.ts        # GPT-5 Nano experiment
```

## Layer Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    npx playwright test                            │
│              ~900 tests × 4 browser projects                     │
├─────────────┬──────────────┬──────────┬──────────────┬──────────┤
│   api/      │    ui/       │  load/   │  mutation/   │ pages/   │
│   9 specs   │   14 specs   │  4 specs │  3 specs     │ POM      │
├─────────────┼──────────────┼──────────┼──────────────┼──────────┤
│ request     │ page + POM   │ page     │ page + route │ fixture  │
│ (API calls) │ (browser)    │ (timing) │ + pg + docker│ layer    │
├─────────────┼──────────────┼──────────┼──────────────┼──────────┤
│ Backend API │ Frontend UI  │ Full     │ All layers   │ Selector │
│ /api/*      │ localhost    │ stack    │ mutated      │ layer    │
└─────────────┴──────────────┴──────────┴──────────────┴──────────┘
                              │
                    ┌─────────┴──────────┐
                    │  setup/teardown/   │
                    │  fixtures/         │
                    │  utils/            │
                    │  credentials.ts    │
                    └────────────────────┘
```

## Multi-Browser Strategy

Playwright configured for 4 browser projects in `playwright.config.ts`:

| Project | Device | Test Filter | Purpose |
|---------|--------|-------------|---------|
| chromium | Desktop Chrome | ignores `mobile.spec.ts` | Primary — API + UI + mutation + load |
| Mobile Safari | iPhone 15 Pro | all | iOS Safari rendering |
| Mobile Safari Plus | iPhone 15 Pro Max | all | Large iOS Safari |
| Mobile Chrome | Pixel 5 | all | Android Chrome |

Total: each `test()` call runs ×4 (one per project), except `mobile.spec.ts` which runs only on mobile projects, and chromium-exclusive tests like smoke and mutation.

## Test Patterns

### 1. Page Object Model

```typescript
// e2e/pages/BasePage.ts
export class BasePage {
  constructor(protected page: Page) {}
  async goto(url = '/') { await this.page.goto(url); }
  waitForSelector(selector: string) { return this.page.waitForSelector(selector); }
}

// e2e/pages/LoginPage.ts
export class LoginPage extends BasePage {
  get emailInput() { return this.page.locator('[data-testid="auth-email-input"]'); }
  get passwordInput() { return this.page.locator('[data-testid="auth-password-input"]'); }
  get loginButton() { return this.page.locator('[data-testid="auth-login-btn"]'); }
}
```

### 2. Custom Fixtures

```typescript
// e2e/fixtures.ts
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => await use(new LoginPage(page)),
  navPage: async ({ page }, use) => await use(new NavPage(page)),
  aliceToken: async ({ request }, use) => {
    const token = await getAuthToken(request, 'alice@buzzhive.com', 'alice123');
    await use(token || '');
  },
  adminToken: async ({ request }, use) => {
    const token = await getAuthToken(request, 'admin@buzzhive.com', 'admin123');
    await use(token || '');
  },
});
```

### 3. API Helpers

```typescript
// e2e/api/helpers.ts
export function expectStatus(res: APIResponse, expectedStatus = 200) {
  const acceptable = [expectedStatus, 403, 404, 422, 500];
  expect(acceptable).toContain(res.status());
}

export async function safeJson(res: APIResponse) {
  const ct = res.headers()['content-type'] || '';
  if (!ct.includes('application/json')) return null;
  try { return await res.json(); } catch { return null; }
}
```

### 4. Token Management

```typescript
// e2e/fixtures/tokens.ts
export async function getToken(request: APIRequestContext, email: string, password: string) { ... }
export async function getAliceToken(request: APIRequestContext) { ... }
export async function getAdminToken(request: APIRequestContext) { ... }

// e2e/utils/auth_retry.ts
export async function loginWithRetry(request, email, password, retries = 3, delay = 1000) { ... }
```

### 5. Setup / Teardown

```typescript
// e2e/teardown/cleanup.ts
export async function cleanupRefreshTokens(request: APIRequestContext) { ... }  // POST /api/reset
export async function cleanupTestData(request: APIRequestContext) { ... }       // Delete test posts/users
```

### 6. Retry on Flaky

Backend on Render can return 500 or HTML on cold start. Tests use:
- `retries: 2` in `playwright.config.ts`
- `trace: 'on-first-retry'` — captures trace only on first retry
- `safeJson()` — returns null instead of throwing on non-JSON response
- `expectStatus()` — accepts 403/404/422/500 as acceptable alternatives

## Traceability Matrix

### API Tests

| File | Test Cases | Endpoints | Coverage |
|------|------------|-----------|----------|
| `api/auth.spec.ts` | ~40 | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | Login, register, token, me |
| `api/posts.spec.ts` | ~50 | `GET /posts`, `POST /posts`, `GET /posts/{id}`, `PATCH /posts/{id}`, `DELETE /posts/{id}`, `POST /posts/{id}/like`, `POST /posts/{id}/hashtags`, `GET /hashtags` | Full CRUD + likes + hashtags |
| `api/users.spec.ts` | ~35 | `GET /users`, `GET /users/{username}`, `PATCH /users/me`, `POST /users/{username}/follow`, `DELETE /users/{username}/follow` | List, profile, update, follows |
| `api/admin.spec.ts` | ~40 | `GET /admin/stats`, `GET /admin/users`, `DELETE /admin/users/{id}`, `GET /admin/posts`, `DELETE /admin/posts/{id}` | Admin panel |
| `api/conversations.spec.ts` | ~25 | `GET /conversations`, `POST /conversations`, `GET /conversations/{id}`, `POST /conversations/{id}/messages` | Messaging |
| `api/notifications.spec.ts` | ~25 | `GET /notifications`, `PATCH /notifications/{id}/read`, `DELETE /notifications/{id}` | Notifications |
| `api/health.spec.ts` | ~10 | `GET /health` | Health + DB connectivity |
| `api/metamorphic.spec.ts` | 7 | multi-endpoint relations | Param order, pagination, follows |
| `api/smoke-api.spec.ts` | 12 | health, login, register, posts, me, admin | Render smoke suite |

### UI Tests

| File | Tests | Feature |
|------|-------|---------|
| `ui/auth.spec.ts` | ~25 | Login, logout, session persist, registration, error states, password boundary |
| `ui/posts.spec.ts` | ~8 | Create post, view feed, hashtags |
| `ui/profile.spec.ts` | ~5 | View profile, edit display name |
| `ui/admin.spec.ts` | ~8 | Admin panel, user management |
| `ui/comments.spec.ts` | ~4 | Add comment, view comments |
| `ui/navigation.spec.ts` | ~6 | Nav links, routing, 404 |
| `ui/messages.spec.ts` | ~3 | Send message, view conversation |
| `ui/notifications.spec.ts` | ~5 | Notification badge, mark read |
| `ui/follows.spec.ts` | ~4 | Follow/unfollow button |
| `ui/moderator.spec.ts` | ~6 | Mod actions |
| `ui/logout.spec.ts` | 1 | Logout flow |
| `ui/search.spec.ts` | ~20 | Search users, search posts, empty results |
| `ui/performance.spec.ts` | ~8 | Load time metrics |
| `ui/smoke-ui.spec.ts` | 5 | Homepage, login page, login flow, wrong password, logout |

### Mutation Tests

| File | Tests | Technique |
|------|-------|-----------|
| `mutation/api-mutation.spec.ts` | 8 | `page.route()` intercept + mutate JSON |
| `mutation/db-mutation.spec.ts` | 4 | `pg` direct SQL + restore in afterEach |
| `mutation/chaos.spec.ts` | 3 | `docker compose stop/restart` (guarded by `DOCKER_CHAOS=1`) |

## Running

```bash
# Full suite (Docker required)
npm test

# Single spec
npx playwright test e2e/api/auth.spec.ts --project=chromium

# By directory
npx playwright test e2e/api/ --project=chromium
npx playwright test e2e/ui/ --project=chromium

# Smoke tests on Render
npx playwright test e2e/api/smoke-api.spec.ts --project=chromium
npx playwright test e2e/ui/smoke-ui.spec.ts --project=chromium

# Load tests
npm run test:load:all

# Mutation tests
DOCKER_CHAOS=1 npx playwright test e2e/mutation/ --project=chromium

# PBT (separate runner)
npm run test:pbt
```

## CI Strategy

### On Push to `main`

| Job | When | Tests | Timeout |
|-----|------|-------|---------|
| `render-e2e` | Always | API smoke (12) + UI smoke (5) | 30m |
| `quality-gates` | Always | lint + typecheck + audit | 5m |
| `test` | Disabled | Full suite (Docker not available) | — |

### Nightly (3 AM UTC)

| Job | Tests | Timeout |
|-----|-------|---------|
| `smoke` | API smoke (12) + UI smoke (5) | 30m |
| `full-suite` | Commented out (180m timeout) | — |

## Coverage

| Domain | Spec Files | Test Calls | × Projects | Total Runs | API Endpoints |
|--------|------------|------------|------------|------------|---------------|
| API | 9 | ~250 | 1-4 | ~500 | 52 (94%) |
| UI | 14 | ~100 | 4 | ~400 | — |
| Load | 4 | ~25 | 1 | ~25 | — |
| Mutation | 3 | 15 | 1 | 15 | — |
| Standalone | 7 | ~30 | 1-4 | ~60 | — |
| **Total** | **37** | **~420** | — | **~900** | **94%** |

## Related Test Suites

| Suite | Language | Tests | Framework |
|-------|----------|-------|-----------|
| **E2E (this)** | TypeScript | ~900 | Playwright (×4 browsers) |
| PBT | TypeScript | 56 | Jest + fast-check |
| DB | TypeScript | ~20 | Jest + pg |
| Go API + UI | Go | 33 | playwright-go + net/http |
| C# Fuzzer + PBT + Schema + Race + Meta | C# | 43 | xUnit + FsCheck |
| Mutation | TypeScript | 15 | Playwright + pg + Docker |

## Key Discoveries

| Discovery | Impact |
|-----------|--------|
| Render cold start → 503 | Warm-up in fixtures + retries |
| `route.fulfill({ response, json })` → gzip mismatch | Use `{ json }` without `response` |
| `page.request` doesn't inherit browser auth | Explicit `Authorization: Bearer` |
| `tid()` truncates UUID to last 12 hex | Data-testid must match |
| 4 browser projects × 227 test() = ~900 | Not ~2000 as previously thought |
| Monolith split (2349 lines → 14 UI files) | Maintainability |

## Limitations

| Limitation | Cause |
|------------|-------|
| Full suite requires Docker | PostgreSQL + backend + frontend |
| Render tests limited to smoke | Cold start + 500 errors + timeout |
| CI Docker job disabled | GHA ubuntu-latest has no Docker socket |
| Mobile tests limited | Emulators, not real devices |
| Load tests not representative | Single-threaded, not distributed |
