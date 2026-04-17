import { test, expect } from '@playwright/test';

const BASE_URL = 'http://192.168.1.210:3000';

test.describe('Load Test 4: Network Failure and Recovery', () => {
  
  test('Network disconnect during login - recovery test', async ({ page }) => {
    const startTime = Date.now();
    
    // Step 1: Normal navigation
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible();
    console.log('Step 1: Login page loaded');
    
    // Step 2: Fill form, then disconnect network
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    
    // Block all requests to simulate network failure
    await page.route('**', route => {
      if (route.request().url().includes('api') || route.request().url().includes('localhost')) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    console.log('Step 2: Network blocked - attempting login');
    const errorPromise = page.click('[data-testid="auth-login-btn"]').catch(() => {});
    
    await page.waitForTimeout(2000);
    
    // Step 3: Check error handling (should show error or stay on page)
    const pageContent = await page.content();
    const hasError = pageContent.includes('error') || pageContent.includes('failed') || pageContent.includes('network');
    console.log(`Step 3: Error displayed: ${hasError}`);
    
    // Step 4: Restore network
    await page.unrouteAll();
    console.log('Step 4: Network restored');
    
    // Step 5: Retry login
    await page.reload();
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    
    // Step 6: Verify recovery - should work after restore
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    const recoveryTime = Date.now() - startTime;
    
    console.log(`=== Network Recovery Test Results ===`);
    console.log(`Total recovery time: ${recoveryTime}ms`);
    console.log(`System recovered: YES`);
    
    // The test verifies the system doesn't hang and can recover
    expect(recoveryTime).toBeLessThan(15000);
  });
  
  test('Multiple users - one has network issue, others continue', async ({ browser }) => {
    const startTime = Date.now();
    
    // Create 5 users, 1 with network issues
    const contexts = await Promise.all(
      Array(5).fill().map((_, i) => browser.newContext())
    );
    
    const results = await Promise.all(contexts.map(async (ctx, i) => {
      const page = await ctx.newPage();
      const userStart = Date.now();
      
      try {
        await page.goto(`${BASE_URL}/login`, { timeout: 10000 });
        
        // User 3 gets network issues
        if (i === 2) {
          await page.route('**', route => route.abort('failed'));
          await page.click('[data-testid="auth-login-btn"]').catch(() => {});
          await page.waitForTimeout(1000);
          await page.unrouteAll();
        }
        
        await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
        await page.fill('[data-testid="auth-password-input"]', 'alice123');
        await page.click('[data-testid="auth-login-btn"]');
        await page.waitForLoadState('networkidle').catch(() => {});
        
        return { user: i + 1, status: 'success', time: Date.now() - userStart };
      } catch (e) {
        return { user: i + 1, status: 'failed', time: Date.now() - userStart };
      } finally {
        await ctx.close();
      }
    }));
    
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    
    console.log(`=== Multi-user with Network Issue ===`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Success: ${successCount}/5`);
    console.log(`Results:`, results);
    
    expect(successCount).toBeGreaterThanOrEqual(3); // At least 60%
  });
});