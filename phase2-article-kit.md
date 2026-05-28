# Phase 2 Article — Working Kit (Honest Edition)

**Дата сбора:** 2026-05-27
**Редакция:** Honest Edition — все цифры проверены
**Статус:** Черновик, не опубликовано

---

## 1. ЗАГОЛОВКИ (честные версии, выбран 4A)

> **Phase 2: 4,000 Lines Deleted, 1,200 Tests Reorganized, 1 Race Condition Found**
>
> *The honest story: we didn't scale to 2,000 tests. We cleaned up a mess that AI helped create.*

### Варианты (с real цифрами):

| # | Формула | Вариант |
|---|---------|---------|
| 1 | Contrarian-open | **Phase 2: The AI Wrote 4,000 Lines of Spaghetti. Then We Fixed It.** |
| 2 | Data honest | Phase 2: 4,000 Lines Deleted, 1,200 Tests Reorganized, 1 Race Condition Found |
| 3 | Reframing | We Didn't Reach 2,000 Tests. But 1,200 Well-Organized Tests Beat 2,000 Spaghetti Ones. |
| 4 | Spaghetti metaphor | Phase 2: We Unspaghettified 4,000 Lines of Tests |
| 5 | Tools story | Phase 2: 12 AI Models, 23 Modules, 1 Race Condition |
| **6** | **Honest-bragging** | **I Spent 2 Months Refactoring 4,000 Lines of AI-Generated Tests. Here's What Survived.** |

---

## 2. ПЛАН СТАТЬИ (Round 1, Honest Edition)

**Lead:** In my first article, I showed how AI helped scale tests from 60 to 456 on a $0 budget. What I didn't show: the mess it left behind.

**Money Paragraph:** Two files — nearly 4,000 lines. One was a 2,349-line UI monolith with 15 copy-pasted API blocks. The other was a 1,559-line API duplicate. That's not scale. That's technical debt.

**The Honest Number (Money Paragraph v2):** ~4,000 lines from 2 monoliths → 23 modules, 1,200 real tests (×4 browsers = 1,057 Playwright), 1 race condition fixed, 12 AI models tried — 5 still free.

### Структура:

1. **The Mess Nobody Talks About** — таблица Before (buzzhive 2349 + api-expanded 1559)
2. **The Split: One Domain at a Time** — процесс экстракции (Cursor сделал 1 файл, MiniMax M2.5 — остальные ~20)
3. **The Bug We Found by Accident** — refresh token race condition, жил месяцами
4. **The Real Numbers** — не «2,000+», а 1,204; но 4 browser projects = эффективный охват
5. **What I Learned About AI Agents** — 12 моделей за 2 месяца, free tier market меняется еженедельно
6. **Conclusion — Honest Take**

### Call to Action (опционально):
> What's the messiest test suite AI has helped you create — and how did you clean it up?

### Хэштеги:
`#TestAutomation #Playwright #ZeroBudgetQA #TechDebt #Refactoring #GenAItesting #HonestMetrics`

---

## 3. РЕАЛЬНЫЕ ЦИФРЫ (проверено)

### Playwright tests (1057 across 4 projects)

| Проект | Кол-во | Исключения |
|--------|--------|-----------|
| Chromium | 256 | `mobile.spec.ts` исключён |
| Mobile Safari | 267 | — |
| Mobile Safari Plus | 267 | — |
| Mobile Chrome | 267 | — |
| **Total** | **1057** | |

### Non-Playwright tests

| Тип | Кол-во | Инструмент |
|-----|--------|-----------|
| PBT | 55 | Jest + fast-check |
| DB | 21 | Jest + pg |
| Python | 28 | Pytest |
| Go | 1 | Go test |
| Gherkin | 42 | Cucumber |
| **Total non-PW** | **147** | |

### Итого: ~1,204 (не 2,000+)

