import { test, expect } from '../fixtures';

test.describe('Posts API — Fault Injection (without skill)', () => {
  test('injects null into post title via page.route() and verifies mutation is caught', async ({ page, request }) => {
    // Intercept the posts API response
    await page.route('**/api/posts*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Inject null into title for every post
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
    
    // Wait for the feed to load with mutated data
    await page.waitForTimeout(2000);
    
    // The UI should show an error or empty state due to null titles
    // This test SHOULD FAIL because the mutation should be caught
    const postCards = page.locator('[data-testid^="post-"]');
    const firstTitle = postCards.first().locator('[data-testid^="post-title-"]');
    const titleText = await firstTitle.textContent();
    
    // This should FAIL - mutation caught means title is null/empty
    expect(titleText).not.toBeNull();
    expect(titleText).not.toBe('');
    expect(titleText).not.toBe('null');
  });
});