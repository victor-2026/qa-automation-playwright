# SOP: Contract Testing

## Purpose
Run schema validation + Pact consumer/provider tests to verify API contracts.

## When to Use
- Before merging API changes
- After adding new endpoints
- CI/CD on every push (contracts.yml)

## Steps

### Schema Validation (17 tests)
```bash
npm run contracts:validate
```

### Consumer Tests (9 tests)
```bash
npm run contracts:consumer
```

### Provider Verification (2 tests)
```bash
npm run contracts:provider
```

### All-in-one
```bash
npm run contracts:all
```

## Quality Checks
- Schema: 17/17 pass
- Consumer: 9/9 pass
- Provider: 2/2 pass
- Total: 28/28

## Failure Points
- Backend not running → schema tests fail with ECONNREFUSED
- OpenAPI spec outdated → schema mismatches
- Pact pacts not generated → provider verification skips
- ESM import issues → use `tsx` runner

## Checklist
- [ ] Backend running on :8000
- [ ] OpenAPI spec exported (`npm run contracts:export`)
- [ ] All 28 tests pass
- [ ] No new breaking changes
