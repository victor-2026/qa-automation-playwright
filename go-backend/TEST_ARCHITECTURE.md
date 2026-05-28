# Go Test Architecture

## Purpose

Black-box QA tests for Buzzhive social network. Covers Auth + Posts API and UI flows, portable across local Docker and Render staging.

## Stack

| Component | Library |
|-----------|---------|
| Language | Go 1.26 |
| UI testing | `playwright-go` |
| API testing | `net/http` (stdlib) |
| Assertions | `testify/assert`, `testify/require` |
| Model-based | `testing/quick` (future) |

## Structure

```
go-backend/
├── go.mod / go.sum              # module github.com/victor-2026/qa-automation-playwright/go-backend
├── login_test.go                # 5 UI auth tests (playwright-go)
├── api/
│   ├── client.go                # HTTP client, BaseURL(), WarmUp(), constants
│   ├── helpers.go               # Login(), LoginResponse, UserProfile
│   ├── helpers_test.go          # requireHTTPStatus — shared test helper
│   ├── auth_test.go             # 8 API auth tests (login/me/register)
│   ├── posts_test.go            # 5 API posts tests (list/create/get/unauth)
│   ├── users_test.go            # 6 API users tests (list/profile/update/unauth)
│   ├── follows_test.go          # 5 API follow tests (follow/unfollow/self/dup/unauth)
│   └── warmup_test.go           # TestMain — Render cold start warm-up
└── ui/
    └── auth_test.go             # 4 UI auth tests (session/logout/register)
```

### Layer Diagram

```
┌──────────────────────────────────────────────────┐
│                   go test ./...                  │
├────────────┬─────────────────────┬───────────────┤
│   Root     │     api/            │     ui/       │
│ login_test │ auth_test + posts   │ auth_test     │
│ playwright │ net/http            │ playwright    │
│────────────┼─────────────────────┼───────────────│
│ Frontend UI│ Backend API         │ Frontend UI   │
│ APP_TARGET │ API_BASE_URL        │ APP_TARGET    │
└────────────┴─────────────────────┴───────────────┘
```

## Traceability Matrix

### Root — UI Auth (playwright-go)

| Go Test | TS Equivalent | Test Case ID | Endpoint | Type |
|---------|---------------|-------------|----------|------|
| `TestUserLoginFlow` | `AUTH-001` | AUTH-001 | `POST /auth/login` | UI |
| `TestUserLoginWrongPassword` | `AUTH-002` | AUTH-002 | `POST /auth/login` | UI |
| `TestUserLoginInvalidEmail` | `AUTH-009` | AUTH-009 | `POST /auth/login` | UI |
| `TestUserLoginHTML5EmailValidation` | `AUTH-009` | AUTH-009 | — | UI |
| `TestUserLoginSQLInjection` (×4) | `AUTH-010` | AUTH-010 | `POST /auth/login` | UI |

### api/ — API Auth (net/http)

| Go Test | TS Equivalent | Test Case ID | Endpoint | Type |
|---------|---------------|-------------|----------|------|
| `TestAuthLoginValid` | `AUTH-API-001` | AUTH-API-001 | `POST /auth/login` | API |
| `TestAuthLoginWrongPassword` | `AUTH-API-003` | AUTH-API-003 | `POST /auth/login` | API |
| `TestAuthLoginNonexistentEmail` | `AUTH-API-004` | AUTH-API-004 | `POST /auth/login` | API |
| `TestAuthLoginEmptyBody` | `AUTH-API-005` | AUTH-API-005 | `POST /auth/login` | API |
| `TestAuthMeValidToken` | `AUTH-API-008` | AUTH-API-008 | `GET /auth/me` | API |
| `TestAuthMeNoToken` | `AUTH-API-010` | AUTH-API-010 | `GET /auth/me` | API |
| `TestAuthRegisterNewUser` | `AUTH-API-003` (reg) | AUTH-API-003 | `POST /auth/register` | API |
| `TestAuthRegisterDuplicate` | `AUTH-API-003` (dup) | AUTH-API-003 | `POST /auth/register` | API |

### api/ — API Posts (net/http)

