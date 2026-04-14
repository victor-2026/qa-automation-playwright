# Anti-Flaky Testing Guide - Buzzhive

## Основная проблема

Главная причина «флакающих» (нестабильных) автотестов — это попытка привязать проверку к времени, а не к состоянию.

---

## Антипаттерны (убивают стабильность)

### 1. `waitForTimeout(ms)` или `sleep()`

**Проблема:** Если поставили 2 секунды, а бэкенд на CI ответил за 2.1 — тест упал. Если ответил за 0.1 — впустую ждём 1.9 секунды.

### 2. Ожидание селектора без проверки состояния

**Проблема:** Методы вроде `page.evaluate()` или `locator.count()` возвращают мгновенный снимок страницы.

### 3. Длинные XPath или динамические ID

**Проблема:** Селекторы зависят от структуры верстки и ломаются при обновлении фронтенда.

---

## Лучшие практики (что использовать)

### 1. Web-First Assertions

```typescript
// ❌ Плохо
const isVisible = await page.isVisible('.btn');

// ✅ Хорошо
await expect(page.locator('.btn')).toBeVisible();
```

### 2. Auto-waiting

Методы `click()`, `fill()`, `check()` сами делают Actionability Checks.

```typescript
// ❌ Не нужно
await page.waitForSelector('#submit-btn');
await page.click('#submit-btn');

// ✅ Достаточно
await page.click('#submit-btn');
```

### 3. Ожидание сетевых событий

```typescript
// ❌ Не нужно
page.click('#submit-btn');
await page.waitForTimeout(2000);

// ✅ Хорошо
const [response] = await Promise.all([
  page.waitForResponse(res => res.url().includes('/api/posts') && res.status() === 200),
  page.click('#submit-btn'),
]);
```

### 4. Ожидание скрытия лоадеров

```typescript
// ❌ Не нужно
await page.click('#submit');
await page.waitForTimeout(1000);

// ✅ Хорошо
await page.click('#submit');
await expect(page.locator('.spinner')).toBeHidden();
```

### 5. Ожидание URL

```typescript
// ❌ Не нужно
await page.click('#login-btn');
await page.waitForTimeout(2000);
if (page.url().includes('feed')) { ... }

// ✅ Хорошо
await page.click('#login-btn');
await page.waitForURL('**/feed');
```

---

## Конфигурация Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  retries: 2, // Для CI
  reporter: [['html'], ['list']],
});
```

---

## Trace-отчёты для диагностики

```bash
# Запуск с tracing
npx playwright test --trace on

# Просмотр trace
npx playwright show-trace trace.zip
```

---

## Чеклист перед коммитом

- [ ] Удалены все `waitForTimeout()`
- [ ] Используются `expect().toBeVisible()` вместо `isVisible()`
- [ ] Используются `data-testid` вместо CSS/XPath
- [ ] Ожидание через `waitForResponse()` для API вызовов
- [ ] Ожидание через `waitForURL()` для навигации
- [ ] Настроены retries в CI
