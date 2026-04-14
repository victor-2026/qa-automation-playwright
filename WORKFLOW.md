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