> ⚠️ В майском отчёте написано «2,000+». Это преувеличение. Реальное число: ~1,204 теста.
> Причина ошибки: 4 browser projects × 267 unique = 1,057 Playwright. Автоматически кажется, что «больше тысячи», но до 2,000 не дотягивает.
> Урок: считайте unique тесты, а не browser × tests.

---

## 3.5. ТЕКУЩАЯ СТРУКТУРА e2e/ (4253 lines total)

### 23 модульных файлов

```
e2e/
├── api/                          (9 files, 2906 lines)
│   ├── admin.spec.ts             (466 lines, 16715 bytes)
│   ├── auth.spec.ts              (432 lines, 13319 bytes)
│   ├── conversations.spec.ts     (279 lines, 8938 bytes)
│   ├── health.spec.ts            (130 lines, 4730 bytes)
│   ├── metamorphic.spec.ts       (227 lines, 8141 bytes)
│   ├── notifications.spec.ts     (285 lines, 9228 bytes)
│   ├── posts.spec.ts             (543 lines, 17373 bytes)
│   ├── smoke-api.spec.ts         (164 lines, 6117 bytes)
│   └── users.spec.ts             (380 lines, 11919 bytes)
├── ui/                           (14 files, 1270 lines)
│   ├── admin.spec.ts             (95 lines, 3634 bytes)
│   ├── auth.spec.ts              (340 lines, 14004 bytes)
│   ├── comments.spec.ts          (41 lines, 1375 bytes)
│   ├── follows.spec.ts           (41 lines, 1320 bytes)
│   ├── logout.spec.ts            (34 lines, 1131 bytes)
│   ├── messages.spec.ts          (32 lines, 1094 bytes)
│   ├── moderator.spec.ts         (71 lines, 2670 bytes)
│   ├── navigation.spec.ts        (70 lines, 3006 bytes)
│   ├── notifications.spec.ts     (52 lines, 2069 bytes)
│   ├── performance.spec.ts       (112 lines, 4336 bytes)
│   ├── posts.spec.ts             (88 lines, 3480 bytes)
│   ├── profile.spec.ts           (53 lines, 2205 bytes)
│   └── search.spec.ts            (241 lines, 9017 bytes)
├── fixtures.ts                   (77 lines)
└── ... (auth.setup.ts, mobile.spec.ts, smoke.spec.ts, etc.)
```

### Архитектура
- Все spec-файлы используют `import { test, expect } from '../fixtures'`
- API-тесты — 2906 строк (68% всего e2e/)
- UI-тесты — 1270 строк (30%)
- fixtures.ts — 77 строк (2%)
- Монолиты разделены на модули: `buzzhive.spec.ts` (2349 строк) → 14 UI модулей; `api-expanded.spec.ts` (1559 строк) → 9 API модулей

---

## 4. ЧТО КОГДА ДОБАВЛЕНО (git log)

| Фича | Дата | Фаза |
|------|------|------|
| PBT (55 тестов) | Апрель, `092970d` | Phase 1 |
| DB tests (21) | Апрель, `092970d` | Phase 1 |
| Mobile (iPhone 12 → 15) | Апрель, `c3e997f` → `1cf959e` | Phase 1 |
| Load tests (k6 + Playwright) | Апрель, `804cf40` | Phase 1 |
| Gherkin/Cucumber (42) | Апрель, `359cd8a` | Phase 1 |
| 4-project browser matrix | Апрель (с начала) | Phase 1 |
| Monolith split (buzzhive → 14 UI) | Май, `a83d0e7` | Phase 2 |
| Split api-expanded into 9 API modules | Май, `fcee077` | Phase 2 |
| fixtures.ts стандартизация | Май, `e7d7938` | Phase 2 |
| Race condition fix (jti) | Май, `ad337ce` | Phase 2 |
| GitHub Pages + reports | Май, `308100e`+ | Phase 2 |
| CI quality gates | Май, `b8c4bd2` | Phase 2 |

