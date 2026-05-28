# C# Test Architecture

## Purpose
Black-box QA tests for Buzzhive social network API. Covers crash detection (Fuzzer), property-based invariants (PBT), JSON schema validation (Schema), concurrent race conditions (Race), and input/output metamorphic relations (Metamorphic). Portable across local Docker and Render staging.

## Stack

| Component | NuGet | Version |
|-----------|-------|---------|
| Language | .NET | 10.0 |
| Test runner | xUnit | 2.* |
| PBT | FsCheck.Xunit | 3.* |
| JSON | Newtonsoft.Json | 13.* |

## Structure

```
csharp-backend/
├── csharp-backend.csproj       # .NET 10 + xUnit + FsCheck + Newtonsoft.Json
├── ApiClient.cs                 # Shared HTTP client (Get, Post, Patch, Delete, Login, WarmUp)
├── WarmupFixture.cs             # Render cold start warm-up (3 retries, GET /health)
├── FuzzerTests.cs               # 16 tests — crash detection (invalid payloads)
├── PropertiesTests.cs           # 8 tests — FsCheck property-based (100+ iterations)
├── SchemaTests.cs               # 5 tests — JSON response schema validation
├── RaceTests.cs                 # 4 tests — concurrent requests (Task.WhenAll)
└── MetamorphicTests.cs          # 7 tests — input/output relations (ported from TS)
```

## Module Diagram

```
                    ┌──────────────────────┐
                    │   dotnet test         │
                    │   40 tests total      │
                    └──────┬───────┬───────┘
                           │       │
              ┌────────────┘       └─────────┐
              ▼                              ▼
   ┌─────────────────────┐        ┌────────────────────┐
   │   Fuzzer (16 tests) │        │  PBT (8 tests)     │
   │   Crash detection   │        │  FsCheck properties│
   │   Random/invalid    │        │  100+ iterations   │
   │   payloads          │        │  each              │
   └─────────┬───────────┘        └─────────┬──────────┘
             │                              │
             ▼                              ▼
   ┌─────────────────────┐        ┌────────────────────┐
   │ Schema (5 tests)    │        │  Race (4 tests)    │
   │ JSON schema         │        │  Concurrent        │
   │ validation          │        │  requests          │
   │ (fields, types)     │        │  (Task.WhenAll)    │
   └─────────┬───────────┘        └─────────┬──────────┘
             │                              │
             ▼                              ▼
   ┌─────────────────────────────────────────────────────┐
   │           Metamorphic (7 tests)                     │
   │   Relations between inputs/outputs                  │
   │   Ported from TypeScript e2e/api/metamorphic.spec.ts│
   └─────────────────────────────────────────────────────┘
             │
             ▼
   ┌─────────────────────────────────────────────────────┐
   │              Shared Infrastructure                  │
   │  ApiClient.cs  │  WarmupFixture.cs                  │
   │  Login, PostRaw, PatchRaw, WithToken, WithoutToken  │
   └─────────────────────────────────────────────────────┘
```

## Approaches

### 1. Fuzzer — Crash Detection
**Pattern:** Send deliberately broken payloads, assert no 5xx (crash detection).

| Group | Tests | Pattern | Endpoints |
|-------|-------|---------|-----------|
| Login | 7 | `PostRaw("/auth/login", "{}")` → `Assert.Equal(422, status)` | `POST /auth/login` |
| Posts | 3 | `Post("/posts", hugeContent)` → `Assert.InRange(400, 500)` | `POST /posts` |
| Auth | 3 | `WithToken("garbage").Get("/auth/me")` → `Assert.Equal(401, status)` | `GET /auth/me` |
| UUID | 2 | `Get("/posts/not-a-uuid")` → `Assert.InRange(400, 422)` | `GET /posts/{id}` |
| User | 1 | `Get("/users/__nonexistent__")` → `Assert.Equal(404, status)` | `GET /users/{username}` |

**Key technique:** `Assert.InRange` tolerates backend variability (422 vs 400, 401 vs 403).

### 2. PBT — FsCheck Properties
**Pattern:** `[Property(MaxTest = N)]` generates random inputs, asserts invariants.

| Property | Invariant | Iterations |
|----------|-----------|------------|
| `Login_EmailCaseVariant_NoCrash` | Any case → 200 or 401 | 100 |
| `Login_EmailLowercase_AlwaysWorks` | Lowercase → 200 + token | 100 |
| `Register_InvalidEmail_Returns4xx` | Random string → 4xx | 100 |
| `Post_ContentLength` | Content length 0-5000 → no crash | 50 |
| `Pagination_NoOverlap` | Page range → unique IDs | 5 |
| `Username_KnownUser_Returns200` | Known usernames → 200 + id | 10 |
| `Register_Parallel_NoDuplicates` | 5 concurrent → no 5xx | 3 |

