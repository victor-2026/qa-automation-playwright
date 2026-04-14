# QA Automation Context

## Project
Buzzhive Social Network - E2E Testing with Playwright

## Conventions
- Используй data-testid селекторы (auth-email-input, post-card-{id}, etc.)
- Каждый тест: arrange, act, assert
- Таймауты: 5000ms по умолчанию
- BASE_URL = http://localhost:3000

## Test Structure
- Тесты в ./tests/ директории
- Формат: *.spec.ts
- Используй page.waitForLoadState('networkidle') вместо waitForURL

## Selectors Reference
Auth: auth-*-input, auth-*-btn
Posts: post-*-{id}
Navigation: nav-*
Profile: profile-*
Messages: message-*, new-conversation-btn
Notifications: notification-*, notifications-*-btn