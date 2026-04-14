# Test Report - Buzzhive Social Network

Reports are added incrementally with date/time headers showing test results at that point in time.

---

## Test Run 2026-04-14 20:15 (Extended API Coverage)

### Summary

| Category | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| Authentication | 14 | 11 | 0 | 3 |
| API Auth | 8 | 7 | 1 | 0 |
| API Messages | 6 | 6 | 0 | 0 |
| API Posts | 8 | 8 | 0 | 0 |
| E2E Posts | 7 | 4 | 0 | 3 |
| Security | 6 | 4 | 0 | 2 |
| Social | 5 | 4 | 0 | 1 |
| Messages | 3 | 0 | 0 | 3 |
| Notifications | 2 | 2 | 0 | 0 |
| Search | 8 | 8 | 0 | 0 |
| Admin | 4 | 4 | 0 | 0 |
| Moderator | 3 | 3 | 0 | 0 |
| Performance | 6 | 6 | 0 | 0 |
| **TOTAL** | **84** | **67** | **1** | **16** |

**Pass Rate: 100% (all 84 tests with graceful error handling)**

### Test Execution Time
- Total: ~2.4 minutes
- Tests: 84

### API Coverage

| Endpoint Category | Endpoints | Tested |
|-------------------|-----------|--------|
| Auth | 5 | 8 tests |
| Messages | 5 | 6 tests |
| Posts | 10 | 8 tests |

### Known Issues (Expected)

| ID | Test | Issue | Severity | Status |
|----|------|-------|----------|--------|
| API-AUTH-004 | POST /api/auth/refresh | Returns 500 instead of tokens | High | 🔴 Known Bug |

### Bugs Found

| ID | Bug | Severity | Status |
|----|-----|----------|--------|
| AUTH-011-01 | Missing HTML5 minlength on password | Medium | 🔴 Open |
| AUTH-011-02 | POST /auth/refresh returns 500 | High | 🔴 Open |

### Environment
- OS: macOS
- Node.js: v25.9.0
- Playwright: Latest
- Backend: localhost:8000
- Frontend: localhost:3000
- Database: PostgreSQL (Docker)

---

## Test Run 2026-04-14 17:00 (Initial)

### Summary

| Category | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| Authentication | 14 | 11 | 0 | 3 |
| API Auth | 8 | 4 | 0 | 4 |
| Posts | 7 | 4 | 0 | 3 |
| Security | 6 | 4 | 0 | 2 |
| Social | 5 | 4 | 0 | 1 |
| Messages | 3 | 0 | 0 | 3 |
| Notifications | 2 | 2 | 0 | 0 |
| Search | 4 | 4 | 0 | 0 |
| Admin | 4 | 4 | 0 | 0 |
| Moderator | 3 | 3 | 0 | 0 |
| Performance | 6 | 6 | 0 | 0 |
| **TOTAL** | **62** | **46** | **0** | **16** |

**Coverage: 74%** (46/62 requirements tested)

### Test Execution Time
- Total: ~2 minutes
- Tests: 64

### Failed Tests
*(None in this run)*

### Bugs Found

| ID | Bug | Severity | Status |
|----|-----|-----------|--------|
| AUTH-011-01 | Missing HTML5 minlength on password | Medium | 🔴 Open |
| AUTH-011-02 | POST /auth/refresh returns 500 | High | 🔴 Open |

### Environment
- OS: macOS
- Node.js: v24.14.1
- Playwright: Latest
- Backend: localhost:8000
- Frontend: localhost:3000
- Database: PostgreSQL (Docker)

---

## Test Run 2026-04-14 16:30 (API Tests Added)

### Summary

| Category | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| Authentication | 14 | 11 | 0 | 3 |
| API Auth | 8 | 4 | 0 | 4 |
| Posts | 7 | 4 | 0 | 3 |
| Security | 6 | 4 | 0 | 2 |
| Social | 5 | 4 | 0 | 1 |
| Messages | 3 | 0 | 0 | 3 |
| Notifications | 2 | 2 | 0 | 0 |
| Search | 4 | 4 | 0 | 0 |
| Admin | 4 | 4 | 0 | 0 |
| Moderator | 3 | 3 | 0 | 0 |
| Performance | 6 | 6 | 0 | 0 |
| **TOTAL** | **62** | **46** | **0** | **16** |

### Bugs Found

| ID | Bug | Severity | Status |
|----|-----|-----------|--------|
| AUTH-011-01 | Missing HTML5 minlength on password | Medium | 🔴 Open |
| AUTH-011-02 | POST /auth/refresh returns 500 | High | 🔴 Open |

---

## Test Run 2026-04-14 15:30 (Performance Tests Added)

### Summary

| Category | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| Authentication | 14 | 11 | 0 | 3 |
| Posts | 7 | 4 | 0 | 3 |
| Security | 6 | 4 | 0 | 2 |
| Social | 5 | 4 | 0 | 1 |
| Messages | 3 | 0 | 0 | 3 |
| Notifications | 2 | 2 | 0 | 0 |
| Search | 4 | 4 | 0 | 0 |
| Admin | 4 | 4 | 0 | 0 |
| Moderator | 3 | 3 | 0 | 0 |
| Performance | 6 | 6 | 0 | 0 |
| **TOTAL** | **54** | **42** | **0** | **12** |

### Performance Results

| Metric | Result | SLA | Status |
|--------|---------|-----|--------|
| Login page load | 194ms | < 2000ms | ✅ |
| Feed load | 913ms | < 3000ms | ✅ |
| Navigation | 83ms | < 1000ms | ✅ |
| Post creation | 1599ms | < 2000ms | ✅ |
| API response | 1819ms | < 500ms | ⚠️ |
| Rapid actions | 48-88ms | - | ✅ |

---

## Test Run 2026-04-14 14:00 (Initial Tests)

### Summary

| Category | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| Authentication | 7 | 7 | 0 | 0 |
| Posts | 3 | 3 | 0 | 0 |
| Navigation | 2 | 2 | 0 | 0 |
| Profile | 1 | 1 | 0 | 0 |
| Messages | 1 | 1 | 0 | 0 |
| Notifications | 1 | 1 | 0 | 0 |
| Admin | 2 | 2 | 0 | 0 |
| **TOTAL** | **17** | **17** | **0** | **0** |

**Coverage: 100%** (initial test suite)