**Key technique:** FsCheck generates random strings, integers; `Task<bool>` for async API calls.

### 3. Schema — JSON Response Validation
**Pattern:** `JObject.Parse` + `JTokenType` assertions catch schema drift.

| Test | Endpoint | Fields Checked |
|------|----------|---------------|
| `Schema_LoginResponse` | `POST /auth/login` | `access_token` (JWT, 3 parts), `refresh_token`, `token_type=bearer` |
| `Schema_ProfileResponse` | `GET /auth/me` | `id`, `email`, `username`, `role` (strings), `is_*` (bools) |
| `Schema_PostsListResponse` | `GET /posts` | `items` (array), `total` (int), each item: `id`, `content`, `author` |
| `Schema_PostDetailResponse` | `GET /posts/{id}` | `id`, `content`, `author` (+ `id`, `username`, `display_name`) |
| `Schema_HealthResponse` | `GET /health` | `status=healthy`, `database=connected` |

### 4. Race — Concurrent Requests
**Pattern:** `Task.WhenAll(tasks)` fires N requests in parallel.

| Test | Concurrency | Assertion |
|------|-------------|-----------|
| `Race_LoginStorm` | 10× `POST /auth/login` | All 200 + `access_token` |
| `Race_PostCreateStorm` | 10× `POST /posts` | All 201 or 429, cleanup |
| `Race_RefreshTokenRace` | 5× `POST /auth/refresh` | ≥1 success, all 2xx-4xx |
| `Race_FollowUnfollowStorm` | 5× follow + 5× unfollow | No 5xx (BUG-002) |

### 5. Metamorphic — Input/Output Relations
**Pattern:** Two related API calls, assert relationship.

| Test | Relation | Ported From |
|------|----------|-------------|
| `MET002_QueryParamOrderIndependence` | `?page=1&per_page=5` == `?per_page=5&page=1` | `metamorphic.spec.ts` |
| `MET003_FollowUnfollowSymmetry` | follow + unfollow → count returns | `metamorphic.spec.ts` |
| `MET004_ExistenceNegation` | existing → 200, nonexistent → 404 | `metamorphic.spec.ts` |
| `MET005_PaginationDisjointSets` | page 1 ∩ page 2 = ∅ | `metamorphic.spec.ts` |
| `MET006_SelfFollowConsistency` | self-follow → 400-409 | `metamorphic.spec.ts` |
| `MET007_AuthTokenConsistency` | 3× login → same structure | `metamorphic.spec.ts` |

## Traceability Matrix (TS equivalents)

### Fuzzer

| C# Test | TS Equivalent | Endpoint |
|---------|---------------|----------|
| Login empty + null + SQLi + huge + unicode | `AUTH-API-005` (partial) | `POST /auth/login` |
| Post empty + huge + unicode | `POST-API-003` (partial) | `POST /posts` |
| Auth header garbage + expired | `AUTH-API-010` | `GET /auth/me` |
| UUID garbage | `POST-API-004` | `GET /posts/{id}` |
| Nonexistent user | `USERS-API-004` | `GET /users/{username}` |

### PBT

| C# Property | TS Equivalent | Endpoint |
|-------------|---------------|----------|
| Login email case | `MET-001` | `POST /auth/login` |
| Register valid/invalid email | `AUTH-API-003` | `POST /auth/register` |
| Post content length | `POST-API-003` | `POST /posts` |
| Pagination | `MET-005` | `GET /posts` |
| Username exists | `USERS-API-002` | `GET /users/{username}` |
| Parallel register | — (no TS equivalent) | `POST /auth/register` |

### Schema

| C# Test | TS Equivalent | Endpoint |
|---------|---------------|----------|
| Login response schema | `AUTH-API-001` | `POST /auth/login` |
| Profile response schema | `AUTH-API-008` | `GET /auth/me` |
| Posts list schema | `POST-API-001` | `GET /posts` |
| Post detail schema | `POST-API-004` | `GET /posts/{id}` |
| Health schema | health.spec.ts | `GET /health` |

### Race

