# C# Testing Plans

**Context:** Educational C# tests for Buzzhive API (black-box, no backend source mutation).
**Stack:** .NET + xUnit + FsCheck (PBT) + Microsoft.Playwright.NUnit (optional)

---

## 1. API Fuzzer — `Fuzzer.cs`

Send random/invalid payloads to all endpoints. Assert no 5xx (crash detection).

| Test | Payload | Endpoint |
|------|---------|----------|
| Login empty | `{}` | `POST /auth/login` |
| Login null | `{"email":null,"password":null}` | `POST /auth/login` |
| Login SQLi | `"' OR '1'='1"` | `POST /auth/login` |
| Login huge | `"a" * 10000` | `POST /auth/login` |
| Login unicode | `"\u0000\x01\uFFFF"` | `POST /auth/login` |
| Post empty | `{}` | `POST /posts` |
| Post 5000 chars | `"a" * 5000` | `POST /posts` |
| Post unicode | `"\u0000\x01"` | `POST /posts` |
| Auth header garbage | `"Bearer \x00\x01"` | `GET /auth/me` |
| UUID garbage | `"not-a-uuid"` | `GET /posts/{id}` |

**Framework:** xUnit `[Theory]` + `[InlineData]` / `[MemberData]`

## 2. FsCheck (PBT) — `Properties.cs`

Property-based tests via FsCheck (C# fast-check equivalent).

| Property | Generator | Invariant |
|----------|-----------|-----------|
| Login email case | Any email | `Login(email.upper) == Login(email.lower)` |
| Register valid email | RFC 5322 emails | 201 or 409 |
| Register invalid email | Garbage strings | 400 or 422 |
| Post content length | 0..5000 chars | 201 or 4xx |
| Pagination offset | Page 1..10 | No ID overlap |
| Username exists | Known usernames | Always 200 + `id` field |
| Parallel register | Race calls | No duplicate users |

**Framework:** FsCheck `[Property]` + xUnit integration

## 3. Response Schema Fuzzer — `SchemaTests.cs`

Validate all responses are valid JSON with expected structure.

| Check | Endpoint | Expected |
|-------|----------|----------|
| Login response | `POST /auth/login` | `access_token`, `refresh_token`, `token_type` |
| Profile response | `GET /auth/me` | `id`, `email`, `username`, `role` |
| Posts response | `GET /posts` | Array with `id`, `title` |
| Post detail | `GET /posts/{id}` | `id`, `title`, `content`, `author` |
| Health response | `GET /health` | `status`, `database` |

**Framework:** xUnit + Newtonsoft.Json or System.Text.Json

## 4. Race Condition Fuzzer — `RaceTests.cs`

Concurrent requests to catch race conditions.

| Test | Concurrency | Endpoint |
|------|-------------|----------|
| Login storm | 10 goroutines | `POST /auth/login` |
| Post create storm | 10 goroutines | `POST /posts` |
| Refresh token race | 5 refreshes | `POST /auth/refresh` |
| Follow/unfollow race | 10 ops | `POST/DELETE /users/{id}/follow` |

**Framework:** xUnit + Task.WhenAll + parallel requests

## 5. Metamorphic Relations (Port from TS) ✅

All 7 metamorphic tests ported to C# `MetamorphicTests.cs`.

| Metamorphic | C# Test | Status |
|-------------|---------|--------|
| MET-001 Email case | `MET001_LoginCaseInsensitivity` | ✅ Done |
| MET-002 Param order | `MET002_QueryParamOrderIndependence` | ✅ Done |
| MET-003 Follow symmetry | `MET003_FollowUnfollowSymmetry` | ✅ Done |
| MET-004 Existence negation | `MET004_ExistenceNegation` | ✅ Done |
| MET-005 Pagination disjoint | `MET005_PaginationDisjointSets` | ✅ Done |
| MET-006 Self-follow | `MET006_SelfFollowConsistency` (×2 users) | ✅ Done |
| MET-007 Auth consistency | `MET007_AuthTokenConsistency` | ✅ Done |

---

## Project Structure (current)

```
csharp-backend/
├── csharp-backend.csproj     # .NET 10 + xUnit + FsCheck + Newtonsoft.Json
├── ApiClient.cs               # Shared HTTP client (Get, Post, Patch, Delete, Login)
├── WarmupFixture.cs           # Render cold start warm-up
├── FuzzerTests.cs             # 19 fuzz tests (login, posts, auth, uuid, user)
├── PropertiesTests.cs         # 7 FsCheck PBT properties
├── MetamorphicTests.cs        # 7 metamorphic relations ported from TS
├── BUGS.md                    # BUG-001: unicode control chars crash (500)
└── (SchemaTests.cs, RaceTests.cs — next)
```

## Dependencies

```xml
<PackageReference Include="xunit" Version="2.*" />
<PackageReference Include="FsCheck.Xunit" Version="3.*" />
<PackageReference Include="Newtonsoft.Json" Version="13.*" />
```

## Run

```bash
cd csharp-backend
dotnet test
# or with env vars:
API_BASE_URL=https://buzzhive-test.onrender.com/api dotnet test
```
