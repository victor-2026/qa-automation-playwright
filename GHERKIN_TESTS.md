# Gherkin Test Specifications - Buzzhive Social Network

BDD-style test specifications in Gherkin format
Generated: 2026-04-14

---

## Authentication Feature

### Scenario: Successful Login
```gherkin
Feature: User Authentication - Login

  Scenario: Successful login with valid credentials
    Given user is on "/login" page
    And user has valid credentials:
      | email                | password  |
      | alice@buzzhive.com | alice123 |
    When user enters "alice@buzzhive.com" in "auth-email-input"
    And user enters "alice123" in "auth-password-input"
    And user clicks "auth-login-btn"
    Then user should be redirected to "/"
    And JWT "access_token" should be stored in localStorage
    And JWT "refresh_token" should be stored in localStorage
    And "nav-profile" should be visible
```

### Scenario: Login with Wrong Password
```gherkin
  Scenario: Login fails with wrong password
    Given user is on "/login" page
    And user has valid email but wrong password:
      | email                | password      |
      | alice@buzzhive.com | wrongpass    |
    When user enters "alice@buzzhive.com" in "auth-email-input"
    And user enters "wrongpass" in "auth-password-input"
    And user clicks "auth-login-btn"
    Then "auth-error-message" should be visible
    And user should stay on "/login"
    And no tokens should be stored in localStorage
```

### Scenario: Login with Banned Account
```gherkin
  Scenario: Banned user cannot login
    Given user is on "/login" page
    And user "frank@buzzhive.com" has "is_active=false"
    When user enters "frank@buzzhive.com" in "auth-email-input"
    And user enters "frank123" in "auth-password-input"
    And user clicks "auth-login-btn"
    Then "auth-error-message" should show "Account is deactivated"
    And user should stay on "/login"
    And no tokens should be stored in localStorage
```

### Scenario: Registration
```gherkin
Feature: User Authentication - Registration

  Scenario: Successful registration with valid data
    Given user is on "/register" page
    And user has no existing account
    When user enters "Test User" in "auth-display-name-input"
    And user enters "newtestuser" in "auth-username-input"
    And user enters "newtest@test.com" in "auth-email-input"
    And user enters "password123" in "auth-password-input"
    And user clicks "auth-register-btn"
    Then user should be redirected to "/login"
    And success message should be displayed
    And user should be able to login with new credentials
```

### Scenario: Duplicate Email Registration
```gherkin
  Scenario: Registration fails with existing email
    Given user is on "/register" page
    And email "alice@buzzhive.com" already exists
    When user enters "Test User" in "auth-display-name-input"
    And user enters "newuser" in "auth-username-input"
    And user enters "alice@buzzhive.com" in "auth-email-input"
    And user enters "password123" in "auth-password-input"
    And user clicks "auth-register-btn"
    Then error should be displayed
    And API should return 409 Conflict
```

---

## Posts Feature

### Scenario: Create Post
```gherkin
Feature: Post Creation

  Scenario: User can create a new post
    Given user is logged in as "alice@buzzhive.com"
    And user is on "/" (Feed) page
    When user enters "Hello from automation!" in "post-composer-input"
    And user clicks "post-composer-submit"
    Then new post should appear at top of feed
    And success toast should show "Post created!"
    And composer input should be cleared
```

### Scenario: Like and Unlike Post
```gherkin
  Scenario: User can like a post
    Given user is logged in as "alice@buzzhive.com"
    And user is on "/" (Feed) page
    And post "post-1" has 0 likes
    When user clicks "post-like-btn-1"
    Then like count should increase by 1
    And heart icon should be filled red
    And state should persist on page reload

  Scenario: User can unlike a post
    Given user is logged in as "alice@buzzhive.com"
    And user is on "/" (Feed) page
    And user has already liked post "post-1"
    When user clicks "post-like-btn-1"
    Then like count should decrease by 1
    And heart icon should be outline
```

### Scenario: Create Post with Hashtag
```gherkin
  Scenario: Hashtag in post becomes clickable link
    Given user is logged in as "alice@buzzhive.com"
    And user is on "/" (Feed) page
    When user enters "Testing #automation today" in "post-composer-input"
    And user clicks "post-composer-submit"
    Then "#automation" should be rendered as a link
    When user clicks the "#automation" link
    Then user should be on "/explore" page
    And explore should show posts tagged #automation
```

---

## Security Feature

### Scenario: SQL Injection Prevention
```gherkin
Feature: Security - SQL Injection Prevention

  Scenario: SQL injection in password field is blocked
    Given user is on "/login" page
    When user enters "alice@buzzhive.com" in "auth-email-input"
    And user enters "' OR '1'='1" in "auth-password-input"
    And user clicks "auth-login-btn"
    Then user should stay on "/login"
    And no successful login should occur
    And no SQL errors should be exposed

  Scenario: SQL injection in email field is blocked
    Given user is on "/login" page
    When user enters "admin'--" in "auth-email-input"
    And user enters "anypassword" in "auth-password-input"
    And user clicks "auth-login-btn"
    Then user should stay on "/login"
    And no successful login should occur
```

### Scenario: XSS Prevention
```gherkin
  Scenario: XSS in post content is escaped
    Given user is logged in as "alice@buzzhive.com"
    And post exists with content "<script>alert('xss')</script>"
    When user views the post
    Then script should not execute
    And content should be displayed as plain text
    And DevTools console should have no errors
```

---

## Profile Feature

