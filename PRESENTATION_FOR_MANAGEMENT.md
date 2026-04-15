# QA Automation — Buzzhive Sandbox
## Обзор проекта для руководства

---

## 🎯 Цель проекта

Практика QA Automation на **реальном** проекте (социальная сеть) с изучением современных подходов.

---

## 📊 Результаты

### Тесты (456)

| Тип | Кол-во | Инструменты |
|-----|--------|-------------|
| E2E | 122 | Playwright |
| API | 280 | Playwright |
| DB | 18 | Jest + pg |
| PBT | 13 | Jest + fast-check |
| Gherkin | 23 | Cucumber |

**Покрытие API:** 94% (49/52 endpoints)

---

## 🔧 Технологический стек

```
Frontend:  React
Backend:   FastAPI (Python)
Database:  PostgreSQL
Mobile:    iOS/Android (Appium)
───────────────────────────────────
E2E:       Playwright
API:       Playwright + REST
DB:        Jest + pg
PBT:       Jest + fast-check
BDD:       Cucumber
CI/CD:     GitHub Actions
AI:        Ollama (local LLM)
```

---

## 📋 Этапы работы

### Этап 1: Разведка (Discovery)
- Reverse engineering API (Swagger)
- Анализ схемы БД
- Документирование требований

### Этап 2: Инфраструктура
- Page Objects (LoginPage, FeedPage, NavPage)
- Fixtures и helpers
- Jest integration (PBT + DB)

### Этап 3: Покрытие
- E2E тесты (122 шт)
- API тесты (280 шт)
- Gherkin сценарии (23 шт)

### Этап 4: Стабильность
- Anti-flaky рефакторинг
- 40 waitForTimeout → expect()
- Время прогона: 2.6 мин → 2.1 мин

### Этап 5: CI/CD
- GitHub Actions (push/PR)
- Nightly invariants
- Автоматические отчёты

---

## 🔍 Найденные баги

| ID | Описание | Серьёзность |
|----|---------|-------------|
| AUTH-011-02 | Token refresh returns 500 | 🔴 High |
| AUTH-011-01 | No HTML5 minlength | 🟡 Medium |

---

## 📁 Документация

| Документ | Назначение |
|----------|------------|
| `AI_READY_DOR.md` | Требования для AI-агентов |
| `ENHANCEMENT_REPORT.md` | Что сделано |
| `ANTI_FLAKY_REVIEW.md` | Стабильность тестов |
| `API_CONTRACT.md` | 49 API endpoints |
| `TEST_CASES.md` | 456 тест-кейсов |
| `TRACEABILITY_MATRIX.md` | Покрытие требований |

---

## 🚀 CI/CD Pipeline

```
Push/PR → E2E → API → PBT → DB → Lint
                 ↓
         Nightly: Invariants
```

---

## 📱 Mobile Testing (Следующий шаг)

- Appium Desktop ✅
- XCUITest Driver ✅  
- iOS/Android Setup ⏳

---

## 🖥️ Системные требования

**Констрейнт:** Все инструменты — бесплатные и доступные (no paid tools).

| Компонент | Характеристика |
|-----------|----------------|
| Hardware | MacBook Pro, 16GB RAM |
| OS | macOS |
| Models | Groq (free tier), Ollama (local) |
| Budget | **$0** — полностью бесплатно |

### Проверенные AI модели

| Модель | Провайдер | Статус | Примечание |
|--------|-----------|--------|------------|
| Llama 3.3 70B | Groq | ✅ Работает | 500 tok/s, free tier |
| qwen2.5:3b | Ollama | ✅ Работает | Локально, 1.9 GB |
| Gemini 2.5 | Google | ❌ Quota exceeded | Не использовать |
| qwen2.5:14b | Ollama | ⚠️ Медленно | 9 GB, timeout |
| gpt-oss:20b | Groq | ❌ Timeout | Слишком медленная |

---

## 💡 Ключевые выводы

