# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-30
**Session:** 20 — Checkpoint enforcement + AGENTS.md discussion
**Status:** COMPLETE
**Session closed:** 2026-05-30 — checkpoint saved, AGENTS.md mandatory rule added

## Summary

### CapsLock QA Team Lead — Job Analysis
- Career-mentor analysis: 80% match, главная проблема — Playwright похоронен в CV
- Perplexity-style company context analysis (performance marketing, landing pages)
- Written recruiter response (Hanna: "you don't have Playwright experience")
- Saved to `~/Private/Positions-CV-CL/raw/capslock-qa-team-lead-analysis.md` (job posting)
- Saved to `~/Private/Positions-CV-CL/wiki/capslock-qa-team-lead.md` (full analysis + CV recommendations)
- Added StarCompliance AI Quality Engineering Lead to `AI-QA-Requirements.md` (нерелевантная, но ценные требования)

### Render Frontend Deploy Fix
- **Root cause:** build context = repo root, Dockerfile копировал корневой `package.json` (без `build`)
- **Attempt 1:** `rootDirectory: frontend` в `render.yaml` — не сработало (Render игнорирует)
- **Attempt 2:** `COPY frontend/package.json` с префиксом — **сработало** (`cc5e565`)
- Dockerfile: `FROM node:20-alpine AS build`, все пути с `frontend/` префиксом

### Render Smoke Test Results
- **17/17 passed** smoke API + smoke UI ✅ (26.6s)
- **Full suite (1341 tests, interrupted):** 49 passed, 5 failed, 5 flaky, 1282 not run

### Render Test Issues Found
1. **Timeout 5s (all flaky + 3 failed)** — Render free tier cold start. Надо 15-20s
2. **Status code mismatch:**
   - ADMIN-API-016: expects 204 → gets [400, 401, 403, 409, 500]
   - ADMIN-API-001: expects 401 → gets [403, 404, 500]
   - MSG-API-015: expects 401 → gets [200, 403]

### LinkedIn Post
- Phase 2 carousel post text written (1200 chars, first-person, $0 budget narrative)
- Author: *Victor Ematin · AI Quality Engineering Lead · $0 budget*
- Link to Phase 1: includes LinkedIn post URL

### AGENTS.md Standard Upgrade (Фаза 1) ✅
- **Boundaries table** (yes/ask/never) — added to sandbox, ai-qa-wiki, CV-CL, MAS
- **Architecture map** — directory tree with purpose in all 4 projects
- **Sources of Truth** — priority chain: AGENTS.md → checkpoint → global memory → skills
- **4 anti-patterns** — no secrets, no dated facts, no model-specific, ≤32 KiB
- **AGENTS.md Constraints** section in all 4 projects
- **MAS-realisation AGENTS.md** — restructured (removed dated facts, session history → checkpoint)
- **Checkpoint strengthened** — 14 API endpoints listed + 5 no-go zones

### AGENTS.md Standard Upgrade (Фаза 2) ✅
- **Code conventions** — naming, page objects, imports → sandbox/AGENTS.md
- **Review & PR guidelines** — consolidated checklist + commit format → sandbox/AGENTS.md
- **Self-Review Rule** — merged into Review & PR, removed duplicate
- **Checkpoint template** — updated with API endpoints + no-go zones → sandbox/AGENTS.md
- **Monthly lint** — expanded to include AGENTS.md → ai-qa-wiki/AGENTS.md
- **Boundaries expanded** — added `go-backend/`, `csharp-backend/`, `e2e/mutation/`, `e2e/load/`, `e2e/utils/`, `e2e/api/`, `e2e/ui/`
- **Global memory rule** — added "Update ~/.opencode-memory.md at end of session" to sandbox, ai-qa-wiki, CV-CL AGENTS.md

## Modified Files (qa-automation-sandbox)
- `frontend/Dockerfile` — `COPY frontend/` prefix, AS build stage name
- `render.yaml` — removed rootDirectory, dockerfilePath back to `./frontend/Dockerfile`
- `AGENTS.md` — Фаза 1: Boundaries, Architecture, Sources of Truth, Constraints. Фаза 2: Code conventions, Review/PR guidelines, checkpoint template
- `session-checkpoint.md` — added API endpoints, no-go zones, Session 19-20

## Modified Files (Positions-CV-CL)
- `raw/capslock-qa-team-lead-analysis.md` — job posting text + recruiter message
- `wiki/capslock-qa-team-lead.md` — full analysis + CV recommendations + response
- `raw/capslock-perplexity-analysis.md` — deleted (AI content, not source)
- `wiki/AI-QA-Requirements.md` — added StarCompliance entry

## Active API Endpoints
- `GET /health` — health check
- `POST /auth/login` — login
- `POST /auth/refresh` — refresh token
- `GET /auth/me` — current user profile
- `GET /posts` — list posts
- `POST /posts` — create post
- `GET /users` — list users (admin)
- `GET /users/{id}` — get user
- `PATCH /users/{id}/role` — change role (admin)
- `GET /conversations` — list conversations
- `POST /conversations` — create conversation
- `GET /notifications` — list notifications
- `GET /admin/users` — admin user management
- `PATCH /admin/users/{id}` — admin user update

## No-Go Zones (require human approval)
- Modifying `backend/` or `frontend/` source code
- Changing CI/CD pipelines (`.github/workflows/*`, `render.yaml`)
- Editing `AGENTS.md` directly — AI may suggest changes only
- Committing any `.env*` files or secrets
- Deploying to production Render services

## Verification
- Smoke on Render: 17/17 ✅
- Full suite on Render (interrupted): 49 passed, 5 failed, 5 flaky

## Next Steps
- Fix timeouts for Render (5s → 15-20s)
- Fix status code expectations for Render backend (admin, conversations, metamorphic)
- Answer CapsLock recruiter
- Upload Phase 2 carousel to LinkedIn
