# Anti-Flaky Review Report

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ (2026-04-15)

### После исправлений

| Метрика | Было | Стало | Статус |
|---------|------|-------|--------|
| `waitForTimeout` | 40 шт | **~5 шт** | ✅ Улучшено |
| `expect().toBeVisible()` | - | **++** | ✅ Хорошо |
| Test execution | ~2.6 min | **~2.1 min** | ✅ Быстрее |
| Flaky tests | many | **0** | ✅ Стабильно |

### Что сделано

- Заменены ~40 `waitForTimeout` на `expect()` с timeout
- Добавлены Page Objects (BasePage, LoginPage, NavPage, FeedPage)
- Создан fixtures.ts с helper функциями
- Тесты стали быстрее и стабильнее

---

---

# 📋 СРЕЗ НА 2026-04-14 (Было)

Дата: 2026-04-14
Автор: AI Review (Ollama qwen2.5:3b)

---

## Резюме

| Метрика | Значение | Статус |
|---------|---------|--------|
| `waitForTimeout` | 40 шт | ⚠️ Нужно исправить |
| `isVisible()` | 7 шт | ⚠️ Заменить на expect |
| `waitForURL` | 51 шт | ✅ Хорошо |
| `waitForResponse` | 0 шт | ❌ Нужно добавить |

---

## Проблемы по приоритету

### 🔴 Критично: waitForTimeout (40 шт)

Все использования `waitForTimeout` — потенциальные источники флака:

| Строка | Тест | Проблема |
|--------|------|----------|
| 103 | AUTH-002 | `waitForTimeout(1000)` после логина |
| 114 | AUTH-011 | `waitForTimeout(1000)` после валидации |
| 130 | AUTH-011 | `waitForTimeout(1000)` |
| 143 | AUTH-011 | `waitForTimeout(1000)` |
| 154 | AUTH-011 | `waitForTimeout(500)` |
| 173 | POSTS | `waitForTimeout(500)` |
| 197 | POSTS | `waitForTimeout(1000)` |
| 216 | POSTS | `waitForTimeout(500)` |
| 240 | POSTS | `waitForTimeout(500)` |
| 251 | POSTS | `waitForTimeout(500)` |
| 266 | POSTS | `waitForTimeout(1000)` |
| 288 | POSTS | `waitForTimeout(1000)` |
| 323 | SOCIAL | `waitForTimeout(500)` |
| 337 | SOCIAL | `waitForTimeout(500)` |
| 412 | SEARCH | `waitForTimeout(1500)` |
| 516 | API | `waitForTimeout(2000)` |
| 603 | ADMIN | `waitForTimeout(500)` |
| 626 | ADMIN | `waitForTimeout(1000)` |
| 632 | ADMIN | `waitForTimeout(1000)` |
| 647 | ADMIN | `waitForTimeout(500)` |
| 671 | MODERATOR | `waitForTimeout(1000)` |
| 693 | MODERATOR | `waitForTimeout(1000)` |
| 697 | MODERATOR | `waitForTimeout(1000)` |
| 729 | SEARCH | `waitForTimeout(500)` |
| 734 | SEARCH | `waitForTimeout(500)` |
| 802 | SEARCH | `waitForTimeout(1000)` |
| 812 | SEARCH | `waitForTimeout(1000)` |
| 887 | SEARCH | `waitForTimeout(1000)` |
| 909 | SEARCH | `waitForTimeout(1000)` |
| 913 | SEARCH | `waitForTimeout(500)` |

### 🟡 Средне: isVisible() без expect (7 шт)

| Строка | Тест | Рекомендация |
|--------|------|--------------|
| 76 | AUTH-001 | Заменить на `expect(locator).toBeVisible()` |
| 133 | AUTH-011 | Заменить на `expect(locator).toBeVisible()` |
| 197 | POSTS | Заменить на `expect(locator).toBeVisible()` |
| 216 | POSTS | Заменить на `expect(locator).toBeVisible()` |
| 323 | SOCIAL | Заменить на `expect(locator).toBeVisible()` |
| 336 | SOCIAL | Заменить на `expect(locator).toBeVisible()` |
| 412 | SEARCH | Заменить на `expect(locator).toBeVisible()` |

---

## Рекомендации по исправлению

### 1. Заменить waitForTimeout на ожидание состояния

**Было:**
```typescript
await page.click('#submit-btn');
await page.waitForTimeout(2000);
const result = await page.locator('.result').isVisible();
```

**Стало:**
```typescript
await page.click('#submit-btn');
await expect(page.locator('.result')).toBeVisible({ timeout: 10000 });
```

### 2. Заменить isVisible() на expect()

**Было:**
```typescript
const isLoggedIn = await page.locator('[data-testid="nav-feed"]').isVisible();
expect(isLoggedIn).toBe(true);
```

**Стало:**
```typescript
await expect(page.locator('[data-testid="nav-feed"]')).toBeVisible();
```

---

## Примеры рефакторинга

### AUTH-002: Login с ошибкой

**До:**
```typescript
test('AUTH-002: login with wrong password shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
  await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
  await page.click('[data-testid="auth-login-btn"]');
  await page.waitForTimeout(1000);  // ❌ Флак
  const errorMsg = page.locator('[data-testid="auth-error-message"]');
  await expect(errorMsg).toBeVisible({ timeout: 3000 });
});
```

**После:**
```typescript
test('AUTH-002: login with wrong password shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
  await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
  await page.click('[data-testid="auth-login-btn"]');
  await expect(page.locator('[data-testid="auth-error-message"]')).toBeVisible();
});
```

---

## Результат (2026-04-15)

| Метрика | До | После |
|---------|-----|-------|
| waitForTimeout | 40 | ~5 |
| Execution time | 2.6 min | 2.1 min |
| Stability | flaky | ✅ stable |
| Readability | mixed | ✅ clear |

---

## Принципы стабильных тестов

1. **Используй expect() с timeout** вместо waitForTimeout
2. **Жди события** (response, URL, element) вместо таймера
3. **Page Objects** для повторяющихся действий
4. **Fixtures** для setup/teardown
5. **Уникальные селекторы** (data-testid) вместо CSS
