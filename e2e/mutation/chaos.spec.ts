/**
 * Chaos Engineering mutation tests.
 * Requires DOCKER_CHAOS env var and Docker services running.
 * Run: DOCKER_CHAOS=1 npx playwright test e2e/mutation/chaos.spec.ts --project=chromium
 */
import { test, expect } from '../fixtures';
import { execSync } from 'child_process';
import path from 'path';

const COMPOSE_FILE = path.resolve(process.cwd(), 'docker-compose.yml');
const isCI = !!process.env.CI;
const chaosEnabled = process.env.DOCKER_CHAOS === '1';

const composeCmd = (): string | null => {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return `docker compose -f ${COMPOSE_FILE}`;
  } catch {
    try {
      execSync('docker-compose --version', { stdio: 'ignore' });
      return `docker-compose -f ${COMPOSE_FILE}`;
    } catch {
      return null;
    }
  }
};

test.describe('Mutation — Chaos Engineering', () => {

  test.describe.configure({ mode: 'serial' });

  let cmd: string | null;

  test.beforeAll(() => {
    if (!chaosEnabled) {
      console.log('[CHAOS] Skipped — set DOCKER_CHAOS=1 to run');
      return;
    }
    cmd = composeCmd();
    if (!cmd) {
      throw new Error('Docker Compose not found');
    }
    try {
      execSync(`${cmd} ps --services --filter "status=running"`, { stdio: 'pipe' });
    } catch {
      throw new Error('Docker services not running. Start with: docker compose up -d');
    }
  });

  test.afterEach(() => {
    if (!cmd) return;
    try {
      execSync(`${cmd} start db backend 2>/dev/null || true`, { stdio: 'ignore' });
      execSync('sleep 3', { stdio: 'ignore' });
    } catch {
      // ignore
    }
  });

  test.afterAll(() => {
    if (!cmd) return;
    execSync(`${cmd} start db backend 2>/dev/null || true`, { stdio: 'ignore' });
  });

  test('CHAOS-001: db down shows error on feed', async ({ page }) => {
    test.skip(!chaosEnabled || !cmd || isCI, 'Set DOCKER_CHAOS=1 to enable');

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    execSync(`${cmd} stop db`, { stdio: 'pipe' });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const errorBanner = page.locator('text=error|failed|unavailable|server error|database|try again');
    await expect(errorBanner.first()).toBeVisible({ timeout: 5000 });
  });

  test('CHAOS-002: backend down shows error on feed', async ({ page }) => {
    test.skip(!chaosEnabled || !cmd || isCI, 'Set DOCKER_CHAOS=1 to enable');

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    execSync(`${cmd} stop backend`, { stdio: 'pipe' });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const errorBanner = page.locator('text=error|failed|unavailable|server error|connection|try again');
    await expect(errorBanner.first()).toBeVisible({ timeout: 5000 });
  });

  test('CHAOS-003: backend restart recovers', async ({ page }) => {
    test.skip(!chaosEnabled || !cmd || isCI, 'Set DOCKER_CHAOS=1 to enable');

    await page.goto('/login');
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();

    execSync(`${cmd} restart backend`, { stdio: 'pipe' });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const profile = page.locator('[data-testid="nav-profile"]');
    await expect(profile).toBeVisible({ timeout: 10000 });
  });
});
