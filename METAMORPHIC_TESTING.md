# Metamorphic & Mutation Testing for QA Automation

**Project:** qa-automation-sandbox (Buzzhive)  
**Date:** 2026-04-29  
**Status:** Implementation Guide

---

## 1. Metamorphic Testing for API

### Concept
Test where correct output is unknown → verify **relationships** between inputs/outputs.

### Why for Buzzhive?
- API behavior changes across environments (local vs Render)
- Some endpoints return 403/404 unexpectedly
- Need robust tests that don't rely on exact status codes

---

## 2. Metamorphic Relations for Buzzhive API

### Relation 1: Synonym Substitution
**Property:** Same email with different casing should work identically.

```typescript
// e2e/api/metamorphic.spec.ts
test('MET-001: Login case insensitivity', async ({ request }) => {
  const variants = [
    'alice@buzzhive.com',
    'Alice@buzzhive.com',
    'ALICE@BUZZHIVE.COM'
  ];
  
  for (const email of variants) {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password: TEST_ACCOUNTS.user.password },
      timeout: 5000,
    });
    // All should succeed (or all fail similarly)
    expect([200, 401, 403]).toContain(res.status());
  }
});
```

**Metamorphic relation:** If system is case-insensitive, all return 200. If case-sensitive, all return 401.

---

### Relation 2: Parameter Permutation
**Property:** Query parameter order shouldn't matter.

```typescript
test('MET-002: Query param order independence', async ({ request }) => {
  const res1 = await request.get(`${API_BASE}/posts?page=1&per_page=10`);
  const res2 = await request.get(`${API_BASE}/posts?per_page=10&page=1`);
  
  // Both should return same structure
  expect(res1.status()).toBe(res2.status());
  
  const body1 = await res1.json();
  const body2 = await res2.json();
  expect(body1.items?.length).toBe(body2.items?.length);
});
```

---

### Relation 3: Follow/Unfollow Symmetry
**Property:** Follow + Unfollow should return to original state.

```typescript
test('MET-003: Follow-unfollow symmetry', async ({ request }) => {
  // Check initial following count
  const initialRes = await request.get(`${API_BASE}/users/bob/following`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  const initialCount = (await initialRes.json()).length || 0;
  
  // Follow bob
  await request.post(`${API_BASE}/users/bob/follow`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  
  // Unfollow bob
  await request.delete(`${API_BASE}/users/bob/follow`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  
  // Check final count = initial count
  const finalRes = await request.get(`${API_BASE}/users/bob/following`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  const finalCount = (await finalRes.json()).length || 0;
  
  expect(finalCount).toBe(initialCount);
});
```

---

### Relation 4: Negation
**Property:** Existing user vs non-existent user should give different results.

```typescript
test('MET-004: Existence negation', async ({ request }) => {
  const res1 = await request.get(`${API_BASE}/users/alice`);
  const res2 = await request.get(`${API_BASE}/users/nonexistent_user_12345`);
  
  // Different results expected
  expect(res1.status()).not.toBe(res2.status());
});
```

---

### Relation 5: Pagination Consistency
**Property:** Page 1 + Page 2 should return disjoint sets.

```typescript
test('MET-005: Pagination disjoint sets', async ({ request }) => {
  const res1 = await request.get(`${API_BASE}/posts?page=1&per_page=5`);
  const res2 = await request.get(`${API_BASE}/posts?page=2&per_page=5`);
  
  const body1 = await res1.json();
  const body2 = await res2.json();
  
  const ids1 = (body1.items || body1).map((p: any) => p.id);
  const ids2 = (body2.items || body2).map((p: any) => p.id);
  
  // No overlap
  const overlap = ids1.filter(id => ids2.includes(id));
  expect(overlap.length).toBe(0);
});
```

---

## 3. Implementing Metamorphic Tests

### Step 1: Create helper for metamorphic relations

```typescript
// e2e/api/metamorphic-helpers.ts
import { APIResponse } from '@playwright/test';

export async function checkSameStatus(res1: APIResponse, res2: APIResponse) {
  expect(res1.status()).toBe(res2.status());
}

export async function checkDifferentStatus(res1: APIResponse, res2: APIResponse) {
  expect(res1.status()).not.toBe(res2.status());
}

export function expectDisjointSets(arr1: any[], arr2: any[], key: string = 'id') {
  const keys1 = arr1.map(item => item[key]);
  const keys2 = arr2.map(item => item[key]);
  const overlap = keys1.filter(k => keys2.includes(k));
  expect(overlap.length).toBe(0);
}
```

