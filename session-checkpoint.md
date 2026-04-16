# Session Checkpoint - 2026-04-17

## Session 6 (Evening) - DONE

### Articles Downloaded to ai-qa-wiki/raw/
1. anti-flakiness-habr.md — Анти-флаккинес (5.2K)
2. rtm-matrix-habr.md — Матрица трассируемости (6.6K)
3. llm-agents-cicd-cheating-habr.md — LLM-агенты читерят в CI/CD (11K)

### Key Patterns Learned
- **Anti-flakiness:** expect.poll, Idempotency-Key, 3 уровня моков
- **RTM:** >20 требований + команда 3+ = RTM окупается
- **LLM Security:** PoLP для AI критичен, промпты ≠ фаерволы

### Commits
- ai-qa-wiki: новые статьи запушены

---

## Session 5 (Day) - DONE

### Completed ✅
1. Fixed mobile test - replaced `mouse.wheel` with `touchscreen.tap` (e2e/mobile.spec.ts:101)
2. Updated TEST_REPORT.md - removed "Mobile mouse.wheel not supported" issue
3. Fixed security.yml - removed garbled text in rules path
4. Created pages.yml - GitHub Pages workflow for test report deployment
5. Fixed security.yml OWASP ZAP action (removed invalid `rules` param, updated to v0.14.0)
6. Security scan CI workflow works (success, 2 warnings - Node.js 20 deprecated)

### Commits
- `2137234` fix: replace mouse.wheel with touchscreen.tap, fix security.yml, add pages workflow
- `36c8d90` fix: update OWASP ZAP action version and remove invalid rules param
- `57da0c8` fix: remove backend service (image unavailable), add local run instructions
- `542809c` chore: update actions to latest versions

### Total Tests: 1153
- E2E: 122
- API: 280
- DB: 18
- PBT: 46
- Gherkin: 23
- Smoke: 7
- Sanity: ~25

### Commands Created
- Справочник_команд.md

### Next (Session 6)
1. Workflow for reports - publish test artifacts in CI
2. k6 load testing - for future projects with development backend
3. CI resume - when backend/frontend available

### Known Issues
- OWASP ZAP Docker images unavailable on Docker Hub (ghcr.io workaround)
- Security scan in CI checks localhost:8000 (no backend on runner)

### Notes
- Backend unstable — use retries: 2
- Remote: victor-2026/qa-automation-playwright
