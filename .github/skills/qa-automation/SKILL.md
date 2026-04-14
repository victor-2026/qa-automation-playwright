---
name: qa-automation
description: 'QA Automation Skill — Generate test data, reset environments, run targeted tests, and automate QA workflows in the BuzzHive sandbox. Use for: seeding custom test scenarios; environment resets; regression testing; data-driven test preparation.'
---

# QA Automation Skill

This skill automates common QA tasks in the BuzzHive social media platform sandbox, including environment management, test data generation, and test execution.

## Workflow Steps

1. **Assess Request**: Determine the specific QA task (e.g., reset env, seed data, run tests).
2. **Environment Setup**: Ensure Docker containers are running; reset if needed.
3. **Data Preparation**: Generate or modify test data as required.
4. **Test Execution**: Run E2E tests or specific scenarios.
5. **Validation**: Verify results and provide feedback.

## Common Tasks

- **Environment Reset**: `docker-compose down -v && docker-compose up --build`
- **Seed Custom Data**: Modify `backend/app/services/seed.py` or create new seed functions.
- **Run Tests**: `npm test` or `npm run test:ui` for Playwright E2E.
- **Generate Test Users**: Use deterministic UUIDs and patterns from existing seed.

## Assets

- Reference [README.md](README.md) for test accounts and data.
- Use `tid()` for test IDs in selectors.
- Follow conventions: JWT auth, pagination, etc.

When invoked, provide the specific QA task details for automation.</content>
<parameter name="filePath">/Users/victor/Projects/qa-automation-sandbox/.github/skills/qa-automation/SKILL.md