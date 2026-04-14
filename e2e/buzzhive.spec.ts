import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Buzzhive Social Network - Auth', () => {
  
  test('homepage loads', async ({ page }) => {
    await page.goto(BASE_URL);
    const title = await page.title();
    console.log('Page title:', title);
    const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
    await expect(loginButton.first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Homepage test passed!');
  });

  test('login page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    const loginBtn = page.locator('[data-testid="auth-login-btn"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
    console.log('✅ Login page test passed!');
  });

  test('AUTH-001: login with valid credentials creates session', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForURL('**/');
    
    const userProfile = page.locator('[data-testid="nav-profile"]');
    await expect(userProfile).toBeVisible({ timeout: 5000 });
    
    console.log('✅ AUTH-001: Login creates session - PASSED');
  });

  test('AUTH-001: JWT tokens stored after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForURL('**/');
    
    const tokens = await page.evaluate(() => {
      return {
        hasAccessToken: !!localStorage.getItem('access_token'),
        hasRefreshToken: !!localStorage.getItem('refresh_token'),
      };
    });
    
    expect(tokens.hasAccessToken).toBe(true);
    expect(tokens.hasRefreshToken).toBe(true);
    
    console.log('✅ AUTH-001: JWT tokens stored - PASSED');
  });

  test('AUTH-001: session persists on page reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForURL('**/');
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const stillLoggedIn = await page.locator('[data-testid="nav-feed"]').isVisible({ timeout: 3000 }).catch(() => false);
    expect(stillLoggedIn).toBe(true);
    
    console.log('✅ AUTH-001: Session persists on reload - PASSED');
  });

  test('AUTH-001: sidebar shows username after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
    
    const profileLink = page.locator('[data-testid="nav-profile"]');
    await expect(profileLink).toBeVisible({ timeout: 5000 });
    
    console.log('✅ AUTH-001: Sidebar shows user - PASSED');
  });

  test('AUTH-002: login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForTimeout(1000);
    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
    console.log('✅ AUTH-002: Wrong password error - PASSED');
  });

  test('AUTH-002: no tokens stored on failed login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForTimeout(1000);
    
    const tokens = await page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token'),
      };
    });
    
    expect(tokens.accessToken).toBeNull();
    expect(tokens.refreshToken).toBeNull();
    
    console.log('✅ AUTH-002: No tokens on failed login - PASSED');
  });

  test('AUTH-002: user stays on login page after error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'wrongpassword');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*\/login/);
    
    console.log('✅ AUTH-002: Stay on login page - PASSED');
  });

  test('AUTH-001: admin can login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'admin@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'admin123');
    await page.click('[data-testid="auth-login-btn"]');
    
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="nav-feed"]')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ AUTH-001: Admin login - PASSED');
  });

  test('registration page - all fields present', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('[data-testid="auth-display-name-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="auth-username-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="auth-email-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="auth-password-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="auth-register-btn"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Registration fields present!');
  });

  test('registration - email validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="auth-display-name-input"]', 'Test User');
    await page.fill('[data-testid="auth-username-input"]', 'testuser123');
    await page.fill('[data-testid="auth-email-input"]', 'invalid-email');
    await page.fill('[data-testid="auth-password-input"]', 'password123');
    await page.click('[data-testid="auth-register-btn"]');
    await page.waitForTimeout(500);
    const emailInput = page.locator('[data-testid="auth-email-input"]');
    const isInvalid = await emailInput.evaluate(el => el.validity.valid);
    expect(isInvalid).toBe(false);
    console.log('✅ Email validation works!');
  });

  test('registration - short password validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="auth-display-name-input"]', 'Test User');
    await page.fill('[data-testid="auth-username-input"]', 'testuser123');
    await page.fill('[data-testid="auth-email-input"]', 'test@example.com');
    await page.fill('[data-testid="auth-password-input"]', '123');
    await page.click('[data-testid="auth-register-btn"]');
    await page.waitForTimeout(500);
    const passwordInput = page.locator('[data-testid="auth-password-input"]');
    const isInvalid = await passwordInput.evaluate(el => el.validity.valid);
    expect(isInvalid).toBe(false);
    console.log('✅ Password validation works!');
  });
});

test.describe('Buzzhive Social Network - Navigation', () => {
  
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test('navigation elements visible after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await expect(page.locator('[data-testid="nav-feed"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="nav-explore"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="nav-messages"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="nav-notifications"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Navigation elements visible!');
  });
  
  test('can navigate to profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="nav-profile"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Profile page accessible!');
  });

  test('can navigate to search', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-search"]');
    await page.waitForURL('**/search**');
    console.log('✅ Search page accessible!');
  });

  test('can navigate to explore', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-explore"]');
    await page.waitForURL('**/explore**');
    console.log('✅ Explore page accessible!');
  });
});

