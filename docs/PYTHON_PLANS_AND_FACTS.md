# Python Plans and Facts

## Что уже есть

### Окружение
- `python/requirements.txt` — зависимости: pytest, requests, httpx, pytest-playwright, pytest-bdd, pydantic
- Target: `http://localhost:8000/api`

### Тесты (4 файла)

| Файл | Тестов | Описание |
|------|--------|----------|
| `python/tests/test_api.py` | 5 | Auth, Posts, Users — базовые smoke-тесты |
| `python/tests/test_auth.py` | 5 | Параметризованные тесты логина (200/401/422) |
| `python/tests/test_bdd.py` | 0 | Шаблон BDD-клиента (pytest-bdd, закомментирован) |
| `python/tests/test_all_scenarios.py` | 24 | Полный набор: Auth(5), Posts(3), Security(3), Profile(3), Admin(3), Messages(1), Notifications(2), EdgeCases(2) |

**Всего: ~29 тестов.**

### Фичи, которые уже используются
- `@pytest.fixture` — token, admin_token, api_client
- `@pytest.mark.parametrize` — data-driven тесты
- `pytest.skip()` — graceful skip при недоступном бэкенде
- `requests.post/get/delete` — прямая работа с REST API
- `response.json()`, `response.status_code` — базовая валидация
- Accounts: alice, bob, admin, mod, frank, eve, dave

## Что можно добавить

### Приоритет (medium effort, high value)

| Задача | Описание | Почему |
|--------|----------|--------|
| **conftest.py** | Вынести `base_url`, `token` fixtures в общий файл | Убрать дублирование token-фикстур во всех классах |
| **API Client** | `httpx.Client` или `requests.Session` с auto-auth | Единая точка входа, ретраи, таймауты |
| **Auth retry** | Аналог `auth_retry.ts` — retry + backoff при 500 | Стабильность тестов |
| **Makefile** | `make test-py`, `make test-py-auth` | Быстрый запуск |
| **CI step** | `pytest python/tests/ -v --tb=short` в GitHub Actions | Автоматическая проверка |

### Средний приоритет

| Задача | Описание |
|--------|----------|
| **pytest-bdd** | Раскомментировать и заполнить `test_bdd.py` — Gherkin-style тесты |
| **Markers** | `@pytest.mark.smoke`, `@pytest.mark.admin`, `@pytest.mark.slow` |
| **Coverage** | `pytest-cov` — измерить покрытие API эндпоинтов |
| **Data-driven** | Расширить параметризацию на Posts, Admin, Profile |
| **Health check в conftest** | `pytest --setup-show` — проверка `/api/health` перед всеми тестами |
| **Ruff** | `ruff check python/` — автоформат и линтинг |
| **Allure** | `pytest-allure-adaptor` — красивые HTML-отчёты |

### Низкий приоритет

| Задача | Описание |
|--------|----------|
| **Async tests** | httpx async client — параллельный запуск|
| **pytest-playwright** | Browser-based E2E тесты на Python (дубль Playwright JS) |
| **Schema validation** | pydantic модели для response body |
| **Faker** | Генерация тестовых данных |
| **Property-based** | `hypothesis` для PBT-тестов (аналог fast-check) |

## Запуск

```bash
# Все тесты
pytest python/tests/ -v --tb=short

# Только auth
pytest python/tests/test_auth.py -v

# Только all_scenarios
pytest python/tests/test_all_scenarios.py -v
```

## Связь с Playwright-тестами

| Концепция | Playwright (JS) | Python (pytest) |
|------------|-----------------|-----------------|
| Test runner | `@playwright/test` | `pytest` |
| HTTP client | `APIRequestContext` | `requests` / `httpx` |
| Accounts | `credentials.ts` → `TEST_ACCOUNTS` | `ACCOUNTS` dict в test_all_scenarios.py |
| Auth retry | `auth_retry.ts` | — (можно добавить) |
| Fixtures | `test.beforeAll` | `@pytest.fixture` |
| Parametrize | Loops + `test.describe` | `@pytest.mark.parametrize` |
| Flexible status | `[200, 403, 404]` | `assert status in [200, 403, 404]` |
| CI | `playwright.yml` | — (можно добавить) |

## Известные проблемы

1. **Нет conftest.py** — token fixtures дублируются в каждом классе
2. **Нет ретраев** — при 500 тест сразу падает
3. **Нет CI** — Python тесты не запускаются в GitHub Actions
4. **test_bdd.py** — закомментирован, не работает
5. **Нет изоляции** — тесты используют shared state (база данных)
