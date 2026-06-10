# SOP: Mutation Testing

## Purpose
Run and analyze mutation tests for Buzzhive to verify test suite strength.

## When to Use
- Before each PR
- After changing API endpoints
- Weekly (nightly CI)

## Steps

1. Start backend:
```bash
docker-compose up --build -d
```

2. Wait for health check:
```bash
curl http://localhost:8000/health
```

3. Run mutation tests:
```bash
npx playwright test e2e/mutation/ --project=chromium
```

4. Analyze results: killed / survived / skipped

5. If survived > 0 — strengthen assertions

## Quality Checks
- All 34 mutation tests pass (34/34)
- No skipped tests without reason
- Assertions use strong matchers (toHaveText, toHaveCount — not toBeVisible)

## Failure Points
- Docker not running → ECONNREFUSED
- Backend not healthy → timeout
- Flaky tests → retries=2 in config

## Checklist
- [ ] Docker running
- [ ] Backend healthy
- [ ] All 34 tests pass
- [ ] No new survived mutations