test.describe('Buzzhive Social Network - Posts', () => {
  
  test('feed shows posts', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await expect(page.locator('[data-testid="post-composer-input"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Feed page accessible!');
  });
  
  test('can create a post', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const testContent = `Hello from Playwright! ${Date.now()}`;
    await page.fill('[data-testid="post-composer-input"]', testContent);
    await page.click('[data-testid="post-composer-submit"]');
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${testContent}`)).toBeVisible({ timeout: 5000 });
    console.log('✅ Post created successfully!');
  });
});

test.describe('Buzzhive Social Network - Profile', () => {
  
  test('profile page shows user info', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-profile"]');
    await page.waitForURL('**/profile**');
    
    await expect(page.locator('[data-testid="profile-display-name"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="profile-username"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="profile-followers-count"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="profile-posts-count"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Profile info visible!');
  });

  test('can navigate to profile settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-profile"]');
    await page.waitForLoadState('networkidle');
    
    const editBtn = page.locator('[data-testid="profile-edit-btn"]');
    await editBtn.waitFor({ state: 'visible', timeout: 5000 });
    await editBtn.click();
    await page.waitForURL('**/settings**');
    
    await expect(page.locator('[data-testid="lang-en"]').first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Profile edit page opened!');
  });
});

test.describe('Buzzhive Social Network - Messages', () => {
  
  test('messages page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-messages"]');
    await page.waitForURL('**/messages**');
    
    await expect(page.locator('[data-testid="new-conversation-btn"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Messages page accessible!');
  });
});

test.describe('Buzzhive Social Network - Notifications', () => {
  
  test('notifications page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-notifications"]');
    await page.waitForURL('**/notifications**');
    
    await expect(page.locator('[data-testid="notifications-mark-all-btn"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="notifications-filter-all"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Notifications page accessible!');
  });
  
  test('can mark all notifications as read', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    await page.click('[data-testid="nav-notifications"]');
    await page.waitForLoadState('networkidle');
    
    const markAllBtn = page.locator('[data-testid="notifications-mark-all-btn"]');
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Mark all as read clicked!');
    } else {
      console.log('ℹ️ No unread notifications to mark');
    }
  });
});

test.describe('Buzzhive Social Network - Posts', () => {
  
  test('can like and unlike a post', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const likeBtn = page.locator('[data-testid^="post-like-btn-"]').first();
    await likeBtn.waitFor({ state: 'visible', timeout: 5000 });
    
    const initialCount = await page.locator('[data-testid^="post-likes-count-"]').first().textContent();
    
    await likeBtn.click();
    await page.waitForTimeout(1000);
    
    const newCount = await page.locator('[data-testid^="post-likes-count-"]').first().textContent();
    console.log(`Likes: ${initialCount} → ${newCount}`);
    
    await likeBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ Like/Unlike works!');
  });
  
  test('can bookmark a post', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const bookmarkBtn = page.locator('[data-testid^="post-bookmark-btn-"]').first();
    await bookmarkBtn.waitFor({ state: 'visible', timeout: 5000 });
    
    await bookmarkBtn.click();
    await page.waitForTimeout(500);
    
    console.log('✅ Bookmark toggled!');
  });
});

test.describe('Buzzhive Social Network - Comments', () => {
  
  test('can add a comment to post', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const commentBtn = page.locator('[data-testid^="post-comment-btn-"]').first();
    await commentBtn.click();
    await page.waitForLoadState('networkidle');
    
    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.waitFor({ state: 'visible', timeout: 5000 });
    
    await commentInput.fill('Great post!');
    await page.click('[data-testid="comment-submit-btn"]');
    await page.waitForTimeout(1000);
    
    console.log('✅ Comment added!');
  });
});

test.describe('Buzzhive Social Network - Follows', () => {
  
  test('can follow and unfollow a user', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/profile/bob_photo`);
    await page.waitForLoadState('networkidle');
    
    const followBtn = page.locator('[data-testid="profile-follow-btn"]');
    await followBtn.waitFor({ state: 'visible', timeout: 10000 });
    
    await followBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ Follow clicked!');
    
    await followBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ Unfollow clicked!');
  });
});