**Вывод:** Phase 2 — НЕ про новые тесты. Phase 2 — про архитектуру, чистоту, CI, баги. Ноль новых PBT, ноль новых мобильных фич, ноль новых фич вообще. Чистый рефакторинг.

**Контраст с Phase 1:**
| Метрика | Phase 1 (апрель) | Phase 2 (май) |
|---------|-----------------|---------------|
| Добавлено уникальных тестов | ~750+ | 0 |
| Удалено строк | — | ~3,908 |
| Монолиты | 2 (~4,000 строк) | 0 |
| Модули | ~8 | 23 |
| Найдено багов | 0 | 1 (race condition) |

---

## 5. ХРОНОЛОГИЯ AI-ИНСТРУМЕНТОВ

### Кто и что делал в Phase 2

| Файл / Задача | Инструмент | Модель | Результат |
|--------------|-----------|--------|-----------|
| 1-й файл из монолита | Cursor (Hobby free) | — | ✅ Сделано, потом лимит 50 requests |
| 2-й файл | OpenCode Desktop | MiniMax M2.5 free promo | ✅ Сделано, потом акция кончилась |
| Остальные ~20 файлов | OpenCode Desktop | MiniMax M2.5 free promo | ✅ Весь рефакторинг |
| Code review | GitHub Copilot (VSCode) | — | ✅ Лимит восстанавливается monthly |
| Попытка помочь | Cline (OpenRouter → Groq) | Разные | ⚠️ Частично, не справилась с объёмом |
| Попытка | Continue.dev | — | ❌ Слабо, не сложилось |
| Review / Approve | **Victor (человек)** | — | ✅ Всё проверил |

### Кто был — кто остался (динамика)

#### 🟢 Активны сейчас (бесплатно)

| Инструмент | Модель | Роль | Статус |
|-----------|--------|------|--------|
| OpenCode Desktop | glm-5-free | Codegen | ✅ |
| OpenCode Desktop | minimax-m2.7-free | Codegen | ✅ (M2.5 → M2.7) |
| OpenCode Desktop | gpt-5-nano | Быстрый код | ✅ |
| GitHub Copilot (VSCode) | — | Code review | ✅ monthly reset |
| Ollama | qwen2.5:3b (1.9GB local) | Анализ, RU | ✅ |
| Groq | Llama 3.3 70B (free) | Тяжёлый codegen | ✅ (TPM limit) |

#### 🟡 Консультации

| Инструмент | Для чего |
|-----------|---------|
| Gemini | Настройки, советы |
| ChatGPT | Настройки, советы |
| Perplexity | Поиск |

#### 🔴 Были — ушли

| Инструмент / Модель | Почему ушла |
|--------------------|-------------|
| OpenCode: minimax-m2.5-free | Акция кончилась (теперь M2.7) |
| OpenCode: gpt-5.0-mini | Заменили на gpt-5-nano |
| OpenCode: nemotron-3-super-free | Больше нет |
| OpenCode: big-pickle | Больше нет |
| OpenCode: mimo-v2-pro-free | Больше нет |
| OpenCode: mimo-v2-omni-free | Больше нет |
| Cursor (Hobby free) | Лимит 50 premium requests |
| Cline (OpenRouter/Groq) | Упала на объёме >2000 строк |
| Continue.dev | Слабо, не зашёл |
| Google Gemini API | Quota exceeded (429) |
| Ollama qwen2.5:14b (9GB) | Таймауты |

---

## 6. ПОЛНАЯ КАРТА ВСЕХ AI-МОДЕЛЕЙ В ПРОЕКТЕ

