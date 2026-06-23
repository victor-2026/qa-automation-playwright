# QA Automation Sandbox — May 2026 Summary Report

**Project:** Buzzhive QA Sandbox  
**Budget:** $0 (free tools)  
**Repository:** [victor-2026/qa-automation-playwright](https://github.com/victor-2026/qa-automation-playwright)  
**Render URL:** [buzzhive-test.onrender.com](https://buzzhive-test.onrender.com)

---

## Executive Summary

May was a month of **architecture and honest numbers**. Zero new tests — only refactoring, stabilization, documentation.

| Metric | April | May | Comment |
|--------|-------|-----|---------|
| Unique tests | ~489 | **292** (×4 browsers = **1157** runs) | Honest count, not "2000+" |
| API coverage | 94% | **94%** (stable) | 49/52 endpoints |
| Monoliths | 2 (~4,000 lines) | **0** | Split into 23 modules |
| Test languages | 3 (TS + Go + Python) | **5 (TS + Go + C# + Python + k6)** | +C#, +k6 |
| CI/CD | Render smoke | **Render smoke + quality gates + uptime monitor** | |
| Documentation | — | **5 TEST_ARCHITECTURE.md, 3 Canvas diagrams** | |
| Architecture diagrams | 0 | **3 (Go, C#, Mutation)** | Obsidian Canvas |
| Bugs found | 0 | **6 (1 race + 2 mutation + 3 fuzzer)** | |

---

## 🏗️ Test Architecture (5 Layers)

```
                         npx playwright test
                    1157 runs × 4 browser projects
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                   │
    ┌────┴────┐       ┌────┴────┐        ┌────┴────┐
    │  api/   │       │  ui/    │        │  load/  │
    │ 9 files │       │14 files │        │ 4 files │
    │ request │       │ page +  │        │  page   │
    │ (HTTP)  │       │   POM   │        │ (timing)│
    └────┬────┘       └────┬────┘        └────┬────┘
         │                  │                   │
    ┌────┴──────────────────┴──────────────────┴────┐
    │              mutation/ (3 stages)              │
    │     API Response → DB Data → Chaos (Docker)    │
    └──────────────────────┬────────────────────────┘
                           │
    ┌──────────────────────┴────────────────────────┐
    │  Shared: fixtures.ts / pages/ / teardown/     │
    │  POM: BasePage → LoginPage, NavPage, FeedPage │
    └───────────────────────────────────────────────┘
```

### 23 Modules Instead of 2 Monoliths

**April (before):**
```
e2e/
  ├── buzzhive.spec.ts       ← 2349 lines, monolith (UI + API)
  └── api-expanded.spec.ts   ← 1559 lines, duplicate
```

**May (after):**
```
e2e/
  ├── api/     (9 files, 2906 lines)  — Auth, Posts, Users, Admin,
  │                                        Conversations, Notifications,
  │                                        Health, Metamorphic, Smoke
  ├── ui/      (14 files, 1270 lines) — Auth, Posts, Profile, Admin,
  │                                        Comments, Navigation, Messages,
  │                                        Notifications, Follows, Search,
  │                                        Moderator, Logout, Performance
  ├── load/    (4 files)               — Smoke, Basic, Stress, Network
  ├── mutation/(3 files)               — API, DB, Chaos
  ├── pages/   (4 classes)             — BasePage, LoginPage, NavPage, FeedPage
  └── fixtures.ts                      — test.extend (shared across all)
```

---

## 🌐 Multi-Browser Strategy

Each `test()` runs automatically ×4:

| Project | Device | Tests | Exceptions |
|---------|--------|-------|------------|
| Chromium | Desktop | **281** | `mobile.spec.ts` excluded |
| Mobile Safari | iPhone 15 Pro | **292** | All |
| Mobile Safari Plus | iPhone 15 Pro Max | **292** | All |
| Mobile Chrome | Pixel 5 | **292** | All |

**Total: 1157 runs (292 unique × 4 projects)**

---

## 🗂️ Architectural Documentation (New in May)

May created **5 TEST_ARCHITECTURE.md documents** and **3 visual diagrams (Canvas)**:

| Document | Lines | About |
|----------|-------|-------|
| `e2e/TEST_ARCHITECTURE.md` | 334 | Main TS stack: 23 modules, 5 layers, CI, patterns |
| `e2e/mutation/TEST_ARCHITECTURE.md` | 214 | 3 mutation stages (API/DB/Chaos), gzip fix, BUG-005, BUG-006 |
| `go-backend/TEST_ARCHITECTURE.md` | 105 | Go: Users + Follows, error handling, race detection |
| `csharp-backend/TEST_ARCHITECTURE.md` | 185 | C#: Fuzzer + PBT + Schema + Race + Meta, porting rules |
| `e2e/mutation/MUTATION_PLAN.md` | 225 | Mutation testing plan |

| Canvas | Nodes | Edges | Visualizes |
|--------|-------|-------|------------|
| `Go-Test-Architecture.canvas` | 7 | 9 | Go API + UI layer diagram |
| `CSharp-Test-Architecture.canvas` | 8 | 10 | C# module diagram (color-coded) |
| `Mutation-Test-Architecture.canvas` | 7 | 9 | 3 stages + patterns + bugs |

---

## 🧪 Multi-Language Test Stack

May expanded the project from 3 to 5 languages:

```
                   ┌──────────────────────┐
                   │   QA Automation       │
                   │   5 languages, 7      │
                   │   frameworks          │
                   └──────┬───────────────┘
          ┌────────────────┼────────────────┐
          ▼                ▼                 ▼
   ┌──────────┐    ┌──────────┐     ┌──────────┐
   │TypeScript│    │    Go    │     │    C#    │
   │ Playwr.  │    │ net/http │     │ xUnit +  │
   │ Jest     │    │ testify  │     │ FsCheck  │
   │ fast-ch. │    │          │     │ Newton.  │
   │ Cucumber │    │          │     │          │
   ├──────────┤    ├──────────┤     ├──────────┤
   │ 1157 runs│    │ 11 tests │     │ 41 tests │
   │ ×4 brows.│    │ 2 files  │     │ 5 modules│
   └──────────┘    └──────────┘     └──────────┘
          │
          ▼
   ┌──────────┐    ┌──────────┐
   │ Python   │    │   k6     │
   │ Pytest   │    │ Load     │
   │ 28 tests │    │ 5 scripts│
   └──────────┘    └──────────┘
```

| Language | Tests | Framework | What It Covers |
|----------|-------|-----------|---------------|
| **TypeScript** | 1157 (×4) | Playwright + Jest | E2E API + UI + Load + Mutation |
| **TypeScript (PBT)** | 56 | fast-check | Property-based for 7 methods |
| **TypeScript (DB)** | ~20 | Jest + pg | PostgreSQL direct queries |
| **TypeScript (Gherkin)** | 42 | Cucumber | BDD scenarios |
| **Go** | 11 | net/http + testify | Users + Follows API |
| **C#** | 41 | xUnit + FsCheck | Fuzzer + PBT + Schema + Race + Metamorphic |
| **Python** | 28 | Pytest | API smoke + ad-hoc |
| **k6** | 5 | k6 | Load + stress |
| **Total** | **~1351** | 7 frameworks | |

---

## 🎯 Key Changes in May

### 1. Monoliths → Modules
- `buzzhive.spec.ts` (2349 lines) → 14 UI modules
- `api-expanded.spec.ts` (1559 lines) → 9 API modules (deleted as duplicate)
- All files migrated to `import { test, expect } from '../fixtures'`

### 2. Race Condition Found and Fixed
- **Root cause:** `datetime.now()` as JWT `exp` → same timestamp → same JWT → `unique_violation`
- **Fix:** `jti: uuid.uuid4()` in refresh token payload
- **When it lived:** since API launch (April)

### 3. Render Stabilization (May 27, 3 commits in 1 hour)
- Global exception handlers (all errors → JSON, not HTML)
- Connection pool (pool_size=10, pool_pre_ping)
- URL transformation (sslmode=require)
- UUID safe parsing (ValueError → UnauthorizedException)
- Removed unused Pillow/slowapi

### 4. Uptime Monitor
- GitHub Actions workflow — checks Render health every 15 min
- Failure → GitHub email alert

### 5. Smoke Tests Expanded
- 6 → 12 endpoints
- safeJson() — don't fail on HTML responses
- 12 tests: health, login, register, posts, users, admin, CORS

### 6. GitHub Pages
- Jekyll build step: `.md` → `.html` without extension
- Monthly reports (April archive + May report)
- 5 pages: presentations, test report, AI-ready DOR, API contract, bugs

---

## 🧬 Mutation Testing (New in May)

Three mutation testing approaches without access to source code:

```
Stage 1 — API Response (8 tests)    Stage 2 — DB Data (4 tests)
─────────────────────────────        ─────────────────────────
page.route() intercept              pg direct SQL mutation
likes→0, null username,             is_active→false (banned)
500 login, empty feed,              DELETE post (not found)
unverified, missing avatar,         XSS injection → BUG-005
401 redirect, XSS escape            negative likes → BUG-006
        │                                    │
        └────────────────┬───────────────────┘
                         ▼
              Stage 3 — Chaos (3 tests)
              ─────────────────────────
              Docker stop/restart
              db down, backend down,
              restart recovery
              Guard: DOCKER_CHAOS=1
```

### Bugs Found by Mutation

| Bug | Severity | What | Where |
|-----|----------|------|-------|
| BUG-005 | 🔴 Critical | Post content renders HTML as-is — XSS | `PostCard.tsx` |
| BUG-006 | 🟡 Low | Negative likes_count = -5, not 0 | `PostCard.tsx` |

---

## 🐛 All Bugs Found in the Project

| Bug | Where | Found By | Month |
|-----|-------|----------|-------|
| Refresh token race condition | Auth API | Refactoring | May |
| BUG-001: Unicode control chars → 500 | Posts | C# Fuzzer | May |
| BUG-002: Concurrent follow/unfollow → 500 | Follows | C# Race | May |
| BUG-003: Parallel register → duplicates | Auth | C# PBT | May |
| BUG-004: Parallel register → 500 | Auth | C# PBT | May |
| BUG-005: Post content XSS (HTML rendering) | UI | Mutation | May |
| BUG-006: Negative likes displayed as -5 | UI | Mutation | May |

---

## 🤖 AI Tools Landscape (2-Month Dynamics)

```
Phase 1 (April)                          Phase 2 (May)
─────────────────                        ──────────────
GPT-5.0 Mini (OpenCode)   ──replaced──→   GPT-5 Nano
Groq Llama 3.3 70B                       Groq Llama 3.3 70B
Ollama qwen2.5:3b                        Ollama qwen2.5:3b
GitHub Copilot                           GitHub Copilot
                     ──new──→            MiniMax M2.5 free (promo ended)
                     ──new──→            Cursor Hobby (limit 50 req)
                     ──new──→            Cline (couldn't handle >2000 lines)
```

**Over 2 months, 17 AI models/tools cycled through. 5 remained free, 7 left.**

### Currently Free

| Tool | Model | Status |
|------|-------|--------|
| OpenCode Desktop | `glm-5-free`, `minimax-m2.7-free`, `gpt-5-nano` | ✅ |
| GitHub Copilot | — | ✅ |
| Ollama | `qwen2.5:3b` (1.9GB local) | ✅ |
| Groq | `Llama 3.3 70B` (500 tok/s) | ✅ |

---

## 📊 CI/CD Pipeline

```
Push to main
     │
     ├──► render-e2e (30m)
     │      API smoke (12 tests)
     │      UI smoke (5 tests)
     │      Render staging
     │
     ├──► quality-gates (5m)
     │      lint + typecheck + audit
     │
     └──► GitHub Pages
            Jekyll build → gh-pages

Nightly (3 AM UTC)
     │
     └──► smoke (30m)
            API smoke (12 tests)
            UI smoke (5 tests)

Uptime Monitor (every 15 min)
     │
     └──► Render health check
            Failure → GitHub email alert
```

---

## 📋 Known Limitations

| Limitation | Reason | Status |
|------------|--------|--------|
| Full suite only local | Requires Docker (PostgreSQL + backend + frontend) | ❌ |
| CI Docker disabled | GHA ubuntu-latest has no Docker socket | ❌ |
| Render only smoke | Cold start 503 + timeouts | ❌ |
| Mobile — emulators | Not real devices | ⚠️ |
| Load — single-threaded | Not distributed | ⚠️ |
| Go — no helpers | `client.go` lost, tests don't compile | ❌ |
| No Page Objects for all pages | Profile, Admin, Search — raw page | ⚠️ |

---

## 🔜 June Plan

1. **Go:** restore helper files + add `-race` + `t.Cleanup`
2. **C#:** add C# test CI run
3. **TS:** Page Objects for Profile, Admin, Search
4. **Infra:** Docker CI in GitHub Actions
5. **Article:** publish Phase 2 article on LinkedIn
6. **Docs:** 1-pager on AI Tools Landscape for portfolio

---

## 🔗 Links

- [Home](.) — portal
- [April 2026 Report](Report-April-2026)
- [Presentation for Management](PRESENTATION_FOR_MANAGEMENT)
- [Presentation PART 2](PRESENTATION_PART2)
- [Test Report](TEST_REPORT)
- [API Contract](API_CONTRACT)
- [BUGS](BUGS)
- [ARCH: TS e2e](https://github.com/victor-2026/qa-automation-playwright/blob/main/e2e/TEST_ARCHITECTURE.md)
- [ARCH: Go](https://github.com/victor-2026/qa-automation-playwright/blob/main/go-backend/TEST_ARCHITECTURE.md)
- [ARCH: C#](https://github.com/victor-2026/qa-automation-playwright/blob/main/csharp-backend/TEST_ARCHITECTURE.md)
- [ARCH: Mutation](https://github.com/victor-2026/qa-automation-playwright/blob/main/e2e/mutation/TEST_ARCHITECTURE.md)

---

*Generated 2026-05-28 | Data from playwright --list, git log, TEST_ARCHITECTURE.md*
