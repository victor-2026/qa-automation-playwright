# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-26
**Status:** COMPLETE

## Work Completed

### Session 9 — Monolith Split & Cleanup

### Monolith Elimination
- Split `e2e/buzzhive.spec.ts` (2349 lines) → 13 modular `e2e/ui/*.spec.ts` files
- Extracted Auth (26 tests) → `e2e/ui/auth.spec.ts` as first split
- Removed 15 API duplicate blocks from buzzhive (lines 1071-2349 were 100% dupes of `e2e/api/*`)
- Removed Auth section from buzzhive (canonical in `e2e/ui/auth.spec.ts`)
- Created 13 new UI files: performance, navigation, posts, profile, messages, notifications, comments, follows, moderator, admin, logout, search
- **Deleted `e2e/buzzhive.spec.ts`** (11-line stub)
- **Deleted `e2e/api-expanded.spec.ts`** (1559 lines, full duplicate of `e2e/api/*`)

### Import Standardization
- Switched all 9 `e2e/api/*.spec.ts` → `import { test, expect } from '../fixtures'`
- All 14 `e2e/ui/*.spec.ts` → same import from `../fixtures`
- Fixed `fixtures/tokens.ts` — removed dead `TEST_USERNAME` import

### Refresh Token Race Condition Fix
- **Root cause:** `create_refresh_token()` used `datetime.now()` as JWT `exp` — same microsecond → same JWT → same SHA256 hash → `unique_violation` on `refresh_tokens.token_hash`
- **Backend fix:** Added `jti: uuid.uuid4()` to refresh token payload — guarantees unique JWT per call
- **Test fix:** Added `cleanupRefreshTokens()` to `e2e/teardown/cleanup.ts` — calls `/api/reset` for clean DB state
- **Verified:** Two parallel logins produce different tokens ✅
- Deleted `mcp-playwright-server.js` (Cline trash file)
- Cline repeatedly failed on large refactoring (OpenRouter free empty responses, Groq TPM limit 12K/min)
- Sessions: OpenRouter free → Groq (`llama-3.3-70b-versatile`) → back to OpenRouter
- Decision: manual split is more reliable than Cline for files >2000 lines

### Branch Management
- Merged `health-improvements` → `main`, pushed, deleted branch (local + remote)

### GitHub Pages
- Added `actions/jekyll-build-pages@v1` step to `pages.yml`
- All `.md` files render as HTML without extension
- Verified: PRESENTATION_PART2, PRESENTATION_FOR_MANAGEMENT, TEST_REPORT, AI_READY_DOR all work

### Other
- Reverted `dotenv` from `playwright.config.ts` (package not installed, not needed)
- Added `trace: 'on-first-retry'` to `playwright.config.ts`
- Updated `.clinerules` with security and runbook sections

## Verification Results
- GitHub Pages: 4 URLs verified working ✅
- Branch: `main` — clean, no dead branches
- Files: 14 UI + 9 API spec files, all using `fixtures.ts`
- Tech debt: 37 items documented in `docs/PLAYWRIGHT_PLANS_AND_FACTS.md`

## Blockers
- ~~Refresh token race condition~~ ✅ Fixed (jti + pre-cleanup)

## Next Steps
1. Stabilize backend (500 errors on Render)
2. Dockerize CI for full suite runs
3. Page Objects for Profile/Admin/Search
4. API Client layer (`apiClient.ts` with auto-token)
