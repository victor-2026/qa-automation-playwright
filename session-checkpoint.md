# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-28
**Status:** COMPLETE (session ended)

## Session 11 — Render Frontend Deploy (ongoing saga)

### Dockerfile: 7 attempts

| Commit | Approach | Result |
|--------|----------|--------|
| `0b06746` | Original `frontend/Dockerfile` with `frontend/` COPY prefix | ✅ Last working deploy (Mar 30) |
| `33fe71f` | Same Dockerfile (blank line trigger) | ❌ `"/frontend/nginx.conf": not found` |
| `7ed25c4` | Removed `frontend/` COPY prefix | ❌ `"/nginx.conf": not found` |
| `4128304` | Restored `frontend/` prefix | ❌ `"/frontend/nginx.conf": not found` |
| `413d508` | Moved to root as `Dockerfile.frontend` | ❌ `open Dockerfile: no such file or directory` |
| `8ff6512` | Renamed root to `Dockerfile` | ❌ `open Dockerfile: no such file or directory` |
| `76f7419` | Restored `frontend/Dockerfile`, `COPY --from=builder` | ❌ `open Dockerfile: no such file or directory` |
| `473ea47` | Root `Dockerfile` + `frontend/Dockerfile` | ⏳ awaiting Render build |

### Key Discovery
- Render **ignores** `dockerfilePath` in `render.yaml` for existing services (service was created manually, Blueprint not synced)
- Render expects `Dockerfile` at repo root
- BuildKit cache corruption: `COPY frontend/nginx.conf` fails with `failed to compute cache key` even though file exists
- Fix: `COPY --from=builder` bypasses context checksum issue

### Current State
- Root `Dockerfile` + `frontend/Dockerfile` (identical, `COPY --from=builder`)
- Both build locally: `docker build . --no-cache` ✅, `docker compose build frontend` ✅
- Frontend serving from old deploy `0b06746`: `HTTP/2 200` ✅
- Backend healthy: `{"status":"healthy","database":"connected"}` ✅
- 17 smoke tests pass on Render (12 API + 5 UI) ✅
- Render free tier: polling-only (no webhook), deploys take 10-20 min

### Files Modified
- `Dockerfile` — NEW (root, for Render)
- `frontend/Dockerfile` — completely rewritten, `COPY --from=builder`
- `render.yaml` — `dockerfilePath` reverted to `./frontend/Dockerfile`
- `docker-compose.yml` — `dockerfile: frontend/Dockerfile`
- `session-checkpoint.md` — updated

## Next Steps
1. Verify Render deploy for commit `473ea47` (root Dockerfile with `COPY --from=builder`)
2. If still fails: clear Render build cache in dashboard (Settings → Build Cache → Clear)
3. Fix BUG-005 (XSS) — escape HTML in PostCard content
4. Fix BUG-006 (negative likes) — `Math.max(0, likesCount)`
5. UI Fuzzing tests (`e2e/mutation/ui-fuzz.spec.ts`)
