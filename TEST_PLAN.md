# Test Plan — Buzzhive QA Sandbox

**Version:** 1.0  
**Date:** 2026-04-17  
**Author:** QA Automation Sandbox  
**Status:** Draft

---

## 1. Introduction

### 1.1 Document Purpose

Define the strategy, approaches, resources, and testing plan for Buzzhive Social Network.

### 1.2 Scope

| Included | Excluded |
| -------- | -------- |
| ✅ E2E UI tests (Playwright) | ❌ Backend code (no access) |
| ✅ API tests | ❌ Native mobile (iOS/Android) |
| ✅ DB tests | ❌ Backend performance tests |
| ✅ Property-Based tests | ❌ Security penetration |
| ✅ BDD/Gherkin scenarios | |
| ✅ Load (browser-based) | |

### 1.3 Project Constraints

| Constraint | Impact |
|------------|--------|
| $0 budget | Only free tools |
| No backend access | Cannot run full suite in CI |
| Backend Docker unavailable | Smoke tests skipped |
| 16GB RAM MacBook Pro | Limited parallelization |

---

## 2. Test Strategy

### 2.1 Test Types

| Type | Tool | Coverage | Priority |
|------|------|----------|----------|
| **E2E UI** | Playwright | 122 tests | Critical |
| **API** | Playwright | 280 tests | Critical |
| **DB** | Jest + pg | 18 tests | High |
| **PBT** | Jest + fast-check | 46 tests | High |
| **BDD** | Cucumber/Gherkin | 2 scenarios | Medium |
| **Visual** | Playwright | Baseline | Low |
| **Load** | Playwright (multi-context) | Manual | Low |

### 2.2 Testing Approaches

#### Discovery-first (Recommended)
```
1. Explore the system (API, UI, DB)
2. Identify requirements
3. Write tests
4. Document
```

#### Spec-driven (Alternative)
```
1. Get specification
2. Write tests against it
3. Run and verify
```

### 2.3 Test Pyramid

```
        /\
       /E2E\        ← 122 tests (few, expensive)
      /------\
     /  API   \     ← 280 tests (moderate)
    /----------\
   /    PBT     \   ← 46 tests (many, cheap)
  /--------------\
 /   DB Tests    \  ← 18 tests
/------------------\
```

### 2.4 Test Levels

| Level | What We Test | Tool |
|-------|-------------|------|
| **Component** | React components | Jest |
| **Integration** | API + DB | Playwright |
| **System** | Full UI flow | Playwright |
| **Acceptance** | User stories | Gherkin |

---

## 3. Test Implementation

### 3.1 Goals

| # | Goal | Success Metric |
|---|------|---------------|
| 1 | Cover all API endpoints | ≥94% endpoints |
| 2 | Ensure stability | 0 flaky tests |
| 3 | Data-driven tests | 3 formats (JSON/YAML/Python) |
| 4 | Load testing | 10+ browsers simultaneously |

### 3.2 Expected Results

| Result | Target Value |
|--------|-------------|
| Total tests | 489+ |
| API Coverage | 94% |
| PBT Coverage | 100% |
| Execution time | < 10 min |
| Pass rate | ≥ 80% |

### 3.3 Test Data

```python
# Test accounts
ACCOUNTS = {
    "alice": {"email": "alice@buzzhive.com", "password": "alice123", "role": "user"},
    "bob":   {"email": "bob@buzzhive.com", "password": "bob123", "role": "user"},
    "admin": {"email": "admin@buzzhive.com", "password": "admin123", "role": "admin"},
    "mod":   {"email": "mod@buzzhive.com", "password": "mod123", "role": "moderator"},
    "frank": {"email": "frank@buzzhive.com", "password": "frank123", "role": "banned"},
}
```

---

## 4. Resources

### 4.1 Hardware

| Resource | Specification | Notes |
|----------|--------------|-------|
| MacBook Pro | 16GB RAM, Apple Silicon | Main machine |
| CPU | 8 cores | Limits parallelization |
| Disk | SSD 512GB | Sufficient |

### 4.2 Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22 | Runtime |
| Playwright | 1.59 | E2E + API |
| Jest | 30.3 | Unit/PBT |
| pytest | 8.x | Python tests |
| Docker | Latest | Container |

### 4.3 CI/CD

| Platform | Purpose |
|----------|---------|
| GitHub Actions | Quality Gates, Nightly |
| GitHub Pages | Documentation |

---

## 5. Test Environment

### 5.1 Components

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Backend | http://localhost:8000 | ❌ Unavailable |
| API | http://localhost:8000/api | ❌ Unavailable |
| DB (PostgreSQL) | localhost:5432 | ❌ Unavailable |
| PGWeb | http://localhost:8081 | ❌ Unavailable |

### 5.2 Configuration

```yaml
# playwright.config.ts
projects:
  - name: chromium
    timeout: 30000
  - name: "Mobile Safari"
    device: iPhone 15 Pro
  - name: "Mobile Chrome"
    device: Pixel 5
```

---

## 6. Schedule

| Phase | Duration | Status |
|-------|----------|--------|
| Setup (Docker, Node, Playwright) | 1 hour | ✅ Done |
| E2E Tests (120+) | 4 hours | ✅ Done |
| API Tests (280+) | 2 hours | ✅ Done |
| DB Tests (18) | 1 hour | ✅ Done |
| PBT Tests (46) | 2 hours | ✅ Done |
| BDD Tests (2) | 1 hour | ✅ Done |
| **Total** | **~11 hours** | |

---

## 7. Metrics

### 7.1 Test Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Total tests | 500+ | 489 |
| Code coverage | 80% | 70% |
| API coverage | 95% | 94% |
| PBT coverage | 100% | 100% |
| Flaky tests | 0% | <5% |

### 7.2 Business Metrics

| Metric | Description |
|--------|------------|
| Pass rate | % of successful tests |
| Execution time | Run duration |
| Bug density | Bugs per 1000 lines |
| Requirement coverage | Requirements-to-tests mapping |

---

## 8. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend unavailable | High | High | Skip smoke tests |
| Flaky tests | Medium | Medium | retries: 2 |
| Dirty DB data | Medium | Low | Cleanup queue |
| No CI resources | Low | Medium | Local execution |

---

## 9. Defect Management

| ID | Defect | Severity | Status |
|----|--------|----------|--------|
| AUTH-011-01 | No minlength on password | Medium | Open |
| AUTH-011-02 | POST /auth/refresh = 500 | High | Open |

---

## 10. Review & Approval

| Role | Responsible | Status |
|------|-------------|--------|
| QA Lead | — | Draft |
| Dev Lead | — | Pending |
| Product Owner | — | Pending |

---

## Appendices

### A. Test Notation Formats

| Format | File | Status |
|--------|------|--------|
| Gherkin | `features/auth.feature` | ✅ |
| Python list | `python/tests/test_auth.py` | ✅ |
| JSON | `python/tests/test_data/auth_cases.json` | ✅ |
| YAML | `python/tests/test_data/auth.yaml` | ✅ |
| Groovy | `jenkins/` | Examples |

### B. Commands

```bash
# Main
npm test                    # Full suite
npm run test:smoke         # Smoke
npm run test:pbt          # PBT
npm run test:db            # DB
npm run test:gherkin       # Gherkin
npm run test:python        # Python
npm run test:k6            # K6 load (future)

# Mobile
npx playwright test --project="Mobile Safari"
```

---

*Document created: 2026-04-17*  
*Based on ISTQB Standard Test Plan template*