### Scenario: Follow User
```gherkin
Feature: Social - Follow System

  Scenario: User can follow another user
    Given user is logged in as "eve@buzzhive.com"
    And user "eve" does not follow "bob"
    When user navigates to "/profile/bob"
    And user clicks "profile-follow-btn"
    Then button should change to "Unfollow"
    And followers count should increase by 1
    And "bob" should receive follow notification

  Scenario: User can unfollow another user
    Given user is logged in as "alice@buzzhive.com"
    And user "alice" follows "bob"
    When user navigates to "/profile/bob"
    And user clicks "profile-follow-btn"
    Then button should change to "Follow"
    And followers count should decrease by 1
```

### Scenario: Private Account Follow Request
```gherkin
  Scenario: Follow request for private account
    Given user is logged in as "eve@buzzhive.com"
    And user "dave" has is_private=true
    When user navigates to "/profile/dave"
    Then "profile-follow-btn" should show "Request to Follow"
    When user clicks "Request to Follow"
    Then follow status should be "pending"
    And "dave" should see follow request notification
```

---

## Admin Feature

### Scenario: Admin Can Ban User
```gherkin
Feature: Admin - User Management

  Scenario: Admin can ban a user
    Given user is logged in as "admin@buzzhive.com"
    When user navigates to "/admin/users"
    And user finds row with username "alice"
    And user clicks "admin-ban-btn-{user_id}"
    Then user "alice" should have is_active=false
    When user "alice" tries to login
    Then error should show "Account is deactivated"
```

### Scenario: Regular User Cannot Access Admin
```gherkin
  Scenario: Non-admin user blocked from admin panel
    Given user is logged in as "alice@buzzhive.com"
    And user has role "user"
    Then "nav-admin" should not be visible
    When user manually navigates to "/admin"
    Then access should be denied with 403
    And API "GET /api/admin/stats" should return 403
```

### Scenario: Moderator Cannot Ban Users
```gherkin
  Scenario: Moderator role restrictions
    Given user is logged in as "mod@buzzhive.com"
    And user has role "moderator"
    When user navigates to "/admin/users"
    Then "admin-ban-btn" should not be visible
    But user should be able to access content moderation
```

---

## Messages Feature

### Scenario: Send Direct Message
```gherkin
Feature: Direct Messaging

  Scenario: User can send a direct message
    Given user is logged in as "alice@buzzhive.com"
    And user navigates to "/messages"
    When user clicks "new-conversation-btn"
    And user searches for "bob"
    And user clicks on "bob" in results
    Then conversation page should open
    When user enters "Hello!" in "message-input"
    And user presses Enter
    Then message should appear as right-aligned blue bubble
    And timestamp should be displayed
```

---

## Notifications Feature

### Scenario: Notifications
```gherkin
Feature: Notifications

  Scenario: User sees unread notification badge
    Given user "alice" has 3 unread notifications
    When user is on any page
    Then "nav-notifications-badge" should show "3"

  Scenario: User can mark all notifications as read
    Given user is logged in as "alice@buzzhive.com"
    And user has unread notifications
    When user navigates to "/notifications"
    And user clicks "notifications-mark-all-btn"
    Then all notifications should be marked as read
    And "nav-notifications-badge" should be hidden
```

---

## Edge Cases

### Scenario: Post Maximum Length
```gherkin
Feature: Edge Cases - Content Limits

  Scenario: Post at maximum length (2000 chars)
    Given user is logged in as "alice@buzzhive.com"
    And user is on "/" (Feed) page
    When user enters 2000 "A" characters in "post-composer-input"
    Then counter should show "2000/2000"
    When user clicks "post-composer-submit"
    Then post should be created successfully
    And long post should render with proper word-wrap
```

### Scenario: Database Reset
```gherkin
  Scenario: Database reset restores seed data
    Given user has created custom posts
    And user has created custom users
    When user calls "POST /api/reset"
    Then all custom data should be deleted
    And seed users should be restored (8 users)
    And seed posts should be restored (25+ posts)
```

---

## Summary

| Feature | Scenarios |
|---------|-----------|
| Authentication | 5 |
| Posts | 4 |
| Security | 2 |
| Profile/Follows | 3 |
| Admin | 3 |
| Messages | 1 |
| Notifications | 2 |
| Edge Cases | 2 |
| **TOTAL** | **22** |

---

## Running Gherkin Tests

### Installation

```bash
npm install @cucumber/cucumber
```

### Configuration

**cucumber.js:**
```javascript
module.exports = {
  default: {
    format: ['progress-bar', 'summary'],
    paths: ['features/**/*.feature'],
    require: ['features/steps/**/*.js'],
  }
};
```

### Step Definitions

**features/steps/auth.steps.js:**
```javascript
const { chromium } = require('playwright');
const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60000);

let browser;
let page;

Given('I am on the login page', async function() {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('[data-testid="auth-email-input"]', { timeout: 30000 });
});

When('I enter {string} as email', async function(email) {
  await page.fill('[data-testid="auth-email-input"]', email);
});

When('I enter {string} as password', async function(password) {
  await page.fill('[data-testid="auth-password-input"]', password);
});

When('I click the login button', async function() {
  await page.click('[data-testid="auth-login-btn"]');
});

Then('I should be logged in', async function() {
  await page.waitForTimeout(2000);
  // Check authentication state
});

After(async function() {
  if (browser) await browser.close();
});
```

### Running Tests

```bash
npm run test:gherkin
# or
npx cucumber-js --config=cucumber.js
```

### Key Notes

- Use `chromium.launch()` with `--no-sandbox` args for CI
- SPA routing: use base URL `/` not `/auth/login`
- Always wait for `data-testid` selectors
- Use `@cucumber/cucumber` (NOT `@cucumber/playwright`)
