# Go Test Architecture

## Purpose
Black-box QA tests for Buzzhive social network API. Covers Users and Follows endpoints via `net/http`. Portable across local Docker and Render staging.

## Stack

| Component | Library |
|-----------|---------|
| Language | Go 1.26 |
| API testing | `net/http` (stdlib) |
| Assertions | `testify/assert`, `testify/require` |
| JSON | `encoding/json` (stdlib) |

## Structure

```
go-backend/
├── api/
│   ├── users_test.go        — 6 tests (list/profile/update/unauthorized)
│   └── follows_test.go      — 5 tests (follow/unfollow/self/dup/unauth)
```

## Test Matrix

### api/ — API Users (net/http)

| Go Test | TS Equivalent | Endpoint | Status |
|---------|---------------|----------|--------|
| `TestUsersListPublic` | `USERS-API-001` | `GET /users` | ✅ |
| `TestUsersProfileByUsername` | `USERS-API-002` | `GET /users/{username}` | ✅ |
| `TestUsersProfileByUsernamePublic` | `USERS-API-002` | `GET /users/{username}` | ✅ |
| `TestUsersProfileNotFound` | `USERS-API-004` | `GET /users/{username}` (404) | ✅ |
| `TestUsersUpdateProfile` | `USERS-API-005` | `PATCH /users/me` | ✅ |
| `TestUsersUpdateProfileUnauthorized` | `USERS-API-006` | `PATCH /users/me` (no token) | ✅ |

### api/ — API Follows (net/http)

| Go Test | TS Equivalent | Endpoint | Status |
|---------|---------------|----------|--------|
| `TestFollowUser` | `FOLLOW-API-001` | `POST /users/{username}/follow` | ✅ |
| `TestFollowSelf` | `FOLLOW-API-003` | `POST /users/{username}/follow` (self) | ✅ |
| `TestFollowUnauthorized` | `FOLLOW-API-005` | `POST /users/{username}/follow` (no token) | ✅ |
| `TestUnfollowUser` | `FOLLOW-API-002` | `DELETE /users/{username}/follow` | ✅ |
| `TestFollowDuplicate` | `FOLLOW-API-004` | `POST /users/{username}/follow` (duplicate) | ✅ |

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
| Users API | 6 | `GET /users`, `GET /users/{username}`, `PATCH /users/me` | HTTP |
| Follows API | 5 | `POST/DELETE /users/{username}/follow` | HTTP |
| **Total** | **11** | **4 endpoints** | |

## Running

```bash
# Local (Docker required)
go test ./...

# Render staging
API_BASE_URL=https://buzzhive-test.onrender.com/api go test ./...

# Via npm
npm run test:go            # local
npm run test:go:render     # Render
```

## Limitations

| Limitation | Impact |
|------------|--------|
| No `safeJson` helper | Panics on HTML response (Render cold start) |
| No retry mechanism | Single attempt — fails on cold start 503 |
| No `t.Cleanup()` | Tests leave state (created follows) |
| No `-race` tests | Data races undetected |
| No warm-up fixture | First test may hit cold start |
| No go.mod in repo | Tests may not compile without module init |

## Related Test Suites

| Suite | Language | Tests | Framework |
|-------|----------|-------|-----------|
| Go API | Go | 11 | net/http + testify |
| E2E API | TypeScript | ~1157 | Playwright (×4 browsers) |
| C# Fuzzer + PBT + Schema + Race + Meta | C# | 41 | xUnit + FsCheck |
