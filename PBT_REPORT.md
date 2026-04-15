# PBT Report - Buzzhive Social Network

Property-Based Testing with Jest + fast-check

---

## Test Run 2026-04-15

### Summary

| Metric | Value |
|--------|-------|
| Test Suites | 4 |
| Tests Passed | 13 |
| Tests Failed | 0 |
| Test Suites Passed | 4/4 (100%) |
| Execution Time | ~5s |

### Test Suites

| Suite | Tests | Status |
|-------|-------|--------|
| Email Validation | 3 | ✅ Pass |
| Password Validation | 3 | ✅ Pass |
| Post Properties | 3 | ✅ Pass |
| API Response Properties | 4 | ✅ Pass |

### Coverage Report

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| api-client.ts | 44.82% | 100% | 21.42% | 44.82% |

**Uncovered Functions:**
- `register()` - line 21
- `getUser()` - line 26
- `getNotifications()` - line 38
- `createPost()` - line 46

### Test Properties

| Category | Properties Tested |
|----------|------------------|
| Email Validation | 3 |
| Password Validation | 3 |
| Post Validation | 3 |
| API Responses | 4 |
| **Total** | **13** |

### Environment
- Jest: 30.x
- fast-check: 4.6.0
- Node.js: 25.9.0
- Backend: localhost:8000

---

## Running PBT Tests

```bash
npm run test:pbt           # Run tests
npm run test:pbt -- --coverage  # With coverage
```

## Files

```
pbt/
├── api-client.ts                 # API client functions
├── email-properties.test.ts       # Email validation properties
├── password-properties.test.ts    # Password validation properties
├── post-properties.test.ts       # Post validation properties
└── api-response-properties.test.ts # API response structure properties
```
