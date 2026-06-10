# SOP: Add New Module (OrangeHRM)

## Purpose
Add a new module to the OrangeHRM test suite (POM + spec + fixtures).

## When to Use
- After exploring a new OrangeHRM module
- When TEST_CASES.md shows 0% coverage for a module

## Steps

1. **Explore** — navigate module, note selectors + API endpoints

2. **Create POM** — `pom/NewModulePage.ts`:
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewModulePage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() {
    await super.goto('/web/index.php/module/path');
    await this.waitForLoad('.oxd-topbar-header-title', 10000).catch(() => {});
  }

  async getHeading() {
    return this.page.textContent('.oxd-topbar-header-title');
  }
}
```

3. **Create spec** — `e2e/newmodule.spec.ts`:
```typescript
import { test, expect } from '../helpers/fixtures';

test.describe('New Module', () => {
  test('page loads @smoke', async ({ newModulePage, loggedInPage }) => {
    await newModulePage.goto();
    expect(await newModulePage.getHeading()).toContain('Expected Text');
  });
});
```

4. **Register fixture** — add to `helpers/fixtures.ts`:
```typescript
import { NewModulePage } from '../pom/NewModulePage';
// Add to type Fixtures + extend
```

5. **Tag tests** — `@smoke` for load tests, `@local` for destructive

6. **Update docs** — TEST_CASES.md + TEST_ARCHITECTURE.md

7. **Verify** — `npx playwright test --list` shows new tests

## Quality Checks
- All POMs extend BasePage
- No waitForTimeout (use explicit waits)
- Fixtures typed in helpers/fixtures.ts
- TEST_CASES.md updated

## Failure Points
- Selector changes between OrangeHRM versions
- Demo vs local differences (use @local tag)
- Missing fixture registration → test can't find page object

## Checklist
- [ ] POM created with BasePage
- [ ] Spec created with @smoke/@local tags
- [ ] Fixture registered in fixtures.ts
- [ ] TEST_CASES.md updated
- [ ] TEST_ARCHITECTURE.md updated
- [ ] `npx playwright test --list` shows new tests
