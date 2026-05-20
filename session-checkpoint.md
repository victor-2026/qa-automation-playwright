# Session Checkpoint - qa-automation-sandbox

**Date:** 2026-05-20
**Status:** IN PROGRESS

## Work Completed

### Docs created
- `docs/PYTHON_PLANS_AND_FACTS.md` — Python testing layer overview
- `docs/PLAYWRIGHT_PLANS_AND_FACTS.md` — Playwright architecture, issues, roadmap

### GitHub Pages fixed
- Root cause: sparse checkout in `pages.yml` → 404 on all links
- Fixed: removed sparse checkout, switched to Jekyll (`_config.yml`), bare links, `.md` renders as HTML
- Merged to `main`, deployed successfully

### CI
- Added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` to `pages.yml`

### Cline agent work
- Improved `health.spec.ts` (32 tests, 20 pass, 12 skip)
- Added `trace: 'on-first-retry'` to `playwright.config.ts`
- Created `e2e/ui/` folder

### .clinerules created
12 sections: stack, POM, locators, self-correction, security, session checklist, self-review, runbook, selectors, business logic, branches, references

## Paused — Next Session

### What's done
- [x] Duplicate API test detection (`buzzhive` = 100% dupes of `e2e/api/`)
- [x] `trace: 'on-first-retry'` in config
- [x] `e2e/ui/` folder created

### What remains
- [ ] Split UI tests from `buzzhive.spec.ts` into `e2e/ui/` (login, registration, navigation, performance, security, posts, messages, notifications, moderator, admin)
- [ ] Add header comment to UI files (local-only)
- [ ] Update imports to `import { test, expect } from '../fixtures'`
- [ ] Add shared `beforeEach`/`afterEach` hooks
- [ ] Run lint + fix imports
- [ ] Execute API + UI suites
- [ ] Delete `buzzhive.spec.ts`
- [ ] Update documentation
- [ ] Remove `api-expanded.spec.ts` (also mostly duplicated by `e2e/api/`)
- [ ] Fix refresh token race condition
- [ ] Switch spec files to use `fixtures.ts`
- [ ] Add Python CI
