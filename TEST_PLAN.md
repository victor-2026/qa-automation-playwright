# Тест-план — Buzzhive QA Sandbox

**Версия:** 1.0  
**Дата:** 2026-04-17  
**Автор:** QA Automation Sandbox  
**Статус:** Draft  

---

## 1. Введение (Introduction)

### 1.1 Цель документа

Определить стратегию, подходы, ресурсы и план тестирования для Buzzhive Social Network.

### 1.2 Scope (Область тестирования)

| Включено                    | Исключено                          |
| --------------------------- | ---------------------------------- |
| ✅ E2E UI тесты (Playwright) | ❌ Бэкенд код (нет доступа)         |
| ✅ API тесты                 | ❌ Мобильные нативные (iOS/Android) |
| ✅ DB тесты                  | ❌ Performance тесты бэкенда        |
| ✅ Property-Based тесты      | ❌ Security penetration             |
| ✅ BDD/Gherkin сценарии      |                                    |
| ✅ Нагрузка (браузерная)     |                                    |

### 1.3 Ограничения проекта

| Ограничение | Влияние |
|-------------|---------|
| $0 бюджет | Только бесплатные инструменты |
| Нет доступа к бэкенду | Нельзя запускать в CI полноценно |
| Backend Docker недоступен | Smoke tests skipped |
| 16GB RAM MacBook Pro | Ограниченная параллелизация |

---

## 2. Стратегия тестирования (Test Strategy)

### 2.1 Виды тестирования

| Вид | Инструмент | Покрытие | Приоритет |
|-----|-----------|----------|-----------|
| **E2E UI** | Playwright | 122 теста | Critical |
| **API** | Playwright | 280 тестов | Critical |
| **DB** | Jest + pg | 18 тестов | High |
| **PBT** | Jest + fast-check | 46 тестов | High |
| **BDD** | Cucumber/Gherkin | 2 сценария | Medium |
| **Visual** | Playwright | Baseline | Low |
| **Нагрузка** | Playwright (multi-context) | Manual | Low |

### 2.2 Подходы к тестированию

#### Discovery-first (Рекомендуемый)
```
1. Исследовать систему (API, UI, БД)
2. Выявить требования
3. Написать тесты
4. Документировать
```

#### Spec-driven (Альтернатива)
```
1. Получить спецификацию
2. Написать тесты по ней
3. Запустить и проверить
```

### 2.3 Тестовая пирамида

```
        /\
       /E2E\        ← 122 тестов (мало, дорого)
      /------\
     /  API   \     ← 280 тестов (средне)
    /----------\
   /    PBT     \   ← 46 тестов (много, дешево)
  /--------------\
 /   DB Tests    \  ← 18 тестов
/------------------\
```

### 2.4 Уровни тестирования

| Уровень | Что тестируем | Инструмент |
|---------|---------------|------------|
| **Component** | React компоненты | Jest |
| **Integration** | API + DB | Playwright |
| **System** | Полный UI flow | Playwright |
| **Acceptance** | User stories | Gherkin |

---

## 3. Реализация (Test Implementation)

### 3.1 Цели

| # | Цель | Метрика успеха |
|---|------|----------------|
| 1 | Покрыть все API endpoints | ≥94% endpoints |
| 2 | Обеспечить стабильность | 0 flaky тестов |
| 3 | Data-driven тесты | 3 формата (JSON/YAML/Python) |
| 4 | Нагрузочное тестирование | 10+ браузеров одновременно |

### 3.2 Ожидаемые результаты

| Результат | Целевое значение |
|-----------|-----------------|
| Total тестов | 489+ |
| API Coverage | 94% |
| PBT Coverage | 100% |
| Execution time | < 10 мин |
| Pass rate | ≥ 80% |

### 3.3 Тестовые данные

```python
# Тестовые аккаунты
ACCOUNTS = {
    "alice": {"email": "alice@buzzhive.com", "password": "alice123", "role": "user"},
    "bob":   {"email": "bob@buzzhive.com", "password": "bob123", "role": "user"},
    "admin": {"email": "admin@buzzhive.com", "password": "admin123", "role": "admin"},
    "mod":   {"email": "mod@buzzhive.com", "password": "mod123", "role": "moderator"},
    "frank": {"email": "frank@buzzhive.com", "password": "frank123", "role": "banned"},
}
```

---

