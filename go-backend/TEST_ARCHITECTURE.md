# Go Test Architecture

## Purpose
Black-box QA tests for Buzzhive social network API. Covers Auth, Posts, Users, Follows endpoints via `net/http`, plus Playwright Go browser tests. Portable across local Docker and Render staging.

## Stack

| Component | Library |
|-----------|---------|
| Language | Go 1.26 |
| API testing | `net/http` (stdlib) |
| Browser testing | `playwright-go` v0.5700.1 |
| Assertions | `testify/assert`, `testify/require` |
| JSON | `encoding/json` (stdlib) |

## Structure

```
go-backend/
├── go.mod                       — module definition
├── go.sum                       — dependency checksums
├── api/                         — package api (net/http tests)
│   ├── client.go                — BaseURL, HTTPClient, WarmUp, BearerHeader
│   ├── helpers.go               — Login, LoginResponse, UserProfile, Post types
│   ├── helpers_test.go          — requireHTTPStatus helper
│   ├── auth_test.go             — 8 tests (login, register, /auth/me)
│   ├── posts_test.go            — 5 tests (list, create, get by ID)
│   ├── users_test.go            — 6 tests (list, profile, update)
│   ├── follows_test.go          — 5 tests (follow, unfollow, self, dup)
│   └── warmup_test.go           — TestMain warm-up for Render cold start
├── cmd/
│   ├── api-tests/               — package main (Playwright Go API tests)
│   │   └── login_test.go        — 5 tests (login flow, wrong pass, SQL injection)
│   └── ui-tests/                — package main (Playwright Go UI tests)
│       └── auth_test.go         — 4 tests (session, admin, logout, register)
└── TEST_ARCHITECTURE.md         — this file
```

**Total: 24 API tests + 9 Playwright Go tests = 33 Go tests**

## Test Matrix

### api/ — Auth (net/http)

| Go Test | TS Equivalent | Endpoint | Status |
|---------|---------------|----------|--------|
| `TestAuthLoginValid` | `AUTH-API-001` | `POST /auth/login` | ✅ |
| `TestAuthLoginWrongPassword` | `AUTH-API-002` | `POST /auth/login` | ✅ |
| `TestAuthLoginNonexistentEmail` | `AUTH-API-003` | `POST /auth/login` | ✅ |
| `TestAuthLoginEmptyBody` | `AUTH-API-005` | `POST /auth/login` | ✅ |
| `TestAuthMeValidToken` | `AUTH-API-008` | `GET /auth/me` | ✅ |
| `TestAuthMeNoToken` | `AUTH-API-010` | `GET /auth/me` | ✅ |
| `TestAuthRegisterNewUser` | `AUTH-API-003` | `POST /auth/register` | ✅ |
| `TestAuthRegisterDuplicate` | `AUTH-API-004` | `POST /auth/register` | ✅ |

### api/ — Posts (net/http)

| Go Test | TS Equivalent | Endpoint | Status |
|---------|---------------|----------|--------|
| `TestPostsListPublic` | `POST-API-001` | `GET /posts` | ✅ |
| `TestPostsListAuthenticated` | `POST-API-002` | `GET /posts` (auth) | ✅ |
| `TestPostsCreate` | `POST-API-003` | `POST /posts` | ✅ |
| `TestPostsCreateUnauthorized` | `POST-API-006` | `POST /posts` (no token) | ✅ |
| `TestPostsGetByID` | `POST-API-004` | `GET /posts/{id}` | ✅ |

### api/ — Users (net/http)

| Go Test | TS Equivalent | Endpoint | Status |
|---------|---------------|----------|--------|
| `TestUsersListPublic` | `USERS-API-001` | `GET /users` | ✅ |
| `TestUsersProfileByUsername` | `USERS-API-002` | `GET /users/{username}` | ✅ |
| `TestUsersProfileByUsernamePublic` | `USERS-API-002` | `GET /users/{username}` | ✅ |
| `TestUsersProfileNotFound` | `USERS-API-004` | `GET /users/{username}` (404) | ✅ |
| `TestUsersUpdateProfile` | `USERS-API-005` | `PATCH /users/me` | ✅ |
| `TestUsersUpdateProfileUnauthorized` | `USERS-API-006` | `PATCH /users/me` (no token) | ✅ |

### api/ — Follows (net/http)

| Go Test | TS Equivalent | Endpoint | Status |
|---------|---------------|----------|--------|
| `TestFollowUser` | `FOLLOW-API-001` | `POST /users/{username}/follow` | ✅ |
| `TestFollowSelf` | `FOLLOW-API-003` | `POST /users/{username}/follow` (self) | ✅ |
| `TestFollowUnauthorized` | `FOLLOW-API-005` | `POST /users/{username}/follow` (no token) | ✅ |
| `TestUnfollowUser` | `FOLLOW-API-002` | `DELETE /users/{username}/follow` | ✅ |
| `TestFollowDuplicate` | `FOLLOW-API-004` | `POST /users/{username}/follow` (duplicate) | ✅ |

### cmd/ — Playwright Go (browser tests)

