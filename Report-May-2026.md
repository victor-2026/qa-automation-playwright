# QA Automation Sandbox — Отчёт на 26.05.2026

**Проект:** Buzzhive QA Sandbox
**Бюджет:** $0 (бесплатные инструменты)

---

## Ключевые метрики

| Метрика | Апрель | Май | Изменение |
|---------|--------|-----|-----------|
| Всего тестов | 489 | **2000+** | **+4x** |
| API-файлов | 8 | **9** | +1 |
| UI-файлов | — | **14** | новый слой |
| API Coverage | 94% | **94%** | стабильно |
| PBT Coverage | 100% | **100%** | стабильно |
| Монолитов | 2 (4600+ строк) | **0** | удалены |
| Ci/Cd | Render smoke | **Render smoke + quality gates** | ✅ |

---

## Структура тестов (Май 2026)

```
e2e/
├── api/                 # 9 модульных API-файлов
│   ├── auth.spec.ts
│   ├── posts.spec.ts
│   ├── users.spec.ts
│   ├── admin.spec.ts
│   ├── conversations.spec.ts
│   ├── notifications.spec.ts
│   ├── health.spec.ts
│   ├── metamorphic.spec.ts
│   └── smoke-api.spec.ts
├── ui/                  # 14 модульных UI-файлов
│   ├── auth.spec.ts
│   ├── posts.spec.ts
│   ├── profile.spec.ts
│   ├── comments.spec.ts
│   ├── navigation.spec.ts
│   ├── messages.spec.ts
│   ├── notifications.spec.ts
│   ├── follows.spec.ts
│   ├── search.spec.ts
│   ├── moderator.spec.ts
│   ├── admin.spec.ts
│   ├── logout.spec.ts
│   ├── performance.spec.ts
│   └── ...
├── fixtures.ts          # Единый test.extend — используют ВСЕ файлы
├── smoke.spec.ts        # 28 smoke-тестов
├── sanity.spec.ts       # 12 sanity-тестов
├── pages/               # Page Objects (4 класса)
└── load/                # Load-тесты (k6-like)
```

**Монолиты удалены:**
- `buzzhive.spec.ts` (2349 строк) — разделён на 13 UI-файлов
- `api-expanded.spec.ts` (1559 строк) — дублировал `e2e/api/*`

---

## Изменения за Май

### 1. Очистка архитектуры
| Было | Стало |
|------|-------|
| 2 монолита (4600+ строк) | 0 монолитов |
| `api/*` импортили `@playwright/test` | Все файлы импортят `../fixtures` |
| `fixtures.ts` работал вхолостую | Используется всеми spec-файлами |
| `tokens.ts` с мёртвым импортом | Очищен |

### 2. GitHub Pages
- Переход на Jekyll: все `.md` ссылки работают без расширения
- Добавлен `actions/jekyll-build-pages@v1` в CI
- Ветка `health-improvements` → `main` (мерж и удаление)

### 3. CI/CD
- `trace: 'on-first-retry'` в `playwright.config.ts`
- Quality gates: lint + typecheck + audit
- Render smoke: 12 API-тестов

### 4. Cline-эксперименты
- OpenRouter free → Groq → OpenRouter (все нестабильны для >2000 строк)
- Решение: сложный рефакторинг делать вручную, Cline — только для мелких задач

---

## Известные проблемы

| Проблема | Статус |
|----------|--------|
| Refresh token race condition (4 workers) | 🔴 Не исправлено |
| Backend 500 errors на Render | 🔴 Не исправлено |
| Нет pre-cleanup `refresh_tokens` | 🔴 Не исправлено |
| Нет Docker CI (full suite) | 🔴 Не исправлено |
| Нет Page Objects для Profile/Admin/Search | 🔴 Не исправлено |
| Нет API Client слоя | 🔴 Не исправлено |

---

## Стек технологий

Playwright (E2E + API), Jest + fast-check (PBT), Cucumber (Gherkin), GitHub Actions (CI/CD)

### AI модели (бесплатно)
- Groq Llama 3.3 70B — 500 tok/s
- Ollama qwen2.5:3b — локально, 1.9 GB

### Не сработало
- Google Gemini — quota exceeded
- Cline (OpenRouter free, Groq free) — нестабильны для рефакторинга >2000 строк

---

## Все страницы

- [Главная](.) — портал со ссылками
- [Отчёт за Апрель 2026](Report-April-2026) — результаты апреля
- [Presentation for Management](PRESENTATION_FOR_MANAGEMENT)
- [Presentation PART 2](PRESENTATION_PART2)
- [Test Report](TEST_REPORT)
- [AI-Ready DOR](AI_READY_DOR)
- [API Contract](API_CONTRACT)
- [BUGS](BUGS)

---

*Сгенерировано 2026-05-26*
