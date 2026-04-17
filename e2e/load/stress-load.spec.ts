import { test, expect } from '@playwright/test';

const BASE_URL = 'http://192.168.1.210:3000';

test.describe('Load Test 3: Stress - 20 users rapid login spike', () => {
  test('20 users login in quick succession (spike)', async ({ browser }) => {
    const userCount = 20;
    const startTime = Date.now();
    
    // Create all contexts at once (spike)
    const contexts = await Promise.all(
      Array(userCount).fill().map(() => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(ctx => ctx.newPage())
    );
    
    // All try to login simultaneously
    const loginPromises = pages.map(async (page, i) => {
      const userStart = Date.now();
      try {
        await page.goto(`${BASE_URL}/login`, { timeout: 10000 });
        await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
        await page.fill('[data-testid="auth-password-input"]', 'alice123');
        await page.click('[data-testid="auth-login-btn"]');
        
        // Wait a bit to simulate real usage
        await page.waitForTimeout(500).catch(() => {});
        
        return { user: i + 1, status: 'success', time: Date.now() - userStart };
      } catch (e) {
        return { user: i + 1, status: 'failed', time: Date.now() - userStart };
      }
    });
    
    const results = await Promise.all(loginPromises);
    const totalTime = Date.now() - startTime;
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    const maxTime = Math.max(...results.map(r => r.time));
    const minTime = Math.min(...results.map(r => r.time));
    
    console.log(`=== Stress Test Results (20 users spike) ===`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Success: ${successCount}/${userCount}`);
    console.log(`Failed: ${failedCount}/${userCount}`);
    console.log(`Avg response: ${avgTime.toFixed(0)}ms`);
    console.log(`Min/Max: ${minTime}ms / ${maxTime}ms`);
    
    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
    
    // Assertions
    expect(successCount).toBeGreaterThanOrEqual(10); // At least 50%
    expect(totalTime).toBeLessThan(30000); // Complete within 30s
  });
});