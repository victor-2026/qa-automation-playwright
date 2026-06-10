# Mutation Testing Plan — Buzzhive

Based on: `ai-qa-wiki/wiki/Mutation-testing-without-code.md`, `ai-qa-wiki/wiki/Mutation-testing-advanced-playwright.md`

## Overview

У нас нет исходного кода бэкенда для Stryker. Вместо этого — 4 подхода мутации без кода.

**Источники:**
- [Mutation-testing-without-code](../../../ai-qa-wiki/wiki/Mutation-testing-without-code.md)
- [Mutation-testing-advanced-playwright](../../../ai-qa-wiki/wiki/Mutation-testing-advanced-playwright.md)

---

## 1. API Response Mutation (Playwright `page.route()`)

**Идея:** Перехватывать ответы бэкенда в UI-тестах и мутировать их "на лету".

**Файлы:** `e2e/mutation/api-mutation.spec.ts`, `e2e/mutation/api-mutation-extended.spec.ts`

---

## 2. Chaos Engineering — Мутация среды

**Файл:** `e2e/mutation/chaos.spec.ts`

---

## 3. DB Data Mutation

**Файл:** `e2e/mutation/db-mutation.spec.ts`

---

## 4. UI Fuzzing

**Файл:** `e2e/mutation/ui-fuzz.spec.ts`

---

## Roadmap

| Этап | Что делаем | Файл | Тестов |
|------|------------|------|--------|
| 1. API Response Mutation (base) | `page.route()` для 5 эндпоинтов | `e2e/mutation/api-mutation.spec.ts` | 8 |
| 2. API Response Mutation (extended) | P0: feed, register, post/{id}, comments, like | `e2e/mutation/api-mutation-extended.spec.ts` | 7 |
| 3. HOM (Higher Order Mutations) | Комбинированные мутации | `e2e/mutation/api-mutation-extended.spec.ts` | 2 ✅ |
| 4. DB Data Mutation | `pg` + UPDATE/DELETE mid-test | `e2e/mutation/db-mutation.spec.ts` | 8 ✅ |
| 5. Chaos Engineering | Docker stop + reload | `e2e/mutation/chaos.spec.ts` | 3 ✅ |
| 6. UI Fuzzing | Спецсимволы, XSS, граничные значения | `e2e/mutation/ui-fuzz.spec.ts` | 10 ✅ |
| 7. API Response Mutation (P1) | notifications, search, follows, admin | `e2e/mutation/api-mutation-extended.spec.ts` | 6 ✅ |
| 8. DB Data Mutation (extended) | follows, notifications, comments, roles | `e2e/mutation/db-mutation.spec.ts` | 8 ✅ |
| 9. Chaos Extended | network delay, pool exhaustion | `e2e/mutation/chaos.spec.ts` | 2 ✅ |
| 10. UI Fuzzing Extended | file upload, profile, back/forward | `e2e/mutation/ui-fuzz.spec.ts` | 3 ✅ |

**Total:** 49 mutation tests (8 API base + 9 API ext + 6 API P1 + 8 DB + 5 chaos + 13 fuzz).

---

## Results

### Stage 1 — API Response Mutation (base) ✅ 8/8 pass

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

### Stage 2 — DB Data Mutation ⚠️ 2 bugs found

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

### Stage 3 — Chaos Engineering ✅ 5/5 pass (manual)

| Тест | Мутация | Статус |
|------|---------|--------|
| CHAOS-001 | `docker compose stop db` | ✅ |
| CHAOS-002 | `docker compose stop backend` | ✅ |
| CHAOS-003 | `docker compose restart backend` | ✅ |
| CHAOS-004 | Backend paused → loading | ✅ |
| CHAOS-005 | DB pool exhausted → error | ✅ |

**Команда:** `DOCKER_CHAOS=1 npx playwright test e2e/mutation/chaos.spec.ts --project=chromium`

**Важно:** Chaos тесты запускаются только через `DOCKER_CHAOS=1` — иначе `test.skip`.

---

### Stage 4 — UI Fuzzing ✅ 13/13 pass

| Тест | Сценарий | Статус |
|------|----------|--------|
| FUZZ-001 | Пустые поля login | ✅ |
| FUZZ-002 | Длинный email (65–500 chars) | ✅ |
| FUZZ-003 | SQL injection в email | ✅ |
| FUZZ-004 | Double-click login | ✅ |
| FUZZ-005 | Длинный post content (2000–10000) | ✅ |
| FUZZ-006 | Unicode/CJK/RTL/emozi в post | ✅ |
| FUZZ-007 | XSS в search | ✅ |
| FUZZ-008 | Длинный search query (1000–10000) | ✅ |
| FUZZ-009 | Register с существующим email | ✅ |
| FUZZ-010 | Короткий password (1–5 chars) | ✅ |
| FUZZ-011 | Avatar upload non-image | ✅ |
| FUZZ-012 | Profile bio XSS | ✅ |
| FUZZ-013 | Browser back/forward | ✅ |

