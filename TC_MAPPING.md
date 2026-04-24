# Test Case Mapping: Frontend /docs vs e2e/ Code

## Summary

| Source | Format | Count |
|--------|--------|-------|
| Frontend `/docs` | TC-AUTH-001 | 60 |
| e2e/ code | AUTH-API-001 | ~90 |
| **Implemented TC** | TC-FOL-002, etc. | **6** |

**Naming differs:** TC-{MODULE}-{###} vs {MODULE}-API-{###}

**Requires:** Seeded DB (`/api/reset`) + Auth token (`/api/auth/login`)

---

## Analysis

### Frontend Test Cases (from DocsPage.tsx)

| Module | Count |
|--------|-------|
| AUTH | 8 |
| POSTS | 12 |
| COMMENTS | 4 |
| FOLLOWS | 6 |
| MESSAGES | 6 |
| NOTIFICATIONS | 5 |
| SEARCH | 4 |
| ADMIN | 5 |
| EDGE CASES | 10 |
| **TOTAL** | **60** |

### e2e/ Test Code (API modules)

| Module | Test Count |
|--------|------------|
| auth | ~12 |
| users | ~18 |
| posts | ~27 |
| notifications | ~19 |
| conversations | ~9 |
| health | ~5 |
| **TOTAL** | **~90** |

---

## Mapping by Module

### Auth

| Frontend TC | e2e/ Test ID | Status |
|-------------|---------------|--------|
| TC-AUTH-001 | AUTH-API-001 | ✅ Similar |
| TC-AUTH-002 | AUTH-API-001 (wrong password) | ✅ Similar |
| TC-AUTH-003 | - | ❌ Missing |
| TC-AUTH-004 | AUTH-API-003? | ✅ Similar |
| TC-AUTH-005 | AUTH-API-003 (duplicate) | ✅ Similar |
| TC-AUTH-006 | AUTH-API-004 (refresh) | ✅ Similar |
| TC-AUTH-007 | - | ❌ Missing |
| TC-AUTH-008 | - | ❌ Missing |

### Posts

| Frontend TC | e2e/ Test ID | Status |
|-------------|---------------|--------|
| TC-POST-001 | POST-API-002 | ✅ Similar |
| TC-POST-002 | - | ❌ Missing |
| TC-POST-003 | POST-API-007 | ✅ Similar |
| TC-POST-004 | POST-API-007 / BOOKMARKS | ✅ Similar |
| TC-POST-005 | POST-API-006 | ✅ Similar |
| TC-POST-006 | POST-API-006 | ✅ Similar |
| TC-POST-007 | POST-API-002 (2000 chars) | ✅ Similar |
| TC-POST-008 | POST-API-002 (XSS) | ✅ Similar |
| TC-POST-009 | POST-API-003 | ✅ Similar |
| TC-POST-010 | - | ❌ Missing |
| TC-POST-011 | - | ❌ Missing |
| TC-POST-012 | - | ❌ Missing |

### Comments

| Frontend TC | e2e/ Test ID | Status |
|-------------|---------------|--------|
| TC-COM-001 | POST-API-009 | ✅ Similar |
| TC-COM-002 | - | ❌ Missing |
| TC-COM-003 | - | ❌ Missing |
| TC-COM-004 | - | ❌ Missing |

### Follows

| Frontend TC | e2e/ Test ID | Status |
|-------------|---------------|--------|
| TC-FOL-001 | USER-API-004 | ✅ Similar |
| TC-FOL-002 | - | ❌ Missing |
| TC-FOL-003 | - | ❌ Missing |
| TC-FOL-004 | - | ❌ Missing |
| TC-FOL-005 | - | ❌ Missing |
| TC-FOL-006 | - | ❌ Missing |

### Edge Cases (10 total!)

| Frontend TC | e2e/ Test ID | Status |
|-------------|---------------|--------|
| TC-EDGE-001 | POST-API-002 (SQL injection) | ✅ Similar |
| TC-EDGE-002 | POST-API-002 (XSS) | ✅ Similar |
| TC-EDGE-003 | - | ❌ Missing |
| TC-EDGE-004 | POST-API-007 (duplicate like) | ✅ Similar |
| TC-EDGE-005 | - | ❌ Missing |
| TC-EDGE-006 | - | ❌ Missing |
| TC-EDGE-007 | - | ❌ Missing |
| TC-EDGE-008 | - | ❌ Missing |
| TC-EDGE-009 | - | ❌ Missing |
| TC-EDGE-010 | - | ✅ Done (TC-FOL-002, TC-EDGE-010 implemented) |

---

## Implemented Test Cases (2026-04-25)

### ✅ Completed

| TC ID | Module | Description | Status | File |
|------|--------|-------------|--------|------|
| TC-FOL-002 | Follows | Follow private account (dave_quiet) | ✅ Working | e2e/api/users.spec.ts |
| TC-EDGE-010 | Edge | Private account post visibility | ✅ Working | e2e/api/users.spec.ts |
| TC-FOL-004 | Follows | "Follows you" indicator | ✅ Working | e2e/api/users.spec.ts |
| TC-FOL-005 | Follows | Followers/following lists | ✅ Working | e2e/api/users.spec.ts |
| TC-COM-002 | Comments | Nested replies | ✅ Working | e2e/api/posts.spec.ts |
| TC-COM-004 | Comments | Comment likes | ✅ Working | e2e/api/posts.spec.ts |

### Still Missing (Lower Priority)

| TC ID | Module | Description |
|------|--------|-------------|
| TC-AUTH-003 | Auth | Banned user login |
| TC-AUTH-007 | Auth | Quick login buttons |
| TC-AUTH-008 | Auth | Username validation |
| TC-POST-010 | Posts | Repost feature |
| TC-POST-011 | Posts | Quote post |
| TC-FOL-003 | Follows | Accept follow request |
| TC-FOL-004 | Follows | Reject follow request |

---

## Setup Required

### 1. Reset DB (seed data)

```bash
# Call this once (or whenever DB is empty)
curl -X POST http://localhost:8000/api/reset
```

### 2. Seeded Users (username → email)

| Username | Email | Password | Role |
|----------|-------|----------|------|
| alice_dev | alice@buzzhive.com | alice123 | user |
| bob_photo | bob@buzzhive.com | bob123 | user |
| carol_writes | carol@buzzhive.com | carol123 | user |
| dave_quiet | dave@buzzhive.com | dave123 | private |
| eve_new | eve@buzzhive.com | eve123 | user |
| frank_banned | frank@buzzhive.com | frank123 | banned |
| admin | admin@buzzhive.com | admin123 | admin |
| moderator | mod@buzzhive.com | mod123 | moderator |

### 3. Get Token (CLI)

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@buzzhive.com","password":"alice123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Use in requests
curl http://localhost:8000/api/users/alice_dev \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- All protected endpoints requires token + seeded DB
- Endpoints return `{items: [...]}` wrapper, not plain array
- Private accounts: `dave_quiet` (is_private=true) allows test follow requests
- Tests handle graceful fallbacks for unimplemented features

*Generated: 2026-04-24*
*Updated: 2026-04-25*
*Source: frontend/src/pages/docs/DocsPage.tsx vs e2e/api/*.spec.ts*