| C# Test | TS Equivalent | Endpoint |
|---------|---------------|----------|
| Login storm | — (no TS equiv) | `POST /auth/login` |
| Post create storm | — (no TS equiv) | `POST /posts` |
| Refresh token race | — (no TS equiv) | `POST /auth/refresh` |
| Follow/unfollow storm | — (no TS equiv) | `POST/DELETE /users/{username}/follow` |

### Metamorphic

| C# Test | TS Equivalent | Endpoint |
|---------|---------------|----------|
| `MET002` | `MET-002` | `GET /posts` |
| `MET003` | `MET-003` | Follow endpoints |
| `MET004` | `MET-004` | `GET /users/{username}` |
| `MET005` | `MET-005` | `GET /posts` |
| `MET006` | `MET-006` | `POST /users/{username}/follow` |
| `MET007` | `MET-007` | `POST /auth/login` |

## Coverage (API Endpoints)

| Endpoint | Fuzzer | PBT | Schema | Race | Meta |
|----------|--------|-----|--------|------|------|
| `GET /health` | — | — | ✅ | — | — |
| `POST /auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/register` | — | ✅ | — | — | — |
| `POST /auth/refresh` | — | — | — | ✅ | — |
| `GET /auth/me` | ✅ | — | ✅ | — | ✅ |
| `GET /posts` | — | ✅ | ✅ | — | ✅ |
| `GET /posts/{id}` | ✅ | — | ✅ | — | — |
| `POST /posts` | ✅ | ✅ | — | ✅ | — |
| `GET /users` | — | — | — | — | — |
| `GET /users/{username}` | ✅ | ✅ | — | — | ✅ |
| `PATCH /users/me` | — | — | — | — | — |
| `POST /users/{username}/follow` | — | — | — | ✅ | ✅ |
| `DELETE /users/{username}/follow` | — | — | — | ✅ | ✅ |

**Coverage:** 11/13 endpoints covered across modules = **85%**. Missing: `GET /users`, `PATCH /users/me`.

## Porting from TypeScript: Rules & Process

### When to port a TS test to C#
1. **The test catches a real bug** — BUG-002 (follow race) was found by C#, not TS
2. **The test has different angle** — C# adds Fuzzer/Schema/Race dimensions TS doesn't have
3. **The test can be property-based** — FsCheck generates 100+ cases vs TS manual 1-2

### When NOT to port
1. **UI tests** — C# has no Playwright, only API via `HttpClient`
2. **Complex multi-step flows** — TS fixtures + Page Objects handle this better
3. **Visual regression** — Screenshot-based, C# can't do this

### Porting pattern
```csharp
// TS original
test('MET-002: Query param order independence', async ({ request }) => {
  const res1 = await request.get(`${API}/posts?page=1&per_page=5`);
  const res2 = await request.get(`${API}/posts?per_page=5&page=1`);
  expect(res1.status()).toBe(200);
  expect(res2.status()).toBe(200);
});

// C# port
[Fact]
public async Task MET002_QueryParamOrderIndependence() {
    var res1 = await _api.Get("/posts?page=1&per_page=5");
    var res2 = await _api.Get("/posts?per_page=5&page=1");
    Assert.Equal(200, (int)res1.StatusCode);
    Assert.Equal(200, (int)res2.StatusCode);
}
```

## Bugs Found

| Bug | Module | Cause | Found By |
|-----|--------|-------|----------|
| BUG-001 | Posts | Unicode control chars → 500 | Fuzzer |
| BUG-002 | Follows | Concurrent follow/unfollow → 500 | Race |
| BUG-003 | Auth | Parallel register → duplicates (username) | PBT |
| BUG-004 | Auth | Parallel register → 500 (IntegrityError) | PBT |

## Running

```bash
# Local (Docker required)
dotnet test

# Single module
dotnet test --filter "Category=Fuzzer"
dotnet test --filter "Category=PBT"
dotnet test --filter "Category=Schema"
dotnet test --filter "Category=Race"
dotnet test --filter "Category=Metamorphic"

# Render staging
API_BASE_URL=https://buzzhive-test.onrender.com/api dotnet test

# Single test
dotnet test --filter "FullyQualifiedName~Schema_HealthResponse"
```

## Related Test Suites

| Suite | Language | Tests | Framework |
|-------|----------|-------|-----------|
| C# Fuzzer + PBT + Schema + Race + Meta | C# | 41 | xUnit + FsCheck |
| Go API | Go | 11 | net/http + testify |
| E2E API | TypeScript | ~1157 | Playwright (×4 browsers) |
| PBT | TypeScript | 56 | Jest + fast-check |
