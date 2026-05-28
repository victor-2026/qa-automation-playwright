# Mutation Testing Architecture — Buzzhive

## Overview

Три подхода мутационного тестирования без доступа к исходному коду бэкенда. В отличие от Stryker (мутирует код), мы мутируем **ответы API**, **данные в БД** и **инфраструктуру**.

## Directory Structure

```
e2e/mutation/
  api-mutation.spec.ts    — Stage 1: API Response Mutation (8 тестов)
  db-mutation.spec.ts     — Stage 2: DB Data Mutation (4 теста)
  chaos.spec.ts           — Stage 3: Chaos Engineering (3 теста)
  MUTATION_PLAN.md        — План + результаты
  TEST_ARCHITECTURE.md    — ← этот файл
```

## Stage 1 — API Response Mutation

**Файл:** `e2e/mutation/api-mutation.spec.ts`

**Подход:** Перехватываем HTTP-ответы бэкенда в браузере через `page.route()` и мутируем JSON на лету.

**Ключевой паттерн:**
```typescript
await page.route('**/api/*', async route => {
  const response = await route.fetch();
  const json = await response.json();
  // мутация
  json.someField = mutatedValue;
  await route.fulfill({ json }); // БЕЗ response — gzip mismatch
});
```

**Важно:** `route.fulfill({ response, json })` ломает gzip-кодировку. Используем `route.fulfill({ json })` без `response`.

**Паттерн URL:** Путь `**/api/*` (браузерные URL, а не прямые бэкенд-запросы).

### Traceability Matrix

| Тест | Эндпоинт | Мутация | Проверка |
|------|----------|---------|----------|
| MUT-001 | `GET /api/posts` | `likes_count` → 0 | Текст лайков показывает 0 |
| MUT-002 | `GET /api/posts` | `author.username` → null | Ссылка на автора отсутствует |
| MUT-003 | `POST /api/auth/login` | статус → 500 | UI показывает `auth-error-message` |
| MUT-004 | `GET /api/feed` | возвращаем `[]` | Пустой фид, `feed-empty-state` виден |
| MUT-005 | `GET /api/users/*` | `is_verified` → false | Badge верификации скрыт |
| MUT-006 | `GET /api/users/*` | `avatar_url` → null | `<img>` не рендерится (буква вместо аватара) |
| MUT-007 | `GET /api/auth/me` | статус → 401 | Редирект на `/login` |
| MUT-008 | `GET /api/posts` | `content` → `<img src=x onerror=alert(1)>` | HTML не рендерится (экранирован) |

**Результат:** 8/8 pass. Слепых зон не найдено — UI корректно обрабатывает null, пустые массивы и ошибки.

---

## Stage 2 — DB Data Mutation

**Файл:** `e2e/mutation/db-mutation.spec.ts`

**Подход:** Меняем данные напрямую в PostgreSQL через `pg`-клиент прямо во время выполнения UI-теста.

**Ключевой паттерн:**
```typescript
const pool = new Pool({ connectionString: LOCAL_PG_URL });

test.beforeEach(async () => {
  // Backup affected rows
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
  backup = rows[0];
});

test.afterEach(async () => {
  // Restore original state
  await pool.query('UPDATE posts SET ... WHERE id = $1', [backup, postId]);
});
```

**Важно:**
- `tid()` обрезает UUID до последних 12 hex-символов — data-testid нужно вычислять так же
- `page.request` не наследует auth из браузера — нужен явный `Authorization: Bearer`
- `API_BASE` из credentials.ts = Render URL — для локальных тестов используем `http://localhost:8000/api`
- Token извлекается через `page.evaluate(() => localStorage.getItem('access_token'))`

### Traceability Matrix

| Тест | SQL-мутация | Ожидание | Статус |
|------|-------------|----------|--------|
| DBMUT-001 | `UPDATE users SET is_active=false` | Редирект на `/login` | ✅ |
| DBMUT-002 | `DELETE FROM posts WHERE id = $1` | "not found" на PostDetailPage | ✅ |
| DBMUT-003 | `UPDATE posts SET content = '<script>...'` | HTML экранирован | ❌ **BUG-005** |
| DBMUT-004 | `UPDATE posts SET likes_count = -5` | `0` или `Math.max(0, n)` | ❌ **BUG-006** |

### Bugs Found

| Bug | Severity | Описание | Локация |
|-----|----------|----------|---------|
| BUG-005 | Critical | Post content рендерит HTML как есть — XSS | `PostCard.tsx` (dangerouslySetInnerHTML?) |
| BUG-006 | Low | Отрицательный `likes_count` отображается как `-5` | `PostCard.tsx` (нет `Math.max(0, n)`) |

---

## Stage 3 — Chaos Engineering

**Файл:** `e2e/mutation/chaos.spec.ts`

**Подход:** Мутируем инфраструктуру через Docker (`compose stop/restart`).