| Модель / Инструмент   | Через что      | Фаза      | Что делала       | Статус сейчас            |
| --------------------- | -------------- | --------- | ---------------- | ------------------------ |
| GPT-5.0 Mini          | OpenCode       | Phase 1   | Codegen          | 🔴 Заменён               |
| GPT-5 Nano            | OpenCode       | Phase 1-2 | Codegen          | 🟢 Работает              |
| MiniMax M2.5 free     | OpenCode       | Phase 2   | Весь рефакторинг | 🔴 Акция кончилась       |
| MiniMax M2.7 free     | OpenCode       | Phase 2+  | Codegen          | 🟢 Работает              |
| GLM-5 free            | OpenCode       | Phase 2+  | Codegen          | 🟢 Работает              |
| Nemotron 3 Super free | OpenCode       | Phase 1   | —                | 🔴 Ушла                  |
| Big Pickle            | OpenCode       | Phase 1   | —                | 🔴 Ушла                  |
| Mimo V2 Pro free      | OpenCode       | Phase 1   | —                | 🔴 Ушла                  |
| Mimo V2 Omni free     | OpenCode       | Phase 1   | —                | 🔴 Ушла                  |
| Llama 3.3 70B         | Groq (free)    | Phase 1-2 | Быстрый codegen  | 🟢 Работает (с лимитами) |
| qwen2.5:3b            | Ollama (local) | Phase 1-2 | Анализ, RU текст | 🟢 Работает              |
| qwen2.5:14b           | Ollama (local) | Phase 1   | Пытались         | 🔴 Таймауты              |
| Gemini 2.5            | Google API     | Phase 1   | Пытались         | 🔴 Quota exceeded        |
| Cursor-small          | Cursor Hobby   | Phase 2   | 1-й файл split   | 🔴 Лимит 50 req          |
| GPT-4o mini           | Cursor Hobby   | Phase 2   | Чат              | 🔴 Лимит                 |
| Copilot               | VS Code        | Phase 1-2 | Code review      | 🟢 Monthly reset         |

---

## 7. ВНЕШНИЙ СТЕНД — RENDER ТАЙМЛАЙН

**URL:** `https://buzzhive-test.onrender.com`
**Статус:** 🟢 Работает (backend API + PostgreSQL)

### Хронология

