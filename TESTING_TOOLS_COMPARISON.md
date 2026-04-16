# Testing Tools Comparison

## Current & Future Projects

| Tool | Our Project (QA Sandbox) | Future Projects |
|------|------------------------|-----------------|
| **@testing-library/react** | ✅ Component tests | React apps |
| **Storybook** | Visual regression + docs | Any UI component library |
| **Playwright Visual** | Screenshot diffs | Web apps |
| **Vitest** | Fast unit tests | Vite projects |
| **Chromatic** | Cloud visual regression | Teams/collaboration |
| **Percy** | Visual testing | Web apps |
| **Storycap** | Storybook screenshots | Storybook projects |
| **Testing Library (Angular/Vue)** | - | Angular/Vue apps |
| **Cypress** | E2E alternative | Apps needing Cypress-specific features |
| **Selenium** | Legacy support | Old web apps |
| **Appium** | Mobile native | React Native, native apps |
| **Detox** | React Native | React Native apps |
| **k6** | Load testing | APIs, web apps |
| **Gatling** | Load testing | Enterprise APIs |
| **TrickCatcher (ACL 2025)** | Source code bugs | Code review automation |
| **OWASP ZAP** | Security scanning | Web apps |
| **SonarQube** | Code quality | Any code |
| **Snyk** | Dependency scanning | Any dependencies |

## Recommended Additions

| Priority | Tool | Effort | Impact |
|----------|------|--------|--------|
| 🔴 High | Storybook | Medium | High |
| 🟡 Medium | Playwright Visual | Low | Medium |
| 🟡 Medium | Vitest | Low | Medium |
| 🟢 Low | k6 | Medium | Low |

## What We Have Now

| Type | Tool | Status |
|------|------|--------|
| E2E | Playwright | ✅ |
| API | Playwright | ✅ |
| Component | @testing-library/react | ✅ NEW |
| DB | Jest + pg | ✅ |
| PBT | Jest + fast-check | ✅ |
| BDD | Cucumber | ✅ |
| CI/CD | GitHub Actions | ✅ |
| Mobile | Playwright devices | ✅ |

## Missing

| Tool | Why Needed |
|------|------------|
| Visual regression | Catch UI bugs |
| Load testing | Performance |
| Security scanning | OWASP Top 10 |
| Component documentation | Storybook |
