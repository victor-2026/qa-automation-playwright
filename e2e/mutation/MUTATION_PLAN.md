# Mutation Testing Plan — Buzzhive

Based on: `ai-qa-wiki/wiki/Mutation-testing-without-code.md`

## Overview

У нас нет исходного кода бэкенда для Stryker. Вместо этого — 3 подхода мутации без кода + 1 уже готовый.

---

## 1. API Response Mutation (Playwright `page.route()`)

**Идея:** Перехватывать ответы бэкенда в UI-тестах и мутировать их "на лету".

**Инструмент:** Playwright `page.route()` (уже есть в проекте)

**Где писать:** `e2e/mutation/` — новый каталог

**Сценарии:**

| Мутация | Эндпоинт | Что делаем | Ожидание |
|---------|----------|------------|----------|
| `price`/`likes_count` → 0 | `GET /posts` | Обнуляем числовое поле | Тест на отображение лайков падает |
| `email` → null | `GET /auth/me` | Удаляем обязательное поле | Тест профиля падает |
| статус 200 → 500 | `POST /posts` | Эмулируем падение бэкенда | UI-тест должен показать ошибку, не зависнуть |
| `items` → `[]` | `GET /posts` | Пустой массив вместо данных | UI должен показать "no posts" |
| `is_verified` → false | `GET /users/{username}` | Меняем булево поле | Галочка верификации пропадает |

**Пример** (из статьи, адаптированный под Buzzhive):
```typescript
test('MUT-001: Цена лайков обнулена', async ({ page }) => {
  await page.route('**/api/posts*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    if (json.items) json.items.forEach(p => p.likes_count = 0);
    await route.fulfill({ response, json });
  });
  await page.goto('/');
  await expect(page.locator('[data-testid="like-count"]').first()).toHaveText(/[1-9]/);
  // Тест ДОЛЖЕН упасть — лайки все 0
});
```

**Результат:** Если тест прошёл — UI не проверяет числовые значения, слепая зона. ✅

---

## 2. Chaos Engineering — Мутация среды

**Идея:** Мутируем не код, а инфраструктуру проекта.

**Инструмент:** Docker (docker-compose stop/start/pause)

**Где писать:** `e2e/mutation/chaos.spec.ts`

**Сценарии:**

| Мутация | Действие | Ожидание |
|---------|----------|----------|
| `db` остановлена | `docker-compose stop db` | API → 500, UI → error state |
| `backend` остановлен | `docker-compose stop backend` | Frontend → error page |
| Сеть с задержкой | `tc qdisc add dev eth0 delay 5000ms` | Тесты timeoutятся или проверяют loading |

**Пример:**
```typescript
test('CHAOS-001: DB down — UI показывает ошибку', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="posts-feed"]')).toBeVisible();

  execSync('docker-compose -f ../../docker-compose.yml stop db');

  await page.reload();
  await expect(page.locator('[data-testid="error-banner"]')).toBeVisible();

  execSync('docker-compose -f ../../docker-compose.yml start db');
});
```

**Результат:** Если UI показывает пустую страницу без сообщения об ошибке — слепая зона. ✅

---

## 3. DB Data Mutation

**Идея:** Меняем данные в PostgreSQL во время выполнения теста.

**Инструмент:** `psql` или `pg` npm-клиент (уже есть `jest + pg`)

**Где писать:** `e2e/mutation/db-mutation.spec.ts`

**Сценарии:**

| Мутация | SQL | Ожидание |
|---------|-----|----------|
| Статус пользователя → banned | `UPDATE users SET is_active=false WHERE email='alice@...'` | Alice не может залогиниться |
| Удаление поста | `DELETE FROM posts WHERE id = ?` | GET /posts/{id} → 404 |
| XSS в content | `UPDATE posts SET content = '<script>...' WHERE id = ?` | UI экранирует HTML |

**Пример:**
```typescript
test('DBMUT-001: Пользователь забанен во время сессии', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
  await page.fill('[data-testid="auth-password-input"]', 'alice123');
  await page.click('[data-testid="auth-login-btn"]');
  await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();

  // Мутируем БД
  await db.query(`UPDATE users SET is_active=false WHERE email='alice@buzzhive.com'`);

  await page.reload();
  // UI должен показать ошибку или разлогинить
  await expect(page.locator('[data-testid="auth-login-btn"]')).toBeVisible();
});
```

**Результат:** Если UI продолжает показывать профиль забаненного юзера — не проверяет статус. ✅

---

## 4. Fuzzing (уже есть)

Из статьи: «Фаззинг-тестирование — подача хаотичных данных».

**Уже реализовано:**

| Где | Что |
|-----|-----|
| `csharp-backend/FuzzerTests.cs` | 19 fuzz-тестов (пустые/SQLi/unicode payloads) |
| `csharp-backend/RaceTests.cs` | 4 race-теста (конкурентные запросы) |

