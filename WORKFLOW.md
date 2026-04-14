# QA Automation Workflow

## Параллельная работа

### Запуск тестов в фоне
```bash
cd ~/Projects/qa-automation-sandbox
npm test > test-results.txt 2>&1 &
echo "Tests running in background (PID: $!)"
```

### Проверить результат
```bash
tail -20 test-results.txt
```

### Мониторить
```bash
watch -n 5 'tail -5 test-results.txt'
```

### Мой workflow
1. Я выполняю задачу
2. Запускаю `npm test &`
3. Продолжаю работу
4. Проверяешь результат когда удобно

---

## Быстрые команды

| Команда | Что делает |
|---------|-----------|
| `npm test` | Все тесты |
| `npm test -- --grep "Auth"` | Только Auth |
| `npm test -- --reporter=dot` | Компактный вывод |
| `npx playwright show-report` | HTML отчёт |

---

## Статус

- **OpenCode** — тяжёлые задачи (reverse engineering, файлы)
- **VS Code + Copilot** — писать простые тесты
- **Терминал** — запускать тесты в фоне

## Future Tools (for other systems)
- Jest/Vitest: unit + integration tests
- Kafka JS: queue testing
- ioredis: Redis testing  
- k6: load testing

## Rules

| Приоритет | Правило | Зачем |
|-----------|---------|-------|
| 1 | **Swagger daily** | Синхронизировать TEST_CASES.md с /docs |
| 2 | **Traceability sync** | Обновлять TRACEABILITY_MATRIX.md при добавлении тестов |
| 3 | **Anti-flaky first** | expect() вместо waitForTimeout() |
| 4 | **data-testid always** | Использовать data-testid для стабильности |

## Sync Checklist (после добавления тестов)

- [ ] TEST_CASES.md — новые кейсы
- [ ] API_CONTRACT.md — покрытие endpoints
- [ ] TRACEABILITY_MATRIX.md — Requirements ↔ Tests
- [ ] TEST_REPORT.md — результаты прогона