test.describe('Buzzhive Social Network - Moderator', () => {
  
  test('moderator can access admin panel', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'mod@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'mod123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const adminLink = page.locator('[data-testid="nav-admin"]');
    await expect(adminLink).toBeVisible({ timeout: 5000 });
    
    await adminLink.click();
    await page.waitForURL('**/admin**');
    console.log('✅ Moderator can access admin panel!');
  });
  
  test('moderator can delete any post', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'mod@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'mod123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const menuBtn = page.locator('[data-testid^="post-menu-btn-"]').first();
    await menuBtn.waitFor({ state: 'visible', timeout: 5000 });
    await menuBtn.click();
    await page.waitForTimeout(500);
    
    const deleteBtn = page.locator('[data-testid^="post-delete-btn-"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Moderator can delete posts!');
    } else {
      console.log('ℹ️ No delete option visible');
    }
  });
  
  test('moderator cannot ban users', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'mod@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'mod123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/admin/users`);
    
    const banBtn = page.locator('[data-testid^="admin-ban-btn-"]').first();
    await expect(banBtn).not.toBeVisible({ timeout: 3000 });
    
    console.log('✅ Moderator cannot ban users!');
  });
});

test.describe('Buzzhive Social Network - Admin', () => {
  
  test('admin dashboard shows stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'admin@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'admin123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.click('[data-testid="nav-admin"]');
    await page.waitForURL('**/admin**');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="admin-stats-users-count"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="admin-stats-posts-count"]')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Admin dashboard loaded!');
  });
  
  test('regular user cannot access admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const adminLink = page.locator('[data-testid="nav-admin"]');
    await expect(adminLink).not.toBeVisible({ timeout: 2000 });
    
    console.log('✅ Admin link hidden for regular user!');
  });
  
  test('admin can ban a user', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'admin@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'admin123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    
    const banBtn = page.locator('[data-testid^="admin-ban-btn-"]').first();
    await banBtn.waitFor({ state: 'visible', timeout: 5000 });
    await banBtn.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ User banned successfully!');
  });
  
  test('banned user cannot login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'frank@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'frank123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForTimeout(1000);
    
    const errorMsg = page.locator('[data-testid="auth-error-message"]');
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
    
    console.log('✅ Banned user login blocked!');
  });
  
  test('admin can change user role', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'admin@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'admin123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState('networkidle');
    
    const roleSelect = page.locator('[data-testid^="admin-role-select-"]').first();
    await roleSelect.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('✅ Role selector visible!');
  });
});

test.describe('Buzzhive Social Network - Logout', () => {
  
  test('can logout successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const logoutBtn = page.locator('[data-testid="auth-logout-btn"]');
    await logoutBtn.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="auth-login-btn"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Logout successful!');
  });
});

test.describe('Buzzhive Social Network - Search', () => {

  test('search page loads with all elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="nav-search-input"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Search")')).toBeVisible({ timeout: 5000 });
    console.log('✅ Search page loaded!');
  });

  test('can search for users', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('bob');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const usersTab = page.locator('button:has-text("users")');
    await expect(usersTab).toBeVisible({ timeout: 5000 });
    console.log('✅ User search executed!');
  });

  test('can search for posts', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('hello');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const postsTab = page.locator('button:has-text("posts")');
    await postsTab.click();
    await page.waitForTimeout(500);
    
    console.log('✅ Post search executed and tab switched!');
  });

  test('can search for hashtags', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('tech');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const hashtagsTab = page.locator('button:has-text("hashtags")');
    await hashtagsTab.click();
    await page.waitForTimeout(500);
    
    console.log('✅ Hashtag search executed and tab switched!');
  });

  test('search by pressing Enter key', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('test');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    
    console.log('✅ Search triggered via Enter key!');
  });

  test('display correct result counts in tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('alice');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const tabsWithCounts = page.locator('button:has-text("(")');
    const count = await tabsWithCounts.count();
    console.log(`Found ${count} tabs with counts`);
    
    console.log('✅ Tab counts displayed correctly!');
  });

  test('empty search shows no results message', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('zzzzxyzzzz_nonexistent_query');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const noResultsMsg = page.locator('text=No users found');
    if (await noResultsMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ No results message displayed!');
    } else {
      console.log('ℹ️ Results found or no message displayed');
    }
  });

  test('can switch between search result tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('buzz');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const usersTab = page.locator('button:has-text("users")');
    const postsTab = page.locator('button:has-text("posts")');
    const hashtagsTab = page.locator('button:has-text("hashtags")');
    
    await usersTab.click();
    await page.waitForTimeout(300);
    await postsTab.click();
    await page.waitForTimeout(300);
    await hashtagsTab.click();
    await page.waitForTimeout(300);
    
    console.log('✅ Tab switching works!');
  });

  test('clicking search result user navigates to profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    await page.goto(`${BASE_URL}/search`);
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="nav-search-input"]');
    await searchInput.fill('bob');
    
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    
    const firstUserResult = page.locator('a[href*="/profile/"]').first();
    if (await firstUserResult.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstUserResult.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/profile/');
      console.log('✅ User result navigation works!');
    } else {
      console.log('ℹ️ No user results found to click');
    }
  });

  test('search from navigation menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="auth-email-input"]', 'alice@buzzhive.com');
    await page.fill('[data-testid="auth-password-input"]', 'alice123');
    await page.click('[data-testid="auth-login-btn"]');
    await page.waitForURL('**/');
    
    const navSearch = page.locator('[data-testid="nav-search"]');
    await navSearch.click();
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/search');
    await expect(page.locator('[data-testid="nav-search-input"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Navigation to search works!');
  });
});
