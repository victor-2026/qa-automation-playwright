# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-28
**Status:** COMPLETE

## Work Completed

### Session 10 — Mutation Testing (3 stages, 15 tests)

### Stage 1: API Response Mutation (8 tests, all pass)
- `e2e/mutation/api-mutation.spec.ts` — 8 mutation tests via `page.route()`
- MUT-001..008: likes_count zeroed, username null, login 500, empty feed, unverified, missing avatar, 401 redirect, XSS escaped
- Key discovery: `route.fulfill({ response, json })` causes gzip encoding mismatch → use `route.fulfill({ json })` only
- Frontend URL pattern for `page.route()` is `**/api/*` (not `API_BASE/*`)

### Stage 2: DB Data Mutation (4 tests, 2 bugs found)
- `e2e/mutation/db-mutation.spec.ts` — 4 tests via `pg` direct queries
- DBMUT-001 (pass): banned user → login redirect
- DBMUT-002 (pass): deleted post → "not found"
- DBMUT-003 (FAIL): **BUG-005** XSS in post content NOT escaped (Critical)
- DBMUT-004 (FAIL): **BUG-006** negative `likes_count` shown as `-5` (Low)
- Key discoveries: `tid()` truncates UUIDs, `page.request` needs explicit Bearer token, local tests need `http://localhost:8000/api` not Render URL

### Stage 3: Chaos Engineering (3 tests, all pass)
- `e2e/mutation/chaos.spec.ts` — docker compose stop/restart
- CHAOS-001..003: db down, backend down, restart recovers
- Guarded by `DOCKER_CHAOS=1` env var

### Bugs Documented
- `BUGS.md` — +BUG-005 (Critical, XSS), +BUG-006 (Low, negative likes)
- `MUTATION_PLAN.md` — full results section with tables and key learnings

### Source Changes
- `frontend/src/pages/feed/FeedPage.tsx` — added `data-testid="feed-empty-state"` to empty state div
- `frontend/src/pages/post/PostDetailPage.tsx` — added `data-testid="post-not-found"` to not-found div

## Modified Files
- `e2e/mutation/api-mutation.spec.ts` — NEW, 8 tests
- `e2e/mutation/db-mutation.spec.ts` — NEW, 4 tests
- `e2e/mutation/chaos.spec.ts` — NEW, 3 tests
- `BUGS.md` — +BUG-005, BUG-006
- `MUTATION_PLAN.md` — results section
- `frontend/src/pages/feed/FeedPage.tsx` — data-testid for empty state
- `frontend/src/pages/post/PostDetailPage.tsx` — data-testid for not found

## Verification Results
- API mutation: 8/8 pass ✅
- DB mutation: 2/4 pass, 2 bugs found ✅
- Chaos: 3/3 pass (manual, `DOCKER_CHAOS=1`) ✅

## Next Steps
- Fix BUG-005 (XSS) — escape HTML in PostCard content
- Fix BUG-006 (negative likes) — `Math.max(0, likesCount)`
- UI Fuzzing tests (`e2e/mutation/ui-fuzz.spec.ts`)