---

### Summary

| Категория | Всего | Pass | Fail | Bugs Found |
|-----------|-------|------|------|------------|
| API Response Mutation (base) | 8 | 8 | 0 | 0 |
| API Response Mutation (extended) | 9 | 9 | 0 | 0 |
| API Response Mutation (P1) | 6 | 6 | 0 | 0 |
| DB Data Mutation | 8 | 6 | 2 | 2 (BUG-005, BUG-006) |
| Chaos Engineering | 5 | 5 | 0 | 0 |
| UI Fuzzing | 13 | 13 | 0 | 0 |
| **Total** | **49** | **47** | **2** | **2** |

---

## Расширенный план (Phase 2)

### P0 — API Response Mutation (extended)

| ID | Тест | Эндпоинт | Мутация | Ожидание |
|----|------|----------|---------|----------|
| MUT-009 | Feed пустой | `GET /api/posts/feed` | `items` → `[]` | UI показывает empty state |
| MUT-010 | Register ошибка | `POST /api/auth/register` | статус 409 → 500 | UI показывает error |
| MUT-011 | Пост не найден | `GET /api/posts/{id}` | пост → null | 404 или empty state |
| MUT-012 | Комментарии пусты | `GET /api/posts/{id}/comments` | `items` → `[]` | "no comments" state |
| MUT-013 | Like ошибка | `POST /api/posts/{id}/like` | статус 201 → 500 | UI показывает ошибку |
| MUT-014 | Follow ошибка | `POST /api/users/{username}/follow` | статус 201 → 500 | UI показывает ошибку |
| MUT-015 | Search пуст | `GET /api/search` | `items` → `[]` | "no results" state |

### HOM — Higher Order Mutations

| ID | Тест | Комбинация | Ожидание |
|----|------|-----------|----------|
| HOM-001 | Feed пустой + likes=0 | `feed.items=[]` + `posts.items[].likes_count=0` | Feed пуст, likes=0 |
| HOM-002 | Login 500 + Feed пустой | `auth/login` 500 + `posts/feed` empty | UI показывает обе ошибки |

### P1 — ✅ Done

| ID | Тест | Статус |
|----|------|--------|
| MUT-016 | Notifications пусты | ✅ |
| MUT-017 | Unread count zeroed | ✅ |
| MUT-018 | Bookmarks пусты | ✅ |
| MUT-019 | Conversations пусты | ✅ |
| MUT-020 | Admin stats с NaN | ✅ |
| MUT-021 | Profile update error | ✅ |

### DB Mutation Extended — ✅ Done

| ID | Тест | Статус |
|----|------|--------|
| DBMUT-005 | Follows wiped | ✅ |
| DBMUT-006 | Display name XSS | ✅ |
| DBMUT-007 | Role → banned | ✅ |
| DBMUT-008 | Notifications flood (50) | ✅ |

### Chaos Extended — ✅ Done

| ID | Тест | Статус |
|----|------|--------|
| CHAOS-004 | Backend paused → loading | ✅ |
| CHAOS-005 | DB exhausted → error | ✅ |

### UI Fuzzing Extended — ✅ Done

| ID | Тест | Статус |
|----|------|--------|
| FUZZ-011 | Avatar upload non-image | ✅ |
| FUZZ-012 | Profile bio XSS | ✅ |
| FUZZ-013 | Browser back/forward | ✅ |

---

## Риски

| Риск | Описание | Митигация |
|------|----------|-----------|
| DB mutation ломает другие тесты | Изменение глобального состояния | Использовать транзакции + ROLLBACK |
| Docker chaos требует прав | `docker-compose stop` нужен сокет | `BeforeAll` + `AfterAll` с cleanup |
| `page.route()` замедляет тесты | Перехват всех запросов | Фильтр по конкретному URL |
| `API_BASE` из credentials.ts по умолчанию Render | Локальные тесты шли на Render | Использовать `http://localhost:8000/api` напрямую |
| `page.request` не наследует localStorage | Auth token не передаётся | Явно передавать `Authorization: Bearer` |
| Mutation Score Fallacy | `toBeVisible()` "убивает" мутантов без проверки | Использовать `toHaveText`, `toHaveURL`, `toCount` |
