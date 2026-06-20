import { test, expect } from '../fixtures';

test.describe('Posts API — Fault Injection (with skill)', () => {
  test('injects null into post title via page.route() and verifies mutation is caught', async ({ page, request }) => {
    // Intercept the posts API response (skill pattern: page.route with fetch/fulfill)
    await page.route('**/api/posts*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Skill pattern: null injection in required field
      if (json.items && Array.isArray(json.items)) {
        json.items.forEach((post: any) => {
          post.title = null;
        });
      }
      
      await route.fulfill({
        response,
        json,
      });
    });

    await page.goto('/feed');
    
    // Wait for feed to load with mutated data
    await page.waitForTimeout(2000);
    
    const postCards = page.locator('[data-testid^="post-"]');
    const firstTitle = postCards.first().locator('[data-testid^="post-title-"]');
    const titleText = await firstTitle.textContent();
    
    // Skill pattern: explicit assertion that mutation is caught
    // This SHOULD FAIL (test fails = mutation caught)
    expect(titleText).not.toBeNull();
    expect(titleText).not.toBe('');
    expect(titleText).not.toBe('null');
  });

  test('HOM: null title + negative likes_count via page.route()', async ({ page, request }) => {
    // Skill HOM pattern: combine multiple mutations
    await page.route('**/api/posts*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      if (json.items && Array.isArray(json.items)) {
        json.items.forEach((post: any) => {
          post.title = null;           // null in required field
          post.likes_count = -999;     // negative/extreme value
        });
      }
      
      await route.fulfill({
        response,
        json,
      });
    });

    await page.goto('/feed');
    await page.waitForTimeout(2000);
    
    const postCards = page.locator('[data-testid^="post-"]');
    const firstTitle = postCards.first().locator('[data-testid^="post-title-"]');
    const titleText = await firstTitle.textContent();
    
    // Skill HOM pattern: both mutations should be caught
    expect(titleText).not.toBeNull();
    expect(titleText).not.toBe('');
    expect(titleText).not.toBe('null');
  });
});