# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-29
**Session:** 16 — Tech debt fixes + UI Fuzz randomization + Go race tests
**Status:** COMPLETE

## Summary
- **TD-1:** DBMUT-004 fixed (relative URLs for page.evaluate, afterEach DB cleanup)
- **TD-9:** AUTH-011-01 fixed — `minLength={6}` on LoginPage.tsx password input
- **TD-2:** BUGS.md cleaned — removed 6 duplicate entries, unified status
- **P-1:** UI Fuzz randomized — 10 → 33 tests (SQLi×5, XSS×5, email lengths×4, content lengths×4, search lengths×3, password lengths×5)
- **P-2:** Go race tests — 2 tests (parallel login×10, follow/unfollow storm×5+5) with `-race` flag
- **Render fix:** Removed `dockerfilePath: ./frontend/Dockerfile` from render.yaml — root Dockerfile used instead

## Files Modified
- `frontend/src/pages/auth/LoginPage.tsx` — added `minLength={6}`
- `BUGS.md` — removed duplicates, unified Fixed/Open sections
- `e2e/mutation/ui-fuzz.spec.ts` — randomized with test.each (33 tests)
- `e2e/mutation/db-mutation.spec.ts` — relative URLs, afterEach cleanup
- `render.yaml` — removed dockerfilePath for frontend service

## Files Added
- `go-backend/api/race_test.go` — 2 race condition tests

## Verification
- Go API + race: 26/26 pass ✅
- TS smoke + mutation + fuzz: 55 pass ✅ (2 SQLi patterns fixed)
- PBT: 79/80 pass ✅ (1 pre-existing fast-check failure)
- Render deploy: `cc16cf1` pushed

## Remaining Tech Debt
- TD-6: C# tests in CI (add `dotnet test` to workflow)
- TD-10: Page Objects for Search/Messages/Admin
- P-3: API Mutation parameterization
- DBMUT-001/002/003: Frontend behavior issues (redirect timing, post not found text, DB mutation not reflected)
