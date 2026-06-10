# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-06-10
**Session:** 37 — Uptime Monitor fix + 4 workflow audit
**Status:** IN PROGRESS

## Work Completed

### Session 37 (2026-06-10) — Uptime Monitor + Workflow Audit ✅

**Root cause:** `uptime.yml` had legacy `|| 'https://buzzhive-test.onrender.com'` fallback. `vars.BACKEND_URL` was never set in GitHub repo Variables. New services (`qa-automation-playwright-1.onrender.com` backend + `qa-automation-playwright-front.onrender.com` frontend) deployed without updating GitHub vars.

**Trigger:** Uptime Monitor #135 failed 2026-06-10 06:21 (exit 28 = curl timeout, Render cold start >10s)

**Fixes (4 workflows):**
- `uptime.yml` — removed legacy fallback, added URL validation step
- `nightly.yml` — added URL validation step, kept `vars.BACKEND_URL`/`FRONTEND_URL` usage
- `contracts.yml` — added URL validation step in both jobs, moved BACKEND_URL to env
- `mutation.yml` — added URL validation step, moved env vars to per-step env blocks

**Manual action required (user):** Set GitHub repo Variables:
- `BACKEND_URL` = `https://qa-automation-playwright-1.onrender.com`
- `FRONTEND_URL` = `https://qa-automation-playwright-front.onrender.com`

**Quick link:** https://github.com/victor-2026/qa-automation-playwright/settings/variables/actions

**Step-by-step:**
1. Open the link above
2. Click **"New repository variable"** (green button, top right)
3. Add `BACKEND_URL` → `https://qa-automation-playwright-1.onrender.com` → Save
4. Click **"New repository variable"** again
5. Add `FRONTEND_URL` → `https://qa-automation-playwright-front.onrender.com` → Save
6. Verify by re-running Uptime Monitor: https://github.com/victor-2026/qa-automation-playwright/actions/workflows/uptime.yml → "Run workflow" → main

**Note:** As of 2026-06-10 11:15 UTC, the existing `BACKEND_URL` is still `https://buzzhive-test.onrender.com` (legacy) — confirmed by CI run #27272284630 log line `env: API_BASE_URL: https://buzzhive-test.onrender.com` (after `{{ vars.BACKEND_URL }}` substitution).

**Investigation 2026-06-10 13:30 UTC — both backends compared:**

| Endpoint | `buzzhive-test.onrender.com` (legacy) | `qa-automation-playwright-1.onrender.com` (new) |
|----------|---------------------------------------|--------------------------------------------------|
| `/api/health` | 200 (0.5s) | 200 (0.6s) |
| `/api/auth/login` | 200 (2.5s) | 200 (2.3s) |
| `/api/posts?hashtag=...` | 200 (0.5s) | 200 (0.6s) |
| `/openapi.json` | **200 JSON** ✅ | **200 HTML** ❌ |
| `/api/posts` data | same | same (shared Neon DB) |

**Verdict:** Both backends proxy to the same FastAPI service (via Neon DB), but the **new service does not expose `/openapi.json`** (likely a different deployment — possibly a frontend reverse-proxy). The legacy `buzzhive-test` is the actual FastAPI service that exposes OpenAPI docs.

**Decision 2026-06-10 13:30:** Keep `BACKEND_URL=buzzhive-test.onrender.com` (legacy). Updating to the new URL breaks the `contracts.yml` OpenAPI export step. If/when the new service exposes `/openapi.json`, the var can be flipped.

**Frontend mismatch:** Frontend's `API_BACKEND_URL` (in render.yaml) points to `https://qa-automation-playwright-1.onrender.com` (set in commit `28c2b1d`). The new URL serves the same `/api/*` as legacy, so frontend works. But CI tests need legacy for the spec export.

**Modified files:**
- `.github/workflows/uptime.yml`
- `.github/workflows/nightly.yml`
- `.github/workflows/contracts.yml`
- `.github/workflows/mutation.yml`

**Verification (after user sets vars):**
- `gh workflow run uptime.yml` — manual trigger
- Check action log for success

## Active API Endpoints (Session 37)
- `GET /api/health` (backend) — returns `{"status":"healthy","database":"connected"}`
- `GET /` (frontend) — returns HTML (200)
- `POST /api/auth/login` — JWT issuance
- `POST /api/reset` — admin DB reset (used in nightly seed step)