| Go Test | TS Equivalent | Test Case ID | Endpoint | Type |
|---------|---------------|-------------|----------|------|
| `TestPostsListPublic` | `POST-API-001` | POST-API-001 | `GET /posts` | API |
| `TestPostsListAuthenticated` | `POST-API-002` | POST-API-002 | `GET /posts` | API |
| `TestPostsCreate` | `POST-API-002` | POST-API-002 | `POST /posts` | API |
| `TestPostsCreateUnauthorized` | — | — | `POST /posts` | API |
| `TestPostsGetByID` | — | — | `GET /posts/{id}` | API |

### api/ — API Users (net/http)

| Go Test | TS Equivalent | Test Case ID | Endpoint | Type |
|---------|---------------|-------------|----------|------|
| `TestUsersListPublic` | `USERS-API-001` | USERS-API-001 | `GET /users` | API |
| `TestUsersProfileByUsername` | `USERS-API-002` | USERS-API-002 | `GET /users/{username}` | API |
| `TestUsersProfileByUsernamePublic` | `USERS-API-002` | USERS-API-002 | `GET /users/{username}` | API |
| `TestUsersProfileNotFound` | `USERS-API-004` | USERS-API-004 | `GET /users/{username}` | API |
| `TestUsersUpdateProfile` | `USERS-API-005` | USERS-API-005 | `PATCH /users/me` | API |
| `TestUsersUpdateProfileUnauthorized` | `USERS-API-006` | USERS-API-006 | `PATCH /users/me` | API |

### api/ — API Follows (net/http)

| Go Test | TS Equivalent | Test Case ID | Endpoint | Type |
|---------|---------------|-------------|----------|------|
| `TestFollowUser` | `FOLLOW-API-001` | FOLLOW-API-001 | `POST /users/{username}/follow` | API |
| `TestFollowSelf` | `FOLLOW-API-003` | FOLLOW-API-003 | `POST /users/{username}/follow` | API |
| `TestFollowUnauthorized` | `FOLLOW-API-005` | FOLLOW-API-005 | `POST /users/{username}/follow` | API |
| `TestUnfollowUser` | `FOLLOW-API-002` | FOLLOW-API-002 | `DELETE /users/{username}/follow` | API |
| `TestFollowDuplicate` | `FOLLOW-API-004` | FOLLOW-API-004 | `POST /users/{username}/follow` | API |

### ui/ — UI Auth (playwright-go)

| Go Test | TS Equivalent | Test Case ID | Endpoint | Type |
|---------|---------------|-------------|----------|------|
| `TestUILoginSessionPersists` | `AUTH-001` | AUTH-001 | `POST /auth/login` | UI |
| `TestUIAdminLogin` | `AUTH-001` (admin) | AUTH-001 | `POST /auth/login` | UI |
| `TestUILogout` | — | — | `POST /auth/logout` | UI |
| `TestUIRegisterNewUser` | `AUTH-004` | AUTH-004 | `POST /auth/register` | UI |

## Test Patterns

### API Tests (table-driven style)
```go
func TestAuthLoginValid(t *testing.T) {
    resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
    require.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode)
    assert.NotEmpty(t, loginResp.AccessToken)
}
```

### UI Tests (playwright-go fixture)
```go
func TestUIAdminLogin(t *testing.T) {
    runUITest(t, func(page playwright.Page, baseURL string) {
        page.Locator("[data-testid='auth-email-input']").Fill("admin@...")
        page.Locator("[data-testid='auth-login-btn']").Click()
        // ... assert tokens in localStorage
    })
}
```

### Shared helpers
```go
requireHTTPStatus(t, resp, 401, 403)  // allow either
Login(email, password)                // returns (*http.Response, *LoginResponse)
WarmUp(urls...)                       // retry cold start
```

## Running

```bash
# Local (Docker required)
go test ./...

# Render staging
APP_TARGET_URL=https://qa-automation-playwright-front.onrender.com \
API_BASE_URL=https://buzzhive-test.onrender.com/api \
go test ./...

# Via npm
npm run test:go            # local
npm run test:go:render     # Render
npm run test:go:coverage   # + coverage/go/coverage.html
```

## Dual-Target Design

```
APP_TARGET_URL → Frontend URL (used by playwright-go UI tests)
API_BASE_URL   → Backend API URL (used by net/http API tests)

Default: localhost:3000 / localhost:8000/api
Override: any URL (Render, staging, etc.)
```

All URLs consumed via `os.Getenv()`. No hardcoded domains in assertions.

