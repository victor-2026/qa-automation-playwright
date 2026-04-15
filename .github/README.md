# CI/CD Integration

## Overview

GitHub Actions workflows for automated testing.

## Workflows

### 1. `qa.yml` — Main Test Suite

Runs on every push/PR:
- E2E Tests (Playwright)
- API Tests
- PBT Tests (Jest)
- DB Tests (PostgreSQL)
- Lint & Type Check

### 2. `nightly-invariants.yml` — Nightly Invariants

Runs every night at 3 AM UTC:
- Database invariants
- Property-based tests
- Creates GitHub issue on failure

## Setup

### Prerequisites

1. Docker images must be pushed to GHCR:
   - `ghcr.io/manikosto/buzzhive-backend:latest`
   - `ghcr.io/manikosto/buzzhive-frontend:latest`

2. Or update workflow to use docker-compose:
   ```yaml
   - name: Start services
     run: docker-compose up -d
   ```

### GitHub Secrets

No secrets required for this project (no external APIs).

## Manual Triggers

### Run All Tests
```bash
# Via GitHub CLI
gh workflow run qa.yml
```

### Run Nightly Invariants
```bash
gh workflow run nightly-invariants.yml
```

### View Results
```bash
gh run list --workflow=qa.yml
```

## Badges

Add to README.md:

```markdown
[![QA Test Suite](https://github.com/manikosto/qa-automation-sandbox/actions/workflows/qa.yml/badge.svg)](https://github.com/manikosto/qa-automation-sandbox/actions/workflows/qa.yml)
```

## Schedule

| Job | Schedule | Duration |
|-----|----------|----------|
| E2E Tests | On push/PR | ~5 min |
| API Tests | On push/PR | ~3 min |
| PBT Tests | On push/PR | ~2 min |
| DB Tests | On push/PR | ~2 min |
| Invariants | Nightly (3 AM) | ~5 min |

## Artifacts

Test results are stored for 7 days:
- Coverage reports
- Test logs
- Invariant violation details