## Render Topology (verified 2026-06-10)
- Backend: `https://qa-automation-playwright-1.onrender.com` (cold start ~14s)
- Frontend: `https://qa-automation-playwright-front.onrender.com` (cold start ~13s)
- Legacy `https://buzzhive-test.onrender.com` — still in render.yaml but no longer used by workflows
- Both new services wake independently

## Test Results (carryover from Session 36)
- Mutation: 34/34 pass ✅
- Contract: 28/28
- Total: 62/62

## Post-Session-36 Fixes (observed in GitHub but not in checkpoint)
These were applied between Sessions 36 and 37, but checkpoint wasn't updated:
- `fix(frontend): use relative /api/health instead of hardcoded backend…` (commit 0956ddc)
- `fix(ui): add waitForLoadState + increase timeouts for Render cold start` (commit a686313)
- `fix(ci): skip UI smoke tests when FRONTEND_URL is not configured` (commit 2178bed)

## No-Go Zones (carryover)
- Modifying `backend/` or `frontend/` source code
- Changing CI/CD pipelines (`.github/workflows/*`, `render.yaml`) — only with approval
- Editing `AGENTS.md` directly
- Committing `.env*` files or secrets

## Next Steps (Session 38+)
1. User sets GitHub vars `BACKEND_URL` + `FRONTEND_URL`
2. `gh workflow run uptime.yml` to verify fix
3. (Optional) Update `render.yaml` to point to new backend URL (or keep `buzzhive-test` if still deployed)
4. LinkedIn posts: Webwright Limitations + Strategy (pending publication)
5. Cover Letter: Precisely (pending)

---

# Session 36 Archive

**Date:** 2026-06-04
**Session:** 36 — Orchestration + SOPs + SERVER_ACCESS
**Status:** COMPLETE

## Work Completed

### All 34 Mutation Tests Passing ✅
- MUT-009: Route `**/api/posts/feed` → `**/api/posts**` (broader interception)
- MUT-011: `text=not found|404|does not exist` → `text=/not found|404|does not exist/i` (regex fix)
- MUT-012: Feed data already loaded comments, simplified to count=0 check
- MUT-013: Restored — `data-testid="post-like-btn-{postId}"` exists in DOM
- MUT-014: Restored — `data-testid="profile-follow-btn"` exists in DOM
- HOM-001, MUT-016/018/019: Previously fixed

### Key Insights Discovered
- `text=a|b|c` in Playwright = literal pipes, not regex. Use `text=/a|b|c/i`
- Frontend caches feed — route interception only works before page load
- Comments load with feed, not as separate API call
- `data-testid` attributes exist on like/follow buttons — tests were skipped unnecessarily

## Test Results

### qa-automation-sandbox
- **Mutation tests: 34/34 pass** ✅ (0 skipped, 0 failed)
- Contract tests: 28/28 (Schema 17 + Consumer 9 + Provider 2)
- **Total: 62/62 tests pass**

### OrangeHRM
- 7/7 @smoke pass ✅
- 2 destructive tests fail on shared demo (not code issue)
- 2 search timeout tests (pre-existing)

## Modified Files
- `e2e/mutation/api-mutation-extended.spec.ts` — 6 fixes: MUT-009/011/012 route patterns, MUT-013/014 restored
- `~/.opencode-memory.md` — Session 30 entry added

## No-Go Zones (require human approval)
- Modifying `backend/` or `frontend/` source code
- Changing CI/CD pipelines (`.github/workflows/*`, `render.yaml`)
- Editing `AGENTS.md` directly — AI may suggest changes only
- Committing any `.env*` files or secrets
- Deploying to production Render services

## Next Steps
1. **LinkedIn posts** — Webwright Limitations + Strategy publication
2. **OrangeHRM** — fix admin autocomplete, waitForTimeout audit
3. **Cover Letter** — Precisely (pending)

## Session 36 Additions (2026-06-04)

### Multi-Agent Orchestration
- `orchestration/AGENT_TASKS.md` — 7 tasks with lock protocol
- Agents: MiMo (code gen), DeepSeek (reasoning), BigPickle (multimodal)
- Lock: `status: available` → `locked` + agent name → `done`

### SOP Files (4)
- `sop/mutation-testing.md` — run + analyze 34 mutation tests
- `sop/contract-testing.md` — schema + consumer + provider (28 tests)
- `sop/deploy-render.md` — push to main, verify health, smoke
- `sop/new-module.md` — POM + spec + fixtures + docs

### SERVER_ACCESS.md
- `OrangeHRM/outputs/SERVER_ACCESS.md` — all credentials consolidated
