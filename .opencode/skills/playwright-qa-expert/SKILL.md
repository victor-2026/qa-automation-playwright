---
name: playwright-qa-expert
description: Expert in Playwright + TypeScript for qa-automation-sandbox (Buzzhive project). Knows credentials, tokens, API/UI patterns, metamorphic testing.
compatibility: opencode
---

# Playwright QA Expert for Buzzhive Project

**Project:** qa-automation-sandbox (Buzzhive E2E + API tests)  
**Stack:** TypeScript, Playwright, Jest, Cucumber (Gherkin)  
**API Base:** `http://localhost:8000/api` (local) or `https://buzzhive-test.onrender.com/api` (Render)  

---

## Project Structure (What I know)

```
qa-automation-sandbox/
├── .opencode/skills/playwright-qa-expert/  # This skill
├── e2e/
│   ├── api/              # API tests (metamorphic, smoke, auth, posts...)
│   ├── setup/credentials.ts   # TEST_ACCOUNTS, API_BASE
│   ├── fixtures/tokens.ts     # getAliceToken(), getAdminToken()...
│   ├── helpers/              # Shared utilities
│   └── pages/                # Page Objects (if exists)
├── backend/                   # FastAPI backend
└── playwright.config.ts       # Playwright config
```

---

## Guidelines (MUST Follow)

### 1. Credentials & Tokens
**Always import from setup:**
```typescript
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getAliceToken, getAdminToken } from '../fixtures/tokens';
```

**Test Accounts (from TEST_ACCOUNTS):**
| Role | Email | Password |
|------|-------|----------|
| user | alice@buzzhive.com | alice123 |
| user | bob@buzzhive.com | bob123 |
| admin | admin@buzzhive.com | admin123 |
| moderator | mod@buzzhive.com | mod123 |
| banned | frank@buzzhive.com | frank123 |

**Get tokens in `test.beforeAll`:**
```typescript
let aliceToken: string;
test.beforeAll(async ({ request }) => {
  aliceToken = await getAliceToken(request);
});
```

---

### 2. API Testing Pattern
**Base URL:** Always use `API_BASE` (auto switches local/Render)  
**Timeout:** Always add `timeout: 5000` to requests  

```typescript
test('API-001: Example test', async ({ request }) => {
  const res = await request.get(`${API_BASE}/posts`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
    timeout: 5000,
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('items');
});
```

---

### 3. Metamorphic Testing (Project Specialty)
**Key Relations (see `e2e/api/metamorphic.spec.ts`):**
1. **Synonym Substitution** — case insensitivity (MET-001)
2. **Parameter Permutation** — query order independence (MET-002)
3. **Symmetry** — follow/unfollow (MET-003)
4. **Negation** — existence check (MET-004)
5. **Disjoint Sets** — pagination (MET-005)
6. **Consistency** — self-follow, auth tokens (MET-006, MET-007)

**Helper functions (from `metamorphic-helpers.ts`):**
- `expectSameStatus(res1, res2)`
- `expectDifferentStatus(res1, res2)`
- `expectDisjointSets(arr1, arr2, key)`
- `checkFollowUnfollowSymmetry(request, username, token, apiBase)`

---

### 4. Selectors (Use data-testid)
**Priority:** Always use `data-testid` attributes  
**Format:** `page.getByTestId('button-login')`  
**Avoid:** XPath, long CSS selectors  

```typescript
// Good
await page.getByTestId('input-email').fill(email);
await page.getByTestId('button-submit').click();

// Bad
await page.locator('div > input[type="email"]').fill(email);
```

---

### 5. Error Handling & Retries
**Token retry logic (from `fixtures/tokens.ts`):**
```typescript
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    const res = await request.post(`${API_BASE}/auth/login`, { data: { email, password } });
    if (res.status() === 200) return (await res.json()).access_token;
  } catch {
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
  }
}
```

**Wrap critical operations in try-catch:**
```typescript
try {
  const res = await request.post(...);
  expect(res.status()).toBe(200);
} catch (err) {
  console.error('Test error:', err);
  throw err;
}
```

---

### 6. Test Naming Convention
**Format:** `MET-XXX: Description` (for metamorphic)  
**Format:** `API-XXX: Description` (for API tests)  
**Format:** `UI-XXX: Description` (for UI tests)  

---

### 7. Known Issues (Tech Debt)
- **POST /posts** doesn't return `title` in response (schema mismatch)
- **500 errors** — always check `res.ok()` before `.json()`
- **Stress tests** — 10s timeout too short for Render free tier
- **Full suite** — takes 2h+ locally, skipped on CI (use Docker)

---

## Quick Reference

### Common Imports
```typescript
import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getAliceToken, getBobToken, getAdminToken } from '../fixtures/tokens';
```

### API Endpoints (49/52 covered)
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/auth/login` | ✅ |
| GET | `/posts` | ✅ |
| POST | `/posts` | ✅ (schema issue) |
| GET | `/users/:username` | ✅ |
| POST | `/users/:username/follow` | ✅ |
| DELETE | `/users/:username/follow` | ✅ |

### Run Tests
```bash
# Local with Docker
docker-compose up --build -d
npm test

# Render smoke (API only)
npm run test:render

# Specific test file
npx playwright test e2e/api/metamorphic.spec.ts
```

---

## Example: Complete API Test
```typescript
import { test, expect } from '@playwright/test';
import { API_BASE, TEST_ACCOUNTS } from '../setup/credentials';
import { getAliceToken } from '../fixtures/tokens';

test.describe('API-001: User Profile', () => {
  let aliceToken: string;

  test.beforeAll(async ({ request }) => {
    aliceToken = await getAliceToken(request);
  });

  test('should return user profile', async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/alice`, {
      timeout: 5000,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('username', 'alice');
    expect(body).toHaveProperty('email');
  });
});
```

---

**Tags:** #playwright #typescript #qa #buzzhive #api-testing #metamorphic-testing