| Go Test | TS Equivalent | Description | Status |
|---------|---------------|-------------|--------|
| `TestUserLoginFlow` | `AUTH-001` | Login via UI | ✅ |
| `TestUserLoginWrongPassword` | `AUTH-002` | Wrong password UI error | ✅ |
| `TestUserLoginInvalidEmail` | `AUTH-009` | Non-existent email | ✅ |
| `TestUserLoginHTML5EmailValidation` | `AUTH-009` | Browser email validation | ✅ |
| `TestUserLoginSQLInjection` | `AUTH-010` | SQL injection (4 payloads) | ✅ |
| `TestUILoginSessionPersists` | — | Login + reload + check token | ✅ |
| `TestUIAdminLogin` | — | Admin login via UI | ✅ |
| `TestUILogout` | — | Login + logout + check cleared | ✅ |
| `TestUIRegisterNewUser` | — | Register via UI | ✅ |

## Test Patterns

### Table-driven API tests with testify
```go
func TestUsersListPublic(t *testing.T) {
    resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
    require.NoError(t, err)
    resp.Body.Close()

    req := createAuthRequest(t, "GET", BaseURL()+"/users", loginResp.AccessToken, nil)
    listResp, err := HTTPClient().Do(req)
    require.NoError(t, err)
    defer listResp.Body.Close()

    assert.Equal(t, http.StatusOK, listResp.StatusCode)

    var result map[string]interface{}
    err = json.NewDecoder(listResp.Body).Decode(&result)
    require.NoError(t, err)
    assert.NotZero(t, result["total"])
}
```

### Flexible status with requireHTTPStatus
```go
requireHTTPStatus(t, followResp, http.StatusCreated, http.StatusConflict)
```

### Warm-up for Render cold start
```go
func TestMain(m *testing.M) {
    WarmUp(BaseURL() + "/health")
    os.Exit(m.Run())
}
```

## Error Handling

### Backend returns non-JSON (HTML on Render cold start)
- Tests use `json.NewDecoder(resp.Body).Decode()` — will fail with non-JSON
- **No `safeJson` equivalent** — unlike TS which has `safeJson()` that returns null
- **Recommendation:** add `safeJson()` helper in Go that checks `Content-Type` before parsing

### Flexible status codes
- `requireHTTPStatus(t, resp, 200, 201, 409)` — accepts multiple valid statuses
- Backend may return 500 on cold start — no retry mechanism currently
- **Recommendation:** add retry wrapper for Render cold start (similar to TS `loginWithRetry`)

## Race Detection

- **`go test -race` NOT used** — Go tests are sequential (single goroutine per test)
- No parallel sub-tests with `t.Parallel()`
- TS already covers race conditions (refresh token race, follow storm)
- **Recommendation:** add 2-3 concurrent tests (parallel login, parallel follows) with `go test -race` to leverage Go's race detector

## Cleanup

- **No `t.Cleanup()` hooks** — tests don't clean up created resources
- `resp.Body.Close()` via `defer` — only HTTP body cleanup
- Created follows are NOT unfollowed after test
- **Recommendation:** add `t.Cleanup(func() { ... })` to unfollow/cleanup created resources

## Coverage

| Domain | Tests | Endpoints Covered | Type |
|--------|-------|-------------------|------|
| Auth API | 8 | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | HTTP |
| Posts API | 5 | `GET /posts`, `POST /posts`, `GET /posts/{id}` | HTTP |
| Users API | 6 | `GET /users`, `GET /users/{username}`, `PATCH /users/me` | HTTP |
| Follows API | 5 | `POST/DELETE /users/{username}/follow` | HTTP |
| Playwright Go | 9 | Login, Register, Logout (browser) | Browser |
| **Total** | **33** | **10 endpoints** | |

## Running

```bash
# Local (Docker required)
cd go-backend && go test ./api/ -v

# API tests only (no browser)
cd go-backend && go test ./api/ -v -count=1

# Playwright Go tests (requires playwright browsers installed)
cd go-backend && go test ./cmd/api-tests/ -v
cd go-backend && go test ./cmd/ui-tests/ -v

# Render staging
API_BASE_URL=https://buzzhive-test.onrender.com/api go test ./api/ -v

# All Go tests
cd go-backend && go test ./... -v
```

## Limitations

| Limitation | Impact |
|------------|--------|
| No `safeJson` helper | Panics on HTML response (Render cold start) |
| No retry mechanism | Single attempt — fails on cold start 503 |
| No `t.Cleanup()` | Tests leave state (created follows) |
| No `-race` tests | Data races undetected |
| Playwright Go requires browser install | `go install github.com/playwright-community/playwright-go/cmd/playwright@latest` |

## Related Test Suites

| Suite | Language | Tests | Framework |
|-------|----------|-------|-----------|
| Go API | Go | 24 | net/http + testify |
| Go Playwright | Go | 9 | playwright-go + testify |
| E2E API | TypeScript | ~1157 | Playwright (×4 browsers) |
| C# Fuzzer + PBT + Schema + Race + Meta | C# | 41 | xUnit + FsCheck |
