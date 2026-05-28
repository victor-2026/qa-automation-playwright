# QA Automation Sandbox — Сводный отчёт за Май 2026

**Проект:** Buzzhive QA Sandbox  
**Бюджет:** $0 (бесплатные инструменты)  
**Репозиторий:** [victor-2026/qa-automation-playwright](https://github.com/victor-2026/qa-automation-playwright)  
**Render стенд:** [buzzhive-test.onrender.com](https://buzzhive-test.onrender.com)

---

## Executive Summary

Май стал месяцем **архитектуры и честных цифр**. Ни одного нового теста — только рефакторинг, стабилизация, документация.

| Метрика | Апрель | Май | Комментарий |
|---------|--------|-----|-------------|
| Уникальных тестов | ~489 | **292** (×4 браузера = **1157** runs) | Честная цифра, не «2000+» |
| API покрытие | 94% | **94%** (стабильно) | 49/52 endpoints |
| Монолиты | 2 (~4,000 строк) | **0** | Разделены на 23 модуля |
| Языки тестов | 3 (TS + Go + Python) | **5 (TS + Go + C# + Python + k6)** | +C#, +k6 |
| CI/CD | Render smoke | **Render smoke + quality gates + uptime monitor** | |
| Документация | — | **5 TEST_ARCHITECTURE.md, 3 Canvas схемы** | |
| Архитектурных схем | 0 | **3 (Go, C#, Mutation)** | Obsidian Canvas |
| Найдено багов | 0 | **6 (1 race + 2 mutation + 3 fuzzer)** | |

---

## 🏗️ Архитектура тестов (5 слоёв)

```
                        npx playwright test
                   1157 runs × 4 browser projects
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                   │
   ┌────┴────┐       ┌────┴────┐        ┌────┴────┐
   │  api/   │       │  ui/    │        │  load/  │
   │ 9 файлов│       │14 файлов│        │ 4 файла │
   │ request │       │ page +  │        │  page   │
   │ (HTTP)  │       │   POM   │        │ (timing)│
   └────┬────┘       └────┬────┘        └────┬────┘
        │                  │                   │
   ┌────┴──────────────────┴──────────────────┴────┐
   │              mutation/ (3 стадии)              │
   │     API Response → DB Data → Chaos (Docker)    │
   └──────────────────────┬────────────────────────┘
                          │
   ┌──────────────────────┴────────────────────────┐
   │  Shared: fixtures.ts / pages/ / teardown/     │
   │  POM: BasePage → LoginPage, NavPage, FeedPage │
   └───────────────────────────────────────────────┘
```

### 23 модуля вместо 2 монолитов

**Апрель (было):**
```
e2e/
  ├── buzzhive.spec.ts       ← 2349 строк, монолит (UI + API)
  └── api-expanded.spec.ts   ← 1559 строк, дубликат
```

**Май (стало):**
```
e2e/
  ├── api/     (9 файлов, 2906 строк)  — Auth, Posts, Users, Admin,
  │                                        Conversations, Notifications,
  │                                        Health, Metamorphic, Smoke
  ├── ui/      (14 файлов, 1270 строк) — Auth, Posts, Profile, Admin,
  │                                        Comments, Navigation, Messages,
  │                                        Notifications, Follows, Search,
  │                                        Moderator, Logout, Performance
  ├── load/    (4 файла)               — Smoke, Basic, Stress, Network
  ├── mutation/(3 файла)               — API, DB, Chaos
  ├── pages/   (4 класса)              — BasePage, LoginPage, NavPage, FeedPage
  └── fixtures.ts                      — test.extend (единый для всех)
```

---

## 🌐 Multi-Browser стратегия

Каждый `test()` автоматически запускается ×4:

| Проект | Устройство | Тестов | Исключения |
|--------|-----------|--------|------------|
| Chromium | Desktop | **281** | `mobile.spec.ts` исключён |
| Mobile Safari | iPhone 15 Pro | **292** | Все |
| Mobile Safari Plus | iPhone 15 Pro Max | **292** | Все |
| Mobile Chrome | Pixel 5 | **292** | Все |

**Total: 1157 runs (292 unique × 4 projects)**

---

## 🗂️ Архитектурная документация (новая в мае)

За май созданы **5 документов TEST_ARCHITECTURE.md** и **3 визуальные схемы (Canvas)**:

| Документ | Строк | О чём |
|----------|-------|-------|
| `e2e/TEST_ARCHITECTURE.md` | 334 | Главный TS-стек: 23 модуля, 5 слоёв, CI, паттерны |
| `e2e/mutation/TEST_ARCHITECTURE.md` | 214 | 3 стадии мутации (API/DB/Chaos), gzip fix, BUG-005, BUG-006 |
| `go-backend/TEST_ARCHITECTURE.md` | 105 | Go: Users + Follows, error handling, race detection |
| `csharp-backend/TEST_ARCHITECTURE.md` | 185 | C#: Fuzzer + PBT + Schema + Race + Meta, porting rules |
| `e2e/mutation/MUTATION_PLAN.md` | 225 | План мутационного тестирования |

| Canvas | Нод | Рёбер | Визуализирует |
|--------|-----|-------|--------------|
| `Go-Test-Architecture.canvas` | 7 | 9 | Go API + UI layer diagram |
| `CSharp-Test-Architecture.canvas` | 8 | 10 | C# module diagram (цветной) |
| `Mutation-Test-Architecture.canvas` | 7 | 9 | 3 стадии + patterns + bugs |

---

## 🧪 Многоязычный тестовый стек

Май расширил проект с 3 до 5 языков:

```
                   ┌──────────────────────┐
                   │   QA Automation       │
                   │   5 языков, 7 фрейм-  │
                   │   ворков              │
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

| Язык | Тестов | Фреймворк | Что покрывает |
|------|--------|-----------|--------------|
| **TypeScript** | 1157 (×4) | Playwright + Jest | E2E API + UI + Load + Mutation |
| **TypeScript (PBT)** | 56 | fast-check | Property-based для 7 методов |
| **TypeScript (DB)** | ~20 | Jest + pg | PostgreSQL прямыми запросами |
| **TypeScript (Gherkin)** | 42 | Cucumber | BDD-сценарии |
| **Go** | 11 | net/http + testify | Users + Follows API |
| **C#** | 41 | xUnit + FsCheck | Fuzzer + PBT + Schema + Race + Metamorphic |
| **Python** | 28 | Pytest | API smoke + ad-hoc |
| **k6** | 5 | k6 | Load + stress |
| **Total** | **~1351** | 7 фреймворков | |

---

## 🎯 Ключевые изменения в мае

### 1. Монолиты → Модули
- `buzzhive.spec.ts` (2349 строк) → 14 UI модулей
- `api-expanded.spec.ts` (1559 строк) → 9 API модулей (удалён как дубликат)
- Все файлы переведены на `import { test, expect } from '../fixtures'`

### 2. Найден и исправлен Race Condition
- **Root cause:** `datetime.now()` как JWT `exp` → одинаковый timestamp → одинаковый JWT → `unique_violation`
- **Fix:** `jti: uuid.uuid4()` в refresh token payload
- **Когда жил:** с запуска API (апрель)

### 3. Render Stabilization (27 мая, 3 коммита за час)
- Глобальные exception handlers (все ошибки → JSON, не HTML)
- Connection pool (pool_size=10, pool_pre_ping)
- URL transformation (sslmode=require)
- UUID safe parsing (ValueError → UnauthorizedException)
- Удалены неиспользуемые Pillow/slowapi

### 4. Uptime Monitor
- GitHub Actions workflow — проверка Render health каждые 15 мин
- Failure → GitHub email alert

### 5. Smoke-тесты расширены
- 6 → 12 эндпойнтов
- safeJson() — не падают на HTML-ответах
- 12 tests: health, login, register, posts, users, admin, CORS

### 6. GitHub Pages
- Jekyll build step: `.md` → `.html` без расширения
- Monthly reports (April archive + May report)
- 5 страниц: presentations, test report, AI-ready DOR, API contract, bugs

---

## 🧬 Mutation Testing (новое в мае)

Три подхода мутационного тестирования без доступа к исходному коду:

```
Stage 1 — API Response (8 тестов)    Stage 2 — DB Data (4 теста)
─────────────────────────────        ─────────────────────────
page.route() intercept              pg direct SQL mutation
likes→0, null username,             is_active→false (banned)
500 login, empty feed,              DELETE post (not found)
unverified, missing avatar,         XSS injection → BUG-005
401 redirect, XSS escape            negative likes → BUG-006
        │                                    │
        └────────────────┬───────────────────┘
                         ▼
              Stage 3 — Chaos (3 теста)
              ─────────────────────────
              Docker stop/restart
              db down, backend down,
              restart recovery
              Guard: DOCKER_CHAOS=1
```

### Баги, найденные мутацией

| Bug | Severity | Что | Где |
|-----|----------|-----|-----|
| BUG-005 | 🔴 Critical | Post content рендерит HTML как есть — XSS | `PostCard.tsx` |
| BUG-006 | 🟡 Low | Отрицательный likes_count = -5, не 0 | `PostCard.tsx` |

---

## 🐛 Все баги, найденные в проекте

| Bug | Где | Нашёл | Месяц |
|-----|-----|-------|-------|
| Refresh token race condition | Auth API | Рефакторинг | Май |
| BUG-001: Unicode control chars → 500 | Posts | C# Fuzzer | Май |
| BUG-002: Concurrent follow/unfollow → 500 | Follows | C# Race | Май |
| BUG-003: Parallel register → duplicates | Auth | C# PBT | Май |
| BUG-004: Parallel register → 500 | Auth | C# PBT | Май |
| BUG-005: Post content XSS (HTML rendering) | UI | Mutation | Май |
| BUG-006: Negative likes displayed as -5 | UI | Mutation | Май |

---

## 🤖 AI Tools Landscape (динамика за 2 месяца)

```
Phase 1 (апрель)                          Phase 2 (май)
─────────────────                        ──────────────
GPT-5.0 Mini (OpenCode)   ──заменён──→   GPT-5 Nano
Groq Llama 3.3 70B                       Groq Llama 3.3 70B
Ollama qwen2.5:3b                        Ollama qwen2.5:3b
GitHub Copilot                           GitHub Copilot
                    ──новые──→           MiniMax M2.5 free (акция кончилась)
                    ──новые──→           Cursor Hobby (лимит 50 req)
                    ──новые──→           Cline (не справилась с >2000 строк)
```

**За 2 месяца сменилось 17 AI-моделей/инструментов. 5 остались бесплатными, 7 ушли.**

### Бесплатные сейчас

| Инструмент | Модель | Статус |
|-----------|--------|--------|
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

Uptime Monitor (каждые 15 мин)
     │
     └──► Render health check
            Failure → GitHub email alert
```

---

## 📋 Известные ограничения

| Ограничение | Причина | Статус |
|-------------|---------|--------|
| Full suite только локально | Требует Docker (PostgreSQL + backend + frontend) | ❌ |
| CI Docker отключён | GHA ubuntu-latest не имеет Docker socket | ❌ |
| Render только smoke | Cold start 503 + таймауты | ❌ |
| Mobile — эмуляторы | Не реальные устройства | ⚠️ |
| Load — single-threaded | Не распределённый | ⚠️ |
| Go — без helpers | `client.go` утерян, тесты не компилируются | ❌ |
| Нет Page Objects для всех страниц | Profile, Admin, Search — голый page | ⚠️ |

---

## 🔜 План на июнь

1. **Go:** восстановить helper-файлы + добавить `-race` + `t.Cleanup`
2. **C#:** добавить CI-прогон C# тестов
3. **TS:** Page Objects для Profile, Admin, Search
4. **Infra:** Docker CI в GitHub Actions
5. **Article:** опубликовать Phase 2 статью на LinkedIn
6. **Docs:** 1-pager по AI Tools Landscape для портфолио

---

## 🔗 Ссылки

- [Главная](.) — портал
- [Отчёт за Апрель 2026](Report-April-2026)
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

*Сгенерировано 2026-05-28 | Данные из playwright --list, git log, TEST_ARCHITECTURE.md*
