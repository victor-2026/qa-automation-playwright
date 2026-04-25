# CI/CD Review — GPT-5 Nano (2026-04-25)

## Executive Summary

### What Went Well
- Render backend deployment fixed and live URL established
- CI/CD for Render includes matrix across Chromium, Firefox, WebKit with long-running smoke/full test windows
- Phase 8 changes centralized credentials/teardown to API_BASE_URL and improved token handling
- Nightly plan covers both smoke (short) and full suite (large) with explicit timeouts

### Biggest Risks
- Security posture: credentials/tokens in CI must be carefully guarded
- Architectural alignment: gating (lint/typecheck/audit) must actually fail the build
- Smoke failure visibility: need clear root-cause logs

---

## 1. Security

### Current Issues
- ADMIN_TOKEN передаётся через env vars
- Логи могут выводить токены

### Recommendations
- [x] Токены в Secrets, не в vars
- [ ] Маскировать токены в логах
- [ ] Добавить fail-fast если секрет отсутствует

---

## 2. CI/CD Architecture

### Current Issues
- quality-gates не зависит от test job
- Провалы gates не блокируют PR

### Recommendations
- [ ] Добавить `needs: test` для quality-gates
- [ ] Gates должны прерывать PR при провале
- [ ] Кэширование npm и Playwright browsers
- [ ] Валидация артефактов (путь, размер > 0)

---

## 3. Smoke Failures

### Likely Causes
- Backend Render недоступен по URL
- Seed data отсутствует перед тестами
- Неверные env переменные
- Тайминги

### Recommendations
- Проверить логи smoke job
- Убедиться что seed выполняется перед smoke
- Добавить explicit assertions на критических путях

---

## Commits Reviewed
- 696f221 — fix: strip newlines from token
- c8820b2 — debug: add verbose token logging
- fe3874b — fix: use API_BASE_URL env var
- 9e1127b — fix: increase timeout for smoke/full

---

## Next Steps
1. Применить фиксы безопасности
2. Связать quality-gates с test job
3. Debug smoke failures
4. Добавить seed перед smoke tests