**Ключевой паттерн:**
```typescript
import { execSync } from 'child_process';

const COMPOSE = 'docker compose -f ../../docker-compose.yml';

test.beforeAll(() => {
  if (!process.env.DOCKER_CHAOS) test.skip();
});

test('CHAOS-001: DB down', async ({ page, request }) => {
  execSync(`${COMPOSE} stop db`);
  const res = await request.get(`${API}/health`);
  expect(res.status()).toBe(503);
  execSync(`${COMPOSE} start db`);
});
```

**Guard:** `DOCKER_CHAOS=1` — без неё все тесты `skip()`.

### Traceability Matrix

| Тест | Мутация | Проверка | Статус |
|------|---------|----------|--------|
| CHAOS-001 | `docker compose stop db` | Backend health → 503 | ✅ |
| CHAOS-002 | `docker compose stop backend` | Frontend shows error (nginx 502) | ✅ |
| CHAOS-003 | `docker compose restart backend` | После restart — все работает | ✅ |

---

## Test Patterns

### 1. `page.route()` fulfillment
```typescript
// CORRECT — no `response` param
await route.fulfill({ json });

// WRONG — causes gzip encoding mismatch
await route.fulfill({ response, json });
```

### 2. Browser auth extraction
```typescript
const token = await page.evaluate(() => localStorage.getItem('access_token'));
```

### 3. DB mutation + restore
```typescript
let backup: any;

test.beforeEach(async () => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  backup = rows[0];
});

test.afterEach(async () => {
  await pool.query('UPDATE users SET is_active = $1 WHERE email = $2', [backup.is_active, email]);
});
```

### 4. Chaos guard
```typescript
if (!process.env.DOCKER_CHAOS) test.skip();
test.setTimeout(60000);
```

---

## Stage 4 — UI Fuzzing

**Файл:** `e2e/mutation/ui-fuzz.spec.ts`

**Подход:** Подаём на UI граничные/невалидные значения через формы и URL-параметры. Проверяем, что фронтенд не падает и корректно обрабатывает ошибки.

### Traceability Matrix

| Тест | Что делаем | Ожидание |
|------|-----------|----------|
| FUZZ-001 | Пустые поля логина | HTML5 validation срабатывает |
| FUZZ-002 | Очень длинный email при логине | 422 → сообщение об ошибке |
| FUZZ-003 | SQL инъекция в email | 401, не 500 |
| FUZZ-004 | Double-click на кнопке логина | ≤ 2 запроса |
| FUZZ-005 | Очень длинный контент поста (3000+) | 422 rejected |
| FUZZ-006 | Unicode/эмодзи/XSS в контенте поста | Отправляется без ошибок |
| FUZZ-007 | XSS в поисковом запросе | Не рендерится как HTML |
| FUZZ-008 | Очень длинный поисковый запрос (5000+) | Страница не падает |
| FUZZ-009 | Регистрация с существующим email | 409 Conflict показан |
| FUZZ-010 | Короткий пароль при регистрации | HTML5 validation блокирует |

---

## Running Guide

```bash
# Stage 1 — API Response Mutation (локально или на Render)
npx playwright test e2e/mutation/api-mutation.spec.ts --project=chromium

# Stage 2 — DB Data Mutation (только локально, нужен Docker PostgreSQL)
npx playwright test e2e/mutation/db-mutation.spec.ts --project=chromium

# Stage 3 — Chaos Engineering (только локально, нужен Docker Compose)
DOCKER_CHAOS=1 npx playwright test e2e/mutation/chaos.spec.ts --project=chromium

# Stage 4 — UI Fuzzing (локально или на Render)
npx playwright test e2e/mutation/ui-fuzz.spec.ts --project=chromium

# All mutation tests
npx playwright test e2e/mutation/ --project=chromium
```

---

## Key Discoveries

| Discovery | Impact |
|-----------|--------|
| `route.fulfill({ response, json })` → gzip mismatch | Используем `{ json }` без `response` |
| `page.route()` URL = `**/api/*` (browser-side) | Не `API_BASE/*` |
| `page.request` не наследует browser cookies/auth | Явный `Authorization: Bearer` |
| `tid()` = последние 12 hex символов UUID | Data-testid нужно вычислять |
| Docker chaos требует сокет /var/run/docker.sock | Не работает в GitHub Actions |
| Render cold start → 503 на первом запросе | `beforeAll` warm-up |

---

## Limitations

| Ограничение | Причина |
|-------------|---------|
| DB mutation только локально | Нет доступа к Render Postgres из CI |
| Chaos только локально | Нет Docker в GHA ubuntu runner |
| API mutation не тестирует бэкенд | Только фронтенд-обработку ответов |
| UI Fuzzing зависит от data-testid | Тесты ломаются при изменении UI |
| 25 тестов vs 100+ при Stryker | Без кода бэкенда — максимум возможного |