## 4. Ресурсы (Resources)

### 4.1 Аппаратные (Hardware)

| Ресурс | Характеристика | Примечание |
|--------|----------------|------------|
| MacBook Pro | 16GB RAM, Apple Silicon | Основная машина |
| CPU | 8 cores | Ограничивает параллелизацию |
| Disk | SSD 512GB | Достаточно |

### 4.2 Программные (Software)

| Инструмент | Версия | Назначение |
|------------|--------|------------|
| Node.js | 22 | Runtime |
| Playwright | 1.59 | E2E + API |
| Jest | 30.3 | Unit/PBT |
| pytest | 8.x | Python тесты |
| Docker | Latest | Container |

### 4.3 CI/CD

| Платформа | Назначение |
|-----------|------------|
| GitHub Actions | Quality Gates, Nightly |
| GitHub Pages | Документация |

---

## 5. Среда тестирования (Test Environment)

### 5.1 Компоненты

| Компонент | URL | Статус |
|-----------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Работает |
| Backend | http://localhost:8000 | ❌ Недоступен |
| API | http://localhost:8000/api | ❌ Недоступен |
| DB (PostgreSQL) | localhost:5432 | ❌ Недоступен |
| PGWeb | http://localhost:8081 | ❌ Недоступен |

### 5.2 Конфигурация

```yaml
# playwright.config.ts
projects:
  - name: chromium
    timeout: 30000
  - name: "Mobile Safari"
    device: iPhone 15 Pro
  - name: "Mobile Chrome"
    device: Pixel 5
```

---

## 6. График (Schedule)

| Фаза | Длительность | Статус |
|------|--------------|--------|
| Setup (Docker, Node, Playwright) | 1 час | ✅ Done |
| E2E Tests (120+) | 4 часа | ✅ Done |
| API Tests (280+) | 2 часа | ✅ Done |
| DB Tests (18) | 1 час | ✅ Done |
| PBT Tests (46) | 2 часа | ✅ Done |
| BDD Tests (2) | 1 час | ✅ Done |
| **Total** | **~11 часов** | |

---

## 7. Метрики (Metrics)

### 7.1 Тестовые метрики

| Метрика | Целевое | Текущее |
|---------|---------|---------|
| Total tests | 500+ | 489 |
| Code coverage | 80% | 70% |
| API coverage | 95% | 94% |
| PBT coverage | 100% | 100% |
| Flaky tests | 0% | <5% |

### 7.2 Бизнес метрики

| Метрика | Описание |
|---------|---------|
| Pass rate | % успешных тестов |
| Execution time | Время прогона |
| Bug density | Багов на 1000 строк |
| Requirement coverage | Покрытие требований |

---

## 8. Риски (Risks)

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Backend недоступен | High | High | Skip smoke tests |
| Flaky тесты | Medium | Medium | retries: 2 |
| Данные БД грязные | Medium | Low | Cleanup queue |
| Нет доступа к CI ресурсам | Low | Medium | Локальный запуск |

---

## 9. Управление дефектами (Defect Management)

| ID | Дефект | Severity | Статус |
|----|--------|----------|--------|
| AUTH-011-01 | Нет minlength на пароле | Medium | Open |
| AUTH-011-02 | POST /auth/refresh = 500 | High | Open |

---

## 10. Ревью и утверждение (Review & Approval)

| Роль | Ответственный | Статус |
|------|---------------|--------|
| QA Lead | — | Draft |
| Dev Lead | — | Pending |
| Product Owner | — | Pending |

---

## Приложения

### A. Нотации тестов

| Формат | Файл | Статус |
|--------|------|--------|
| Gherkin | `features/auth.feature` | ✅ |
| Python list | `python/tests/test_auth.py` | ✅ |
| JSON | `python/tests/test_data/auth_cases.json` | ✅ |
| YAML | `python/tests/test_data/auth.yaml` | ✅ |
| Groovy | `jenkins/` | Examples |

### B. Команды

```bash
# Основные
npm test                    # Full suite
npm run test:smoke         # Smoke
npm run test:pbt          # PBT
npm run test:db            # DB
npm run test:gherkin       # Gherkin
npm run test:python        # Python
npm run test:k6            # K6 load (future)

# Mobile
npx playwright test --project="Mobile Safari"
```

---

*Document created: 2026-04-17*  
*Based on ISTQB Standard Test Plan template*