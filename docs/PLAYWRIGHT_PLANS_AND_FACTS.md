# Playwright Plans and Facts

## Что уже есть

### Конфигурация (`playwright.config.ts`)

- 4 проекта: Chromium, Mobile Safari (iPhone 15 Pro), Mobile Safari Plus (iPhone 15 Pro Max), Mobile Chrome (Pixel 5)
- `retries: 2`, `workers: 4`, `timeout: 60000`
- Репортеры: HTML + JUnit
- Скриншоты только при падении, видео при падении
- Headless mode

### Структура тестов (`e2e/`)

```
                e2e/
├── api/                    # Модульные API тесты (9 файлов)
│   ├── auth.spec.ts        # 25 тестов (AUTH-API-001..025)
│   ├── posts.spec.ts       # 30 тестов (POST-API-001..030)
│   ├── users.spec.ts       # 25 тестов (USER-API-001..025)
│   ├── admin.spec.ts       # ~18 тестов (ADMIN-API-001..026)
│   ├── conversations.spec.ts # 16 тестов (MSG-API-001..016)
│   ├── notifications.spec.ts # 16 тестов (NOTIF-API-001..016)
│   ├── health.spec.ts      # 32 теста (HEALTH-API-001..008, expanded)
│   ├── metamorphic.spec.ts # 7 тестов (MET-001..007)
│   ├── smoke-api.spec.ts   # 12 тестов (Render CI)
│   ├── helpers.ts          # expectStatus, expectStatusAtLeast
│   └── metamorphic-helpers.ts
├── ui/                     # Модульные UI тесты (14 файлов, ~1000+ тестов)
│   ├── auth.spec.ts        # 26 тестов (AUTH-001..026)
│   ├── posts.spec.ts       # Посты
│   ├── profile.spec.ts     # Профиль
│   ├── comments.spec.ts    # Комментарии
│   ├── navigation.spec.ts  # Навигация
│   ├── messages.spec.ts    # Сообщения
│   ├── notifications.spec.ts # Уведомления
│   ├── follows.spec.ts     # Подписки
│   ├── search.spec.ts      # Поиск
│   ├── moderator.spec.ts   # Модератор
│   ├── admin.spec.ts       # Админ
│   ├── logout.spec.ts      # Выход
│   ├── performance.spec.ts # Производительность
│   └── ...
├── pages/                  # Page Objects (4 файла)
│   ├── BasePage.ts         # goto, waitForSelector, isVisible
│   ├── LoginPage.ts        # login(email, password), getErrorText, isErrorVisible
│   ├── FeedPage.ts         # createPost(content), getFirstPostContent
│   ├── NavPage.ts          # isLoggedIn, logout, notificationsBadge
│   └── index.ts
├── fixtures/               # Фикстуры
│   ├── tokens.ts           # getToken, getAliceToken, getAdminToken, etc.
│   └── ...
├── setup/
│   ├── credentials.ts      # API_BASE, TEST_ACCOUNTS (env or defaults)
│   └── auth_helpers.ts     # ensureLogin — login helper с retry
├── teardown/
│   └── cleanup.ts          # cleanupTestData — admin-driven чистка
├── utils/
│   └── auth_retry.ts       # loginWithRetry (retry + backoff)
├── fixtures.ts             # Центральный test.extend (page objects + tokens) — ВСЕ файлы его используют
├── smoke.spec.ts           # 28 smoke тестов
├── sanity.spec.ts          # 12 sanity тестов
├── mobile.spec.ts          # 3 mobile-теста (gestures)
├── visual.spec.ts          # 3 visual regression теста
├── load/                   # Load/стресс тесты (4 файла)
└── mas-*.spec.ts           # 3 MAS-сгенерированных теста

**Всего: ~2000+ тестов. Монолиты удалены — `buzzhive.spec.ts` и `api-expanded.spec.ts` заменены на модульные файлы.**

### Архитектура

```
@playwright/test
│
├─ config: playwright.config.ts
│   ├─ projects: chromium, Mobile Safari, Mobile Safari Plus, Mobile Chrome
│   ├─ retries: 2, workers: 4, trace: 'on-first-retry'
│   ├─ reporters: html + junit
│   └─ use: baseURL, headless, screenshots, video
│
├─ fixtures.ts          ← test.extend({ loginPage, feedPage, navPage, aliceToken, ... })
│   └─ pages/           ← Page Object Model (BasePage → LoginPage, FeedPage, NavPage)
│
├─ setup/credentials.ts ← env → API_BASE, TEST_ACCOUNTS
├─ fixtures/tokens.ts   ← getToken() with retry
├─ utils/auth_retry.ts  ← loginWithRetry() with backoff
├─ teardown/cleanup.ts  ← cleanupTestData() (admin-driven)
│
├─ api/*.spec.ts        ← request fixture, token in beforeAll, flexible status
│                        ← import { test, expect } from '../fixtures' ✅
├─ ui/*.spec.ts         ← page fixture, beforeEach/afterEach hooks
│                        ← import { test, expect } from '../fixtures' ✅
├─ smoke.spec.ts        ← UI + API smoke
├─ visual.spec.ts       ← toHaveScreenshot()
├─ mobile.spec.ts       ← touch gestures
└─ load/*               ← load/stress/network fail
```

### Фикстуры (`fixtures.ts`)

Центральный `test.extend` предоставляет:

```
- loginPage       → LoginPage(page)         — страница логина
- feedPage        → FeedPage(page)          — страница ленты
- navPage         → NavPage(page)           — навигация
- aliceToken      → getAuthToken('alice')   — токен Алисы (lazy, 3 retry)
- adminToken      → getAuthToken('admin')   — токен админа (lazy, 3 retry)
- bobToken        → getAuthToken('bob')     — токен Боба (lazy, 3 retry)
```

Также экспортирует `expect`, `accounts`, `loginAs()`.

✅ Все spec-файлы (`api/*.spec.ts` и `ui/*.spec.ts`) используют `import { test, expect } from '../fixtures'`.

### Page Object Model

```
BasePage (abstract)
├── goto(path)
├── waitForSelector(selector)
└── isVisible(selector)

LoginPage extends BasePage
├── emailInput, passwordInput, loginButton, errorMessage
├── login(email, password)
├── getErrorText()
└── isErrorVisible()

FeedPage extends BasePage
├── postComposer, postSubmitButton, postList
├── createPost(content)
└── getFirstPostContent()

NavPage extends BasePage
├── feedLink, profileLink, logoutButton, notificationsBadge
├── isLoggedIn()
└── logout()
```

Локаторы через `data-testid`. 4 POM-класса на ~26 строк каждый.

### API Testing in Playwright

Используется `request` fixture (модульные тесты в `api/`):
```ts
import { test, expect } from '../fixtures';

test('AUTH-API-001: Login with valid credentials', async ({ request }) => {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email: 'alice@buzzhive.com', password: 'alice123' }
  });
  expect(res.status()).toBe(200);
});
```

**Покрытие API: 94% (49/52 endpoints).**

### Параллелизация

- `workers: 4` — 4 параллельных воркера
- `projects: 4` — Chromium + 3 mobile
- При запуске `npx playwright test` запускаются все 4 проекта параллельно (16 потоков на 4 workers)
- ⚠️ refresh token race condition: параллельные тесты создают дубликаты `refresh_tokens` в БД

**Режимы запуска:**
```bash
# Все проекты (4 workers x 4 projects = 16 потоков)
npx playwright test

# Один проект
npx playwright test --project=chromium

# Один worker (для стабильности)
npx playwright test --workers=1
```

### Retries

- `playwright.config.ts`: `retries: 2` (глобальные, 2 перезапуска на упавший тест)
- `fixtures/tokens.ts`: `getToken()` — 3 попытки с 1s delay
- `utils/auth_retry.ts`: `loginWithRetry()` — 2 retry + 1s backoff
- `setup/auth_helpers.ts`: `ensureLogin()` — 1 retry + 1s delay
- API тесты: гибкие статусы через `expectStatus(res, [200, 403, 404, 422, 500])`

Retry-стратегия: мягкие ассерты (flexible status codes) вместо retries в большинстве API-тестов.

### Trace Viewer

- Включён в `playwright.config.ts` (`trace: 'on-first-retry'`)
- При падении: скриншот + видео + трассировка (`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`)
- HTML-репорт: `npx playwright show-report` показывает скриншоты, видео и трассировку
- Trace можно включить вручную: `PWDEBUG=1 npx playwright test --project=chromium`

## Что можно сделать

### Приоритет (medium effort, high value)

| Задача | Описание |
|--------|----------|
| **cleanup перед тестом** | Очистка `refresh_tokens` в БД перед запуском для избегания race condition |
| **Докеризация CI** | Full suite в CI (сейчас только 12 smoke-тестов на Render) |
| **Стабилизация backend** | 500 ошибки на Render, нужен fallback или health check перед тестами |

### Средний приоритет

| Задача | Описание |
|--------|----------|
| **Page Objects расширение** | Добавить POM для ProfilePage, AdminPage, SearchPage |
| **API Client слой** | Аналог Python `api_client` — `apiClient.ts` с авто-токеном |
| **Sharding в CI** | `--shard=x/y` — разделение тестов на несколько CI-джоб |
| **Global setup** | `globalSetup` — очистка БД/регистрация перед всеми тестами |

### Низкий приоритет

| Задача | Описание |
|--------|----------|
| **performance.spec.ts** | Добавить `page.metrics()` и `performance.timing` |
| **Accessibility tests** | `@axe-core/playwright` — a11y проверки |
| **API contract tests** | Схемы ответов через Zod (аналог pydantic) |
| **Component tests** | `@playwright/experimental-ct` (если фронтенд на React/Vue) |

## Сравнение: Playwright vs Python (pytest)

| Концепция | Playwright (JS) | Python (pytest) |
|------------|-----------------|-----------------|
| Runner | `@playwright/test` | `pytest` |
| HTTP client | `request` fixture / `page.request` | `requests` / `httpx` |
| Credentials | `credentials.ts` → `TEST_ACCOUNTS` + env | `ACCOUNTS` dict |
| Fixtures | `test.extend()` / `beforeAll` | `@pytest.fixture` / `conftest.py` |
| Parametrization | Loops / `test.describe` | `@pytest.mark.parametrize` |
| Flexible status | `expect([200,403]).toContain(status)` | `assert status in [200, 403]` |
| Retries | config + `loginWithRetry` | — (нужно добавить) |
| Trace/Debug | Trace Viewer + HTML report | Allure |
| Visual testing | `toHaveScreenshot()` | `pytest-playwright` |
| CI | `playwright.yml` (GitHub Actions) | — (нужно добавить) |
| Тестов | ~2000+ | ~29 |
| Покрытие API | 94% (49/52 endpoints) | Minimal |
| Mobile | 3 projects (iOS Safari + Android Chrome) | Нет |
| Load tests | `load/` (4 файла, k6-like) | Нет |
| Reports | HTML + JUnit + скриншоты + видео | Терминал |

## Известные проблемы

1. **refresh token race condition** — 4 workers → duplicate key ошибка
2. **Playwright не читает `.env`** — переменные окружения нужно передавать явно
3. **Backend нестабилен** — 500 ошибки на Render, требуется `expectStatus` с fallback-статусами
4. **cleanup — только после тестов** — нет pre-cleanup
5. **Health.spec.ts: 12 skipped tests** — тесты падают на `page.request`, нужно переписать на `request`
