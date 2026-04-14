# Anti-Flaky Review Report

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

### 🟢 Хорошо: waitForURL (51 шт)

Использование `waitForURL` для проверки навигации — это правильный подход.

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

### 3. Добавить waitForResponse для API

**Было:**
```typescript
await page.click('[data-testid="post-composer-submit"]');
await page.waitForTimeout(1000);
```

**Стало:**
```typescript
await Promise.all([
  page.waitForResponse(res => res.url().includes('/api/posts') && res.status() === 201),
  page.click('[data-testid="post-composer-submit"]'),
]);
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

## Приоритеты исправления

| Приоритет | Что | Сколько | Время |
|-----------|-----|---------|-------|
| P1 | waitForTimeout → expect | 40 | 30 мин |
| P2 | isVisible → expect | 7 | 5 мин |
| P3 | Добавить waitForResponse | 5-10 | 15 мин |

---

## Следующие шаги

1. Исправить все 40 `waitForTimeout` на `expect`
2. Заменить 7 `isVisible()` на `expect().toBeVisible()`
3. Добавить `waitForResponse` для критичных API операций
4. Запустить тесты 3 раза подряд для проверки стабильности
5. Настроить trace-отчёты в CI