| Дата | Коммит | Что сделано |
|------|--------|------------|
| **Апрель** | | |
| 25 апр | `9c4e513` | Первый deploy — psycopg2-binary, config.py (postgres:// → asyncpg) |
| 25 апр | `36fc3d5` | API-only smoke tests (6 endpoints) |
| 25 апр | `83b4510` | render-e2e job в CI |
| 25 апр | `1bae447` | Документация деплоя |
| 25-29 апр | `47044bf`…`beaf2a7` | CORS diagnostics, env vars, мягкие проверки admin endpoint'ов |
| **Май** | | |
| 10 мая | `69f9588` | Metamorphic + health test reliability |
| 20 мая | `9d35b80` | Health.spec.ts — сильные ассершены, error handling |
| 27 мая | `5fb86f2` | **Backend stabilization:** global exception handlers, connection pool (pool_size=10, pool_pre_ping), URL transform (sslmode=require), reset safety, smoke test JSON safety |
| 27 мая | `6354a32` | UUID ValueError → UnauthorizedException, удалены Pillow/slowapi |
| 27 мая | `ecdd852` | **Uptime monitor** — checks Render health every 15 min, failure → GitHub email alert |

### Что на Render сейчас (27 мая, 3 коммита подряд за час)

- ✅ Глобальные exception handlers (все ошибки → JSON, не HTML)
- ✅ Connection pool (pool_size=10, pool_pre_ping)
- ✅ URL transformation (sslmode=require сохраняется)
- ✅ Reset endpoint — try/except
- ✅ Smoke-тесты — safeJson, не падают на HTML
- ✅ UUID safe parsing — ValueError → UnauthorizedException
- ✅ Удалены неиспользуемые Pillow/slowapi
- ✅ Smoke-тесты расширены: 12 эндпойнтов (было 6)
- ✅ Uptime monitor — проверка health каждые 15 мин
- ✅ Uptime monitor — workflow failure → GitHub email alert

### Smoke тесты на Render (12 endpoints)

```
GET  /health          → 200 + статус базы
POST /auth/login      → 200 + token (valid credentials)
POST /auth/login      → 401 (invalid credentials)
GET  /posts           → 200 + posts list (authenticated)
GET  /auth/me         → 200 + user profile
GET  /something       → 401 (no token)
GET  /auth/me         → 401 (expired token)
GET  /admin/users     → 403 (moderator)
GET  /conversations   → 200 (authenticated)
GET  /notifications   → 200 (authenticated)
POST /auth/register   → 201 (new user)
DELETE /auth/logout   → 200 or 204
```

### Архитектура связи

```
GitHub Push
   ↓
GitHub Actions (render-e2e job)
   ↓
Smoke tests → https://buzzhive-test.onrender.com
   ↓
Uptime monitor (каждые 15 мин) → health check
   ↓
Failure → GitHub email alert
```

---

| Раздел | Тип | Описание |
|--------|-----|----------|
| The Mess | 🖼️ INFOGRAPHIC | Спагетти-диаграмма: 1 толстый файл → 14 маленьких |
| The Split | 📷 SCREENSHOT | `tree e2e/` — структура модульных файлов |
| The Bug | 📷 SCREENSHOT | Код бага до/после (jti fix) |
| The Numbers | 🖼️ INFOGRAPHIC | Bar chart Phase 1 vs Phase 2 |
| AI Tools | 🖼️ INFOGRAPHIC | Таблица-матрица: кто был / кто остался |
| Cursor limit | 📷 SCREENSHOT | Copilot $50 bill 25 апреля (если есть) |

---

## 8. НАРРАТИВ (Honest Edition)

**Честный тезис (я виноват):**
> AI не создаёт технический долг сам по себе. Он просто усиливает то, что ты в него закладываешь. Плохой промпт → плохая архитектура. И это моя вина.

**Проблема:**
> Phase 1: я стартовал без внятного промпта. Просто «напиши тесты» — и AI нагенерировал ~4,000 строк монолитов за недели. Быстро. Но без архитектуры. Один файл содержал 2,349 строк UI-тестов с 15 копипастными API-блоками. AI не виноват — я не сказал ему, как надо.

**Попытка автоматизировать рефакторинг AI-агентами:**
> Cursor (free) → сделал 1 файл, кончился лимит 50 requests.
> MiniMax M2.5 free (через OpenCode) → сделал все остальные ~20 файлов, потом акция кончилась.
> Cline (OpenRouter) → упала на файлах >2000 строк.
> Continue.dev → слабо, не зашёл.
> Итог: AI сделал черновик рефакторинга, человек всё перепроверил и утвердил.

**Неожиданная находка:**
> Race condition в refresh token — жил в API с момента запуска (апрель). Нашёлся только когда мы переписывали тесты под модульную структуру.
> Корень: datetime.now() давал одинаковый timestamp → одинаковый JWT → unique_violation в БД.
> Фикс: 1 строчка — `jti: uuid.uuid4()` в payload.

**Честные цифры:**
> Не 2,000+ тестов, а ~1,204. Но 1,200 тестов × 4 браузера = 4,800 запусков. Модульная структура вместо 2 монолитов. CI smoke за 3 минуты вместо 2+ часов.
> И 5 из 12 AI-инструментов всё ещё бесплатны.

**Главный вывод:**
> AI прекрасно пишет новый код. Рефакторинг большого существующего кода — всё ещё задача, с которой справляются не все агенты. Рынок AI-инструментов в 2026: 12+ моделей сменилось за 2 месяца проекта. 5 free — остались. 7 — ушли или стали платными.

**Кому это важно:**
> Senior QA, Engineering Managers, CTOs. Тем, кто видит «AI написал 2000 тестов» в резюме и хочет знать, что на самом деле за этим стоит.

---

## 9. ФАКТ-ЧЕК КЛЮЧЕВЫХ УТВЕРЖДЕНИЙ

| Утверждение | Реальность (честная) | Вердикт для статьи |
|------------|---------------------|-------------------|
| «4,600 lines deleted» | 2,349 + 1,559 = **3,908** | ✅ Пиши «~4,000»
| «2,000+ tests» | 1,057 Playwright + 147 non-PW = **~1,204** | ✅ Пиши «1,200+» и объясни browser matrix
| «4 browser projects» | Chromium + 3 mobile = 4 отдельные конфиги | ✅ Козырь: 1,200 unique × 4 = 4,800 запусков
| «Zero monoliths» | 2 монолита → 23 модуля | ✅ True
| «23 modules» | 9 API + 14 UI | ✅ True
| «Race condition found» | jti fix, commit `ad337ce` | ✅ True
| «12 AI models tried» | 17 моделей/инструментов за 2 месяца | ✅ True, даже больше
| «5 still free» | OpenCode (3) + Ollama + Groq | ✅ True
| «Full CI» | Только 12 smoke tests на push | ⚠️ Не «full», а smoke. Честно: «CI runs 12 smoke tests in 3 min»
| «All AI free forever» | 7 моделей ушли, free tiers кончаются | ❌ Ложь. Пиши: «Free AI is a treadmill — keep moving or get left behind»

---

## 10. ПОЛНЫЙ GIT LOG (Phase 2, май 2026)

### Майские коммиты Phase 2 (37 коммитов)

```
6354a32 fix: UUID ValueError safe parsing + remove unused Pillow/slowapi
5fb86f2 fix: backend stabilization — global exception handlers, DB pool, URL transform, reset safety, smoke test JSON safety
e16ae15 feat: local dev fixes — API_PROXY_URL, nginx template, race condition cleanup
2db74cf docs: mark refresh token race condition as fixed
ad337ce fix: refresh token race condition - add jti + pre-cleanup
8dc4ec0 fix: move all old links to April archive, main page only has monthly reports
308100e feat: add monthly reports (April archive + May report)
b8c4bd2 fix: add Jekyll build step to pages.yml for .md → .html rendering
e7d7938 feat: switch api/*.spec.ts to fixtures import, revert dotenv (not installed)
a1f8cba chore: remove buzzhive stub, fix tokens.ts dead import, simplify dotenv config
fcee077 chore: remove api-expanded.spec.ts (duplicate of e2e/api/*)
a83d0e7 feat: split buzzhive.spec.ts into 13 modular UI test files under e2e/ui/
0b090eb fix: remove Auth (duplicate of e2e/ui/auth.spec.ts) and API duplicates from buzzhive.spec.ts
17c5220 fix: replace hardcoded URLs with relative paths, add afterEach hook in auth UI tests
... (27 more commits)
```

### Ключевые даты
- Split buzzhive.spec.ts: `a83d0e7` (May)
- Delete api-expanded.spec.ts: `fcee077` (May)
- Race condition fix: `ad337ce` (May)
- GitHub Pages + monthly reports: `308100e` (May)
- CI quality gates: `b8c4bd2` (May)

---

## 11. ЧТО НУЖНО СДЕЛАТЬ

- [x] Обновить все цифры под real (3,908 lines, 1,204 tests)
- [x] Переписать заголовки (6 честных вариантов готовы)
- [x] Обновить нарратив (честный тон, никаких «2,000+»)
- [ ] Выбрать финальный заголовок (из 6 вариантов)
- [ ] Скриншот Copilot $50 за 25 апреля (если сохранился)
- [ ] Скриншот tree e2e/ (текущая структура)
- [ ] Инфографика NotebookLM (Before → After: 2 монолита → 23 модуля)
- [ ] Инфографика: реальные цифры (с графиком 1,200 vs 2,000)
- [ ] Написать Round 2 статьи (первая честная версия)
- [ ] Решить: CTA оставить или убрать

---

*Kit собран 2026-05-27 для статьи Phase 2. Всё в одном месте — режем лишнее после просмотра.*