## Warm-Up Strategy

Render free tier sleeps after 15 min of inactivity. First request returns 503 (cold start, ~5-15s).

- `api/warmup_test.go` — `TestMain` fires `GET /api/health` up to 3 times before API tests
- `login_test.go` / `ui/auth_test.go` — `warmUp()` fires `GET /login` before UI tests
- Timeout: 30s per attempt, 2s delay between retries

## Error Handling

Backend on Render can return HTML instead of JSON on 5xx (common free-tier issue).

| Scenario | Handling | Pattern |
|----------|----------|---------|
| HTML 500 instead of JSON | `requireHTTPStatus` checks status before body parse | `resp, loginResp, err := Login(...)` |
| JSON parse failure | `json.Unmarshal` returns error → test fails with clear message | `err = json.Unmarshal(body, &resp)` |
| Body is not JSON (HTML) | `strings.HasPrefix(body, "<")` → skip body assertions | Checked in `requireHTTPStatus` |
| Connection refused | `net/http` returns error → `require.NoError` fails | `client.Do(req)` wraps error |

Tests use `requireHTTPStatus(t, resp, expectedCodes...)` which validates the HTTP status code **before** attempting to parse the body. This prevents confusing JSON parse errors when the backend returns HTML.

```go
func requireHTTPStatus(t *testing.T, resp *http.Response, codes ...int) {
    body, _ := io.ReadAll(resp.Body)
    if len(body) > 0 && body[0] == '<' { // HTML response
        t.Logf("Warning: HTML response (backend error page): %.100s", body)
    }
    assert.Contains(t, codes, resp.StatusCode)
}
```

## Race Detection

Go's `-race` flag is **not enabled** in the current test setup. Reasons:

| Factor | Detail |
|--------|--------|
| Test target | Black-box API calls → no shared Go memory |
| API races | Tested via sequential requests, not concurrent goroutines |
| Build time | `-race` adds 2-3× overhead to 33 tests |
| Coverage | Concurrent API tests are covered by C# RaceTests.cs (4 tests) |

If concurrent Go API tests are added in the future, enable with:
```bash
go test -race ./...
```

For now, race conditions in the backend are detected by the C# race test suite (`csharp-backend/RaceTests.cs`), which sends concurrent HTTP requests from separate goroutines/threads.

## Cleanup

Go tests create test entities (users, posts) during execution. Cleanup strategy:

| Entity | Created By | Cleanup Method | Timing |
|--------|-----------|----------------|--------|
| User (register) | `TestAuthRegisterNewUser`, `TestAuthRegisterDuplicate` | `POST /api/reset` (admin token) | Go tests run after `TestMain` warm-up, which calls reset |
| Post | `TestPostsCreate` | `DELETE /api/posts/{id}` via `t.Cleanup()` | After each test |
| Follow | `TestFollowUser`, `TestFollowDuplicate`, `TestUnfollowUser` | `DELETE /api/users/{username}/follow` | After each test via `t.Cleanup()` |
| UI session | All UI tests | Browser close + `POST /api/reset` | `t.Cleanup()` destroys playwright browser |

```go
t.Cleanup(func() {
    if createdPostID != "" {
        req, _ := http.NewRequest("DELETE", fmt.Sprintf("%s/posts/%s", BaseURL(), createdPostID), nil)
        req.Header.Set("Authorization", "Bearer "+adminToken)
        client.Do(req)
    }
})
```

For UI tests, each browser context is destroyed after the test via playwright's `browser.Close()`.

## Coverage

| Package   | Tests          | Coverage | Type |
| --------- | -------------- | -------- | ---- |
| Root      | 5 (9 subtests) | —        | UI   |
| `api/`    | 24             | 40.0%    | HTTP |
| `ui/`     | 4              | —        | UI   |
| **Total** | **33**         | —        |      |

## Related Test Suites

| Suite       | Language   | Tests | Framework                   |
| ----------- | ---------- | ----- | --------------------------- |
| E2E API     | TypeScript | ~900  | Playwright (227×4 browsers) |
| PBT         | TypeScript | 56    | Jest + fast-check           |
| Metamorphic | TypeScript | 7     | Playwright                  |
| Go API + UI | Go         | 33    | playwright-go + net/http    |
| DB          | TypeScript | —     | Jest + pg                   |
