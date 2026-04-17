import { test, expect } from '@playwright/test';

const BASE_URL = 'http://192.168.1.210:3000';

test.describe('Load Test 1: Smoke - 5 users simultaneously', () => {
  test('5 users login at the same time', async ({ browser }) => {
    const startTime = Date.now();
    
    const contexts = await Promise.all(
      Array(5).fill().map(() => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(ctx => ctx.newPage())
    );
    
    await Promise.all(
      pages.map(page => 
        page.goto(`${BASE_URL}/login`)
      )
    );
    
    const loadTime = Date.now() - startTime;
    console.log(`5 users loaded in ${loadTime}ms`);
    
    // All pages should have login form
    await Promise.all(
      pages.map(page => 
        expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible()
      )
    );
    
    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
    
    expect(loadTime).toBeLessThan(10000); // < 10 seconds
  });
});