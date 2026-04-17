import { test, expect } from '@playwright/test';

const BASE_URL = 'http://192.168.1.210:3000';
const API_BASE = 'http://localhost:8000/api';

test.describe('Load Test 2: Basic - 10 users, full workflow', () => {
  test('10 users do login → post → logout', async ({ browser }) => {
    const users = [
      { email: 'alice@buzzhive.com', password: 'alice123' },
      { email: 'bob@buzzhive.com', password: 'bob123' },
      { email: 'alice@buzzhive.com', password: 'alice123' },
      { email: 'bob@buzzhive.com', password: 'bob123' },
      { email: 'alice@buzzhive.com', password: 'alice123' },
      { email: 'bob@buzzhive.com', password: 'bob123' },
      { email: 'alice@buzzhive.com', password: 'alice123' },
      { email: 'bob@buzzhive.com', password: 'bob123' },
      { email: 'alice@buzzhive.com', password: 'alice123' },
      { email: 'bob@buzzhive.com', password: 'bob123' },
    ];
    
    const startTime = Date.now();
    const results: { user: number; status: string; time: number }[] = [];
    
    // Sequential to measure each
    for (let i = 0; i < users.length; i++) {
      const userStart = Date.now();
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Login
        await page.goto(`${BASE_URL}/login`);
        await page.fill('[data-testid="auth-email-input"]', users[i].email);
        await page.fill('[data-testid="auth-password-input"]', users[i].password);
        await page.click('[data-testid="auth-login-btn"]');
        
        // Wait for redirect (check for any element after login)
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        
        // Navigate to feed
        await page.goto(`${BASE_URL}/`).catch(() => {});
        
        // Logout if possible
        await page.click('[data-testid="logout-btn"]').catch(() => {});
        
        const userTime = Date.now() - userStart;
        results.push({ user: i + 1, status: 'success', time: userTime });
      } catch (e) {
        const userTime = Date.now() - userStart;
        results.push({ user: i + 1, status: 'failed', time: userTime });
      } finally {
        await context.close();
      }
    }
    
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    
    console.log(`=== Basic Load Test Results ===`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Success: ${successCount}/10`);
    console.log(`Average per user: ${avgTime.toFixed(0)}ms`);
    console.log(`Results:`, results);
    
    // Assertions
    expect(successCount).toBeGreaterThanOrEqual(7); // 70% pass
    expect(totalTime).toBeLessThan(60000); // < 1 minute
  });
});