**Что можно добавить:**
- Fuzzing на уровне Playwright UI: ввод спецсимволов в поля, отправка форм с мусором
- Тип: `e2e/mutation/ui-fuzz.spec.ts`

---

## Roadmap

| Этап | Что делаем | Файл | Тестов |
|------|------------|------|--------|
| 1. API Response Mutation | `page.route()` для 5 эндпоинтов | `e2e/mutation/api-mutation.spec.ts` | 8 |
| 2. DB Data Mutation | `pg` + UPDATE/DELETE mid-test | `e2e/mutation/db-mutation.spec.ts` | 4 |
| 3. Chaos Engineering | Docker stop + reload | `e2e/mutation/chaos.spec.ts` | 3 |
| 4. UI Fuzzing (если нужно) | Спецсимволы, XSS в UI-поля | `e2e/mutation/ui-fuzz.spec.ts` | 5 |

**Total planned:** ~20 mutation tests.

---

## Results (2026-05-28)

### 1. API Response Mutation — ✅ 8/8 pass

| Тест | Мутация | Статус | Примечание |
|------|---------|--------|------------|
| MUT-001 | `likes_count` → 0 | ✅ | Обнуление работает, тест видит `0` |
| MUT-002 | `author.username` → null | ✅ | Ссылка на автора пропадает |
| MUT-003 | Login → 500 | ✅ | UI показывает `auth-error-message` с текстом ошибки |
| MUT-004 | `items` → `[]` | ✅ | Пост-карточки не видны |
| MUT-005 | `is_verified` → false | ✅ | Badge верификации пропадает |
| MUT-006 | `avatar_url` → null | ✅ | `<img>` не рендерится, показывается буква |
| MUT-007 | `/auth/me` → 401 | ✅ | После релога — редирект на `/login` |
| MUT-008 | XSS в `content` | ✅ | `<img>` не рендерится как HTML |

**Ключевое открытие:** `route.fulfill({ response, json })` ломает кодировку (gzip mismatch). Нужно `route.fulfill({ json })` без `response`.

**Слепые зоны:** UI корректно обрабатывает null-поля, пустые массивы, 500/401 ошибки — **мутации не нашли проблем**.

---

### 2. DB Data Mutation — ⚠️ 2 bugs found

| Тест | Мутация | Статус | Находка |
|------|---------|--------|---------|
| DBMUT-001 | `is_active=false` | ✅ | Редирект на `/login` при деактивации |
| DBMUT-002 | `DELETE FROM posts` | ✅ | PostDetailPage показывает "not found" |
| DBMUT-003 | XSS в content | ❌ FAIL | **BUG-005**: HTML не экранируется (Critical) |
| DBMUT-004 | `likes_count=-5` | ❌ FAIL | **BUG-006**: `-5` отображается как есть (Low) |

**Найденные баги:**
- **BUG-005 (Critical)**: Post content рендерит HTML как есть — XSS уязвимость
- **BUG-006 (Low)**: Отрицательный `likes_count` не обрабатывается (`Math.max(0, n)`)

**Ключевые открытия:**
- `tid()` функция обрезает UUID до последних 12 hex-символов — data-testid нужно вычислять
- `page.request` не наследует auth из браузера — нужно явно передавать `Authorization: Bearer`
- `API_BASE` из credentials.ts указывает на Render — для локальных тестов нужен `http://localhost:8000/api`

---

### 3. Chaos Engineering — ✅ 3/3 pass (manual)

| Тест | Мутация | Статус |
|------|---------|--------|
| CHAOS-001 | `docker compose stop db` | ✅ |
| CHAOS-002 | `docker compose stop backend` | ✅ |
| CHAOS-003 | `docker compose restart backend` | ✅ |

**Команда:** `DOCKER_CHAOS=1 npx playwright test e2e/mutation/chaos.spec.ts --project=chromium`

**Важно:** Chaos тесты запускаются только через `DOCKER_CHAOS=1` — иначе `test.skip`.

---

### Summary

| Категория | Всего | Pass | Fail | Bugs Found |
|-----------|-------|------|------|------------|
| API Response Mutation | 8 | 8 | 0 | 0 |
| DB Data Mutation | 4 | 2 | 2 | 2 (BUG-005, BUG-006) |
| Chaos Engineering | 3 | 3 | 0 | 0 |
| **Total** | **15** | **13** | **2** | **2** |

---

## Риски

| Риск | Описание | Митигация |
|------|----------|-----------|
| DB mutation ломает другие тесты | Изменение глобального состояния | Использовать транзакции + ROLLBACK |
| Docker chaos требует прав | `docker-compose stop` нужен сокет | `BeforeAll` + `AfterAll` с cleanup |
| `page.route()` замедляет тесты | Перехват всех запросов | Фильтр по конкретному URL |
| `API_BASE` из credentials.ts по умолчанию Render | Локальные тесты шли на Render | Использовать `http://localhost:8000/api` напрямую |
| `page.request` не наследует localStorage | Auth token не передаётся | Явно передавать `Authorization: Bearer` |
