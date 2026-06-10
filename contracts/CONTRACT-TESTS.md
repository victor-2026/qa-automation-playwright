# Contract Testing — Buzzhive

## Phase 1: OpenAPI Schema Validation (17 tests)

`schema-validation.spec.ts` — validates JSON Schema of API responses.

- Auth: health, login 200/401, register, me 200/401
- Posts: list, feed, get by ID
- Users: list, get by username
- Admin: stats, users
- Notifications: list, unread count
- Bookmarks: list
- Conversations: list

Also checks: spec defines all expected endpoints.

Run: `npx playwright test --project=contracts`

## Phase 2: Pact Consumer (9 tests)

### Auth (4 tests)

| Test | What it validates |
|------|-------------------|
| login 200 | email/password → access_token + refresh_token |
| login 401 | wrong password → detail + error_code |
| me 200 | token → user profile (id, email, username, role) |
| me 401 | invalid token → 401 + UNAUTHORIZED |

### Posts (5 tests)

| Test | What it validates |
|------|-------------------|
| list | token → items[] + pagination (total, page, pages) |
| create | content → 201 + author + hashtags |
| get by id | id → single post with author object |
| delete | own post → 204 |
| hashtag filter | nonexistent → empty items[] |

## Phase 2: Pact Provider (2 runs)

Verifies that the real Render backend fulfills consumer contracts.

- `auth-verification.spec.ts` — auth contract verification
- `posts-verification.spec.ts` — posts contract verification

Run: `npx tsx contracts/provider/auth-verification.spec.ts`

## What contract testing catches

- Field additions/removals in responses
- Type changes (string → integer)
- Missing required fields
- Schema drift between code and spec

## Structure

```
contracts/
├── consumers/          # Consumer-driven pact tests
│   ├── auth.pact.spec.ts
│   └── posts.pact.spec.ts
├── provider/           # Provider verification against pacts
│   ├── auth-verification.spec.ts
│   └── posts-verification.spec.ts
├── pacts/              # Generated pact files
│   └── qa-sandbox-frontend-qa-sandbox-api.json
├── schema-validation.spec.ts  # OpenAPI schema tests
├── validate-schema.ts         # Schema validation helper
├── export-spec.ts             # OpenAPI spec export tool
└── CONTRACT-TESTS.md          # This file
```