---

### Step 2: Add metamorphic tests to CI

```yaml
# .github/workflows/playwright.yml
- name: Run Metamorphic Tests
  run: npx playwright test e2e/api/metamorphic.spec.ts --retries=1
```

---

## 4. Mutation Testing for Test Suite

### Concept
Inject artificial faults → verify tests detect them.

### Why?
- Measure test suite quality
- Find weak tests that don't catch bugs
- Improve assertions

---

## 5. Mutation Operators for API Tests

| Operator | Original | Mutated | Expected |
|----------|----------|---------|----------|
| **Status code change** | `expect(res.status()).toBe(200)` | `toBe(201)` | Test fails |
| **Assertion removal** | `expect(body).toHaveProperty('id')` | Remove line | Test might pass (bad) |
| **Credential mutation** | `password: 'alice123'` | `password: 'wrong'` | Test should fail (401) |
| **Endpoint mutation** | `/auth/login` | `/auth/login2` | Test fails (404) |
| **HTTP method change** | `request.get(...)` | `request.post(...)` | Test fails |

---

## 6. Tool: Stryker Mutator

### Installation
```bash
cd /Users/victor/Projects/qa-automation-sandbox
npm install --save-dev @stryker-mutator/core @stryker-mutator/typescript @stryker-mutator/playwright-runner
```

### Configuration
```json
// stryker.conf.json
{
  "_comment": "Stryker config for qa-automation-sandbox",
  "mutator": "typescript",
  "packageManager": "npm",
  "reporters": ["html", "progress"],
  "testRunner": "playwright",
  "testRunnerOptions": {
    "configFile": "playwright.config.ts"
  },
  "mutate": [
    "e2e/api/*.spec.ts",
    "!e2e/api/smoke-api.spec.ts"
  ],
  "transpilers": [
    "typescript"
  ]
}
```

---

## 7. Running Mutation Testing

```bash
# Run mutation testing
npx stryker run

# Output: mutation score
# - Survived mutants = weak tests
# - Killed mutants = good tests
```

### Interpreting Results

| Score | Meaning |
|-------|---------|
| 0-40% | Weak test suite, many bugs not caught |
| 40-70% | Moderate, needs improvement |
| 70-90% | Good, catches most bugs |
| 90-100% | Excellent |

---

## 8. Integration Plan

### Phase 1: Metamorphic Tests (Week 1)
- [ ] Create `e2e/api/metamorphic.spec.ts` with 5+ relations
- [ ] Add metamorphic helpers
- [ ] Run locally + add to CI

### Phase 2: Mutation Testing Setup (Week 2)
- [ ] Install Stryker Mutator
- [ ] Configure for Playwright
- [ ] Run initial mutation test → get baseline score

### Phase 3: Improve Test Suite (Week 3-4)
- [ ] Analyze survived mutants
- [ ] Strengthen weak assertions
- [ ] Re-run mutation tests → track improvement

---

## 9. Expected Benefits

| Practice | Benefit |
|----------|---------|
| **Metamorphic Testing** | Finds logic bugs without oracles |
| | Works across environments (local/Render) |
| | Increases test coverage (state transitions) |
| **Mutation Testing** | Quantifies test suite quality |
| | Finds weak/absent assertions |
| | Guides test improvement efforts |

---

## 10. Next Actions

1. **Create `e2e/api/metamorphic.spec.ts`** with 5 metamorphic relations
2. **Install Stryker** and run baseline mutation test
3. **Add metamorphic tests to CI** (separate from smoke tests)
4. **Document results** in `TEST_REPORT.md`

---

**Files to Create:**
- `e2e/api/metamorphic.spec.ts`
- `e2e/api/metamorphic-helpers.ts`
- `stryker.conf.json`

**References:**
- [[wiki/qa-ai-transition-guide]] (metamorphic testing section)
- [[TEST_CASES.md]] (for test case ideas)