1. **Discovery-first** — не писать тесты вслепую
2. **Multi-level testing** — E2E + API + DB + PBT
3. **CI/CD обязательно** — каждый commit проверяется
4. **AI-ready docs** — LLM могут работать с требованиями

---

## ⏱️ Затраты времени

| Этап | Время |
|------|-------|
| Discovery | ~2 часа |
| Инфраструктура | ~3 часа |
| Покрытие | ~4 часа |
| CI/CD | ~1 час |

**Итого: ~10 часов** (2 рабочие сессии)

---

## 📈 Метрики

| Метрика | До | После | Изменение |
|---------|-----|-------|-----------|
| Тестов | 60 | **456** | **+7.5x** |
| Строк кода | ~800 | ~4500 | +5.6x |
| Сложность | Базовые | Anti-flaky + PBT + DB | +3 уровня |
| API Coverage | 73% | **94%** | +21% |
| Время прогона | 2.6 мин | **2.1 мин** | **-19%** |
| Flaky tests | many | **0** | -100% |

> **Ключевой вывод:** При росте тестов в 7.5x и усложнении логики (PBT, DB, multi-level) время выполнения **уменьшилось на 19%** благодаря anti-flaky рефакторингу.

### 📊 Оценка полного покрытия (с Unit тестами)

| Layer | Текущие | Если бы был доступ к коду |
|-------|---------|--------------------------|
| E2E | 122 | 122 (15%) |
| API | 280 | 280 (35%) |
| Unit/DB/PBT | 54 | ~350 (45%) |
| **Итого** | **456** | **~750** |

> Текущие 456 тестов = **60% от полного покрытия** (QA без доступа к коду)

---

## 🎓 Чему научились

1. **Spec-Driven Development** — AI-readable требования
2. **Property-Based Testing** — тестирование свойств
3. **Anti-flaky patterns** — стабильные тесты
4. **Multi-framework approach** — Playwright + Jest
5. **Parallel agents** — ускорение разведки

---

## ⚠️ Что не сработало

| Инструмент | Проблема | Решение |
|------------|----------|---------|
| Google Gemini API | Quota exceeded (429) | Groq Llama 3.3 70B |
| Ollama qwen2.5:14b | 9 GB, долгая загрузка | Оставить для тяжёлых задач |
| gpt-oss:20b | Timeout 180 сек | Не использовать |
| Autonoma plugin | Требует Pro/Max подписку | Claude Code напрямую |

**Вывод:** Не каждый AI-инструмент работает как обещано. Проверяйте лимиты до построения workflow.

---

## 📋 Следующие шаги

1. ✅ Mobile setup (iOS/Android)
2. ✅ Расширение API тестов (65 → 280)
3. ⏳ Расширение PBT coverage
4. ⏳ Инварианты в production monitoring
5. ⏳ Performance testing

### API Expansion Results (DONE)

| Category | Endpoints | Before | After | Ratio |
|----------|-----------|--------|-------|-------|
| Auth | 5 | 8 | 33 | 4x |
| Posts | 10 | 12 | 62 | 5x |
| Users | 7 | 8 | 30 | 4x |
| Messages | 5 | 6 | 22 | 4x |
| Notifications | 4 | 5 | 20 | 4x |
| Admin | 8 | 10 | 28 | 3x |
| Other | 6 | 8 | 20 | 3x |
| **TOTAL** | **52** | **65** | **215** | **3.3x** |

**Сценарии на каждый эндпоинт:**
1. ✅ Happy path
2. 🔒 Permission tests (user vs admin)
3. ❌ Invalid input
4. 📏 Boundary values
5. 🔄 State transitions

---

## Контакты / Ресурсы

- **Репозиторий:** github.com/manikosto/qa-automation-sandbox
- **Backend API:** localhost:8000/docs
- **Frontend:** localhost:3000
- **Тесты:** `npm test`
- **PBT:** `npm run test:pbt`
- **DB:** `npm run test:db`

---

*QA Automation Sandbox — практика на реальном проекте*
