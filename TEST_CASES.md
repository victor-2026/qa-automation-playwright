# Test Cases - Buzzhive Social Network

55+ test cases for QA automation practice.

---

## Auth

### TC-AUTH-001: Successful login
**Priority:** critical | **Type:** UI

**Preconditions:** DB in default state. User alice_dev exists and is active.

**Steps:**
1. Open /login
2. Enter email: alice@buzzhive.com
3. Enter password: alice123
4. Click "Sign in"

**Expected:** Redirect to /. Sidebar shows "Alice Developer". Feed loads.

**Selectors:** `auth-email-input`, `auth-password-input`, `auth-login-btn`

---

### TC-AUTH-002: Login with wrong password
**Priority:** critical | **Type:** UI

**Preconditions:** DB in default state.

**Steps:**
1. Open /login
2. Enter email: alice@buzzhive.com
3. Enter password: wrongpass
4. Click "Sign in"

**Expected:** Error message visible: "Invalid email or password". Stay on /login.

**Selectors:** `auth-email-input`, `auth-password-input`, `auth-login-btn`, `auth-error-message`

---

### TC-AUTH-003: Login with banned account
**Priority:** high | **Type:** Integration

**Preconditions:** User frank_banned exists with is_active=false.

**Steps:**
1. Open /login
2. Enter email: frank@buzzhive.com
3. Enter password: frank123
4. Click "Sign in"

**Expected:** Error: "Account is deactivated". No redirect. No token stored.

**API:** `POST /api/auth/login`

---

### TC-AUTH-004: Register new account
**Priority:** critical | **Type:** UI

**Preconditions:** Email and username must not already exist in DB.

**Steps:**
1. Open /register
2. Enter display name: "Test User"
3. Enter username: testuser_123
4. Enter email: testuser@example.com
5. Enter password: test123
6. Click "Create account"

**Expected:** Redirect to /login with success toast. Login with new credentials works.

**Selectors:** `auth-display-name-input`, `auth-username-input`, `auth-email-input`, `auth-password-input`, `auth-register-btn`

---

### TC-AUTH-005: Register with duplicate email
**Priority:** high | **Type:** API

**Preconditions:** User alice_dev already exists.

**Steps:**
1. POST /api/auth/register with body: `{"email":"alice@buzzhive.com","username":"newuser","password":"pass123","display_name":"New"}`

**Expected:** 409 Conflict: `{"detail":"User with this email or username already exists"}`

**API:** `POST /api/auth/register`

---

### TC-AUTH-006: Token refresh flow
**Priority:** high | **Type:** API

**Preconditions:** Valid refresh_token obtained from login.

**Steps:**
1. POST /api/auth/login to get access_token + refresh_token
2. Wait for access_token to expire (or manually use expired one)
3. GET /api/auth/me with expired token → 401
4. POST /api/auth/refresh with refresh_token
5. GET /api/auth/me with new access_token → 200

**Expected:** Expired token returns 401. Refresh returns new token pair. New token works.

**API:** `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`

---

### TC-AUTH-007: Quick login buttons fill form
**Priority:** medium | **Type:** UI

**Preconditions:** On /login page.

**Steps:**
1. Click "Admin" quick login button
2. Check email and password fields

**Expected:** Email = admin@buzzhive.com, Password = admin123.

**Selectors:** `auth-email-input`, `auth-password-input`

---

### TC-AUTH-008: Username validation rejects spaces
**Priority:** medium | **Type:** UI

**Preconditions:** On /register page.

**Steps:**
1. Enter username: "bad user" (with space)
2. Submit form

**Expected:** Validation error. Username must match `^[a-zA-Z0-9_]+$`.

**Selectors:** `auth-username-input`, `auth-register-btn`

---

### TC-AUTH-009: Login with wrong email
**Priority:** high | **Type:** UI

**Preconditions:** On /login page.

**Steps:**
1. Enter wrong email: wrong@buzzhive.com
2. Enter valid password: alice123
3. Click "Sign in"

**Expected:** Error message visible: "Invalid email or password". Stay on /login. No tokens stored.

**Selectors:** `auth-email-input`, `auth-password-input`, `auth-login-btn`, `auth-error-message`

---

### TC-AUTH-010: SQL injection in login fields is blocked
**Priority:** critical | **Type:** Security

**Preconditions:** On /login page.

**Test Data (SQL Injection Payloads):**
- `' OR '1'='1`
- `admin'--`
- `' OR 1=1--`
- `'; DROP TABLE users;--`

**Test Data (XSS Payloads):**
- `<script>alert("XSS")</script>`
- `"><img src=x onerror=alert(1)>`
- `javascript:alert('XSS')`

**Steps:**
1. Enter SQL injection payload in email field
2. Enter any password
3. Click "Sign in"
4. Repeat for password field
5. Repeat for XSS payloads

**Expected:** 
- Error shown "Invalid email or password"
- No successful login
- No script execution
- Stay on /login page

**Security Check:** No SQL error messages exposed to user.

---

### TC-AUTH-011: Password Boundary Tests
**Priority:** critical | **Type:** Edge Case

**System Limits:**
- Password Minimum: 6 characters

**Test Data:**
| Password | Length | Expected Result |
|----------|--------|-----------------|
| `a` | 1 | ❌ HTML5 validation rejects (< minlength=6) |
| `123456` | 6 | ✅ Accepted (but wrong password → error) |
| `a`.repeat(1000) | 1000 | ✅ Handled (wrong password → error) |
| `a`.repeat(3001) | 3001 | ✅ Handled (wrong password → error) |

**Steps:**
1. Enter 1 character password
2. Verify HTML5 validation blocks submit
3. Enter 6 character password
4. Verify accepted (but shows wrong password error)
5. Enter very long passwords
6. Verify system handles gracefully

**Expected:**
- Short passwords blocked by HTML5 validation
- Long passwords accepted but show wrong password error
- No crashes or errors with extreme lengths

---

## Posts

### TC-POST-001: Create a new post
**Priority:** critical | **Type:** UI

**Preconditions:** Logged in as any active user.

**Steps:**
1. Navigate to / (Feed)
2. Type "Hello from automation!" in composer
3. Click "Post" button

**Expected:** Post appears at top of feed. Toast: "Post created!". Counter resets.

**Selectors:** `post-composer-input`, `post-composer-submit`

---

### TC-POST-002: Post with hashtags auto-links
**Priority:** high | **Type:** Integration

**Preconditions:** Logged in as any user.

**Steps:**
1. Create post: "Testing #automation today"
2. Check that #automation is rendered as a link
3. Click the hashtag link
4. Verify Explore page opens with hashtag filter

**Expected:** Hashtag rendered as clickable link. Explore shows posts tagged #automation.

**API:** `POST /api/posts`, `GET /api/posts?hashtag=automation`

---

### TC-POST-003: Like and unlike a post
**Priority:** critical | **Type:** UI

**Preconditions:** Logged in. At least one post visible. Post is NOT already liked.

**Steps:**
1. Note current like count on a post
2. Click like button (heart icon)
3. Verify count +1 and heart is filled red
4. Click like button again
5. Verify count -1 and heart is outline

**Expected:** Like toggles. Count increments/decrements. Heart state changes. State persists on page reload.

**Selectors:** `post-like-btn-{id}`, `post-likes-count-{id}`

---

### TC-POST-004: Bookmark and view bookmarks
**Priority:** high | **Type:** UI

**Preconditions:** Logged in. Post is not bookmarked.

**Steps:**
1. Click bookmark icon on a post
2. Verify icon becomes filled
3. Navigate to /bookmarks
4. Verify the post appears in bookmarks list

**Expected:** Bookmark icon toggles. Post appears in /bookmarks.

**Selectors:** `post-bookmark-btn-{id}`, `nav-bookmarks`

---

### TC-POST-005: Delete own post
**Priority:** high | **Type:** UI

**Preconditions:** Logged in as alice_dev. At least one own post exists.

**Steps:**
1. Click (...) menu on own post
2. Click "Delete"
3. Confirm in dialog

**Expected:** Post disappears from feed immediately.

**Selectors:** `post-menu-btn-{id}`, `post-delete-btn-{id}`

---

### TC-POST-006: Moderator soft-deletes post
**Priority:** high | **Type:** Integration

**Preconditions:** Logged in as moderator. Target post exists.

**Steps:**
1. Find any user post in feed
2. Click (...) menu → Delete
3. Login as admin → /admin/content
4. Verify post shows as [DELETED]

**Expected:** Post removed from public feed. Visible in admin with [DELETED] tag.

**API:** `DELETE /api/posts/{id}`, `GET /api/admin/posts?is_deleted=true`

---

### TC-POST-007: Post at max length (2000 chars)
**Priority:** medium | **Type:** Edge Case

**Preconditions:** Logged in. Seed post with 2000 characters exists (post_24).

**Steps:**
1. Open composer
2. Enter exactly 2000 characters
3. Verify counter shows 2000/2000
4. Submit

**Expected:** Post created. Counter accurate. Long post renders with proper word-wrap.

**Selectors:** `post-composer-input`, `post-composer-submit`

---

### TC-POST-008: XSS attempt in post content
**Priority:** critical | **Type:** Security

**Preconditions:** Seed data loaded. Post with `<script>alert("xss")</script>` exists (post_25).

**Steps:**
1. Navigate to feed or explore
2. Find the seed post with script tag content
3. Inspect DOM - verify no `<script>` element exists
4. Verify content displayed as plain text

**Expected:** Script tag rendered as text. No JavaScript execution. No console errors.

**Selectors:** `post-content-{id}`

---

## Comments

### TC-COM-001: Add comment to post
**Priority:** critical | **Type:** UI

**Preconditions:** Logged in. On a post detail page (/post/{id}).

**Steps:**
1. Type "Great post!" in comment input
2. Click send button
3. Verify comment appears in list

**Expected:** Comment appears. Post comments_count increments. Toast shown.

**Selectors:** `comment-input`, `comment-submit-btn`

---

### TC-COM-002: Reply to a comment (nested)
**Priority:** high | **Type:** UI

**Preconditions:** Post has at least one comment.

**Steps:**
1. Click "Reply" on a comment
2. Verify "Replying to @username" label appears
3. Type reply text
4. Click submit

**Expected:** Reply appears indented under parent comment.

**Selectors:** `comment-reply-btn-{id}`, `comment-input`, `comment-submit-btn`

---

### TC-COM-003: Like a comment
**Priority:** medium | **Type:** UI

**Preconditions:** On post detail page with comments.

**Steps:**
1. Click heart icon on a comment
2. Verify count +1, heart turns red

**Expected:** Comment like toggles correctly.

**Selectors:** `comment-like-btn-{id}`

---

## Follows

### TC-FOL-001: Follow a public user
**Priority:** critical | **Type:** UI

**Preconditions:** Logged in as eve_new. eve does NOT follow bob_photo.

**Steps:**
1. Navigate to /profile/bob_photo
2. Click "Follow" button
3. Verify button changes to "Unfollow"
4. Verify followers count incremented

**Expected:** Follow created. Button state changes. bob_photo receives "follow" notification.

**Selectors:** `profile-follow-btn`, `profile-followers-count`

**API:** `POST /api/users/bob_photo/follow`

---

### TC-FOL-002: Follow request for private account
**Priority:** high | **Type:** Integration

**Preconditions:** Logged in as eve_new. dave_quiet is a private account.

**Steps:**
1. Navigate to /profile/dave_quiet
2. Verify button says "Request to Follow"
3. Click button
4. Login as dave_quiet → check notifications

**Expected:** Follow status = "pending". dave sees follow_request notification.

**Selectors:** `profile-follow-btn`

---

### TC-FOL-003: Unfollow a user
**Priority:** high | **Type:** UI

**Preconditions:** Logged in as alice_dev who follows bob_photo.

**Steps:**
1. Navigate to /profile/bob_photo
2. Verify button shows "Unfollow"
3. Click "Unfollow"
4. Verify button changes to "Follow"

**Expected:** Follow removed. Button reverts. Feed updates.

**Selectors:** `profile-follow-btn`, `profile-followers-count`

---

### TC-FOL-005: Followers and following lists
**Priority:** medium | **Type:** UI

**Preconditions:** User alice_dev has followers and follows others.

**Steps:**
1. Navigate to /profile/alice_dev
2. Click Followers count → /profile/alice_dev/followers
3. Verify list shows users
4. Go back, click Following count → /profile/alice_dev/following

**Expected:** Both lists render with user avatars, names, and @usernames.

**Selectors:** `profile-followers-count`, `profile-following-count`

---

## Messages

### TC-MSG-001: Start new DM conversation
**Priority:** critical | **Type:** UI

**Preconditions:** Logged in. No existing DM with target user.

**Steps:**
1. Navigate to /messages
2. Click "New message"
3. Type "bob" in search field
4. Click on Bob in results

**Expected:** Conversation page opens. Can type and send messages.

**Selectors:** `new-conversation-btn`, `new-conversation-search`, `new-conversation-modal`

---

### TC-MSG-002: Send a message
**Priority:** critical | **Type:** UI

**Preconditions:** Inside a conversation page.

**Steps:**
1. Type "Hello!" in message input
2. Press Enter (or click Send)
3. Verify message appears as right-aligned blue bubble
4. Verify input clears

**Expected:** Message sent and displayed. Right-aligned with timestamp.

**Selectors:** `message-input`, `message-send-btn`, `message-{id}`

---

### TC-MSG-003: Unread messages badge
**Priority:** high | **Type:** UI

**Preconditions:** Login as bob_photo. alice has sent unread messages to bob.

**Steps:**
1. Check sidebar Messages nav item

**Expected:** Red badge with unread count visible on Messages icon.

**Selectors:** `nav-messages`, `nav-messages-badge`

---

## Notifications

### TC-NOT-001: Unread badge in sidebar
**Priority:** critical | **Type:** UI

**Preconditions:** Login as alice_dev who has unread notifications (seed data).

**Steps:**
1. Check sidebar Notifications icon

**Expected:** Red badge with number appears on icon.

**Selectors:** `nav-notifications`, `nav-notifications-badge`

---

### TC-NOT-002: Mark all as read
**Priority:** high | **Type:** UI

**Preconditions:** User has unread notifications.

**Steps:**
1. Open /notifications
2. Click "Mark all read" button
3. Verify all notification highlights removed
4. Verify sidebar badge disappears

**Expected:** All marked read. Badge removed from sidebar.

**Selectors:** `notifications-mark-all-btn`, `nav-notifications-badge`

---

## Search

### TC-SRC-001: Search users by name
**Priority:** high | **Type:** UI

**Preconditions:** Seed data loaded. On /search page.

**Steps:**
1. Type "alice" in search input
2. Press Enter
3. Check Users tab

**Expected:** alice_dev appears in results. Click navigates to profile.

**Selectors:** `nav-search-input`

---

### TC-SRC-002: Search posts by content
**Priority:** high | **Type:** UI

**Preconditions:** Seed data loaded.

**Steps:**
1. Search "debugging"
2. Check Posts tab

**Expected:** Alice's "debugging at 2am" post appears.

**Selectors:** `nav-search-input`

---

### TC-SRC-003: Search hashtags
**Priority:** medium | **Type:** UI

**Preconditions:** Seed data loaded.

**Steps:**
1. Search "coding"
2. Check Hashtags tab

**Expected:** #coding shown with correct post count.

**Selectors:** `nav-search-input`

---

### TC-SRC-004: Empty search results
**Priority:** low | **Type:** UI

**Preconditions:** On /search page.

**Steps:**
1. Search "zzzznonexistent"

**Expected:** All tabs show 0 results with "No X found" messages.

**Selectors:** `nav-search-input`

---

## Admin

### TC-ADM-001: Dashboard shows stats
**Priority:** high | **Type:** UI

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate to /admin
2. Check stats cards

**Expected:** Cards show total users, active users, total posts, comments, messages.

**Selectors:** `admin-stats-users-count`, `admin-stats-posts-count`, `nav-admin`

---

### TC-ADM-002: Ban a user
**Priority:** critical | **Type:** Integration

**Preconditions:** Logged in as admin. Target user is active.

**Steps:**
1. Go to /admin/users
2. Find alice_dev row
3. Click "Ban" button
4. Logout
5. Try to login as alice_dev

**Expected:** User banned (is_active=false). alice_dev login fails with "Account is deactivated".

**Selectors:** `admin-ban-btn-{id}`, `admin-user-row-{id}`

**API:** `PATCH /api/admin/users/{id}`

---

### TC-ADM-003: Change user role
**Priority:** high | **Type:** UI

**Preconditions:** Logged in as admin.

**Steps:**
1. Go to /admin/users
2. Find eve_new
3. Change role dropdown to "moderator"
4. Logout, login as eve_new

**Expected:** eve_new now sees Admin nav link in sidebar.

**Selectors:** `admin-role-select-{id}`, `nav-admin`

---

### TC-ADM-004: Regular user blocked from admin
**Priority:** critical | **Type:** Security

**Preconditions:** Logged in as alice_dev (role=user).

**Steps:**
1. Verify no Admin link in sidebar
2. Manually navigate to /admin
3. Try GET /api/admin/stats with alice token

**Expected:** No admin link visible. API returns 403 Forbidden.

**Selectors:** `nav-admin`

**API:** `GET /api/admin/stats`

---

## System / Edge Cases

### TC-EDGE-001: SQL injection in content is safe
**Priority:** critical | **Type:** Security

**Preconditions:** Seed data loaded. Post with SQL injection exists (post_25).

**Steps:**
1. Find seed post containing: `; DROP TABLE posts; --`
2. Verify it renders as plain text
3. Run SQL: SELECT COUNT(*) FROM posts — verify tables exist

**Expected:** Content is plain text. Database intact. No tables dropped.

**API:** `GET /api/posts`

---

### TC-EDGE-004: Duplicate like returns 409
**Priority:** medium | **Type:** API

**Preconditions:** Logged in. Have access token.

**Steps:**
1. POST /api/posts/{id}/like → 201
2. POST /api/posts/{id}/like again

**Expected:** 409: `{"detail":"Already liked this post","error_code":"CONFLICT"}`

**API:** `POST /api/posts/{id}/like`

---

### TC-EDGE-006: 404 on non-existent resource
**Priority:** medium | **Type:** API

**Preconditions:** Have access token.

**Steps:**
1. GET /api/posts/00000000-0000-0000-0000-000000000999

**Expected:** 404: `{"detail":"Post not found","error_code":"NOT_FOUND"}`

**API:** `GET /api/posts/{id}`

---

### TC-EDGE-007: Upload oversized image (>5MB)
**Priority:** medium | **Type:** API

**Preconditions:** Have a file > 5MB.

**Steps:**
1. POST /api/upload/image with file > 5MB

**Expected:** 400: "File size exceeds 5MB limit".

**API:** `POST /api/upload/image`

---

### TC-EDGE-008: Upload non-image file
**Priority:** medium | **Type:** API

**Preconditions:** Have a .txt or .pdf file.

**Steps:**
1. POST /api/upload/image with .txt file

**Expected:** 400: "Only JPEG, PNG, GIF, WebP images are allowed".

**API:** `POST /api/upload/image`

---

### TC-EDGE-009: Database reset re-seeds data
**Priority:** high | **Type:** Integration

**Preconditions:** Some custom data created.

**Steps:**
1. Create a post via API
2. POST /api/reset
3. GET /api/posts — check custom post is gone
4. Verify seed users exist

**Expected:** All custom data deleted. 8 seed users, 25+ posts restored.

**API:** `POST /api/reset`, `GET /api/posts`, `GET /api/users`

---

## Performance (PERF)

### TC-PERF-001: Page Load Performance
**Priority:** high | **Type:** Performance

**Acceptance Criteria:**
- Login page: < 2 seconds
- Feed page: < 3 seconds
- API response: < 500ms

**Steps:**
1. Measure time to load login page
2. Login and measure feed load time
3. Measure API response times

**Expected:** All pages load within SLA timeframes.

---

### TC-PERF-002: User Action Performance
**Priority:** medium | **Type:** Performance

**Acceptance Criteria:**
- Page navigation: < 1 second
- Post creation: < 2 seconds

**Steps:**
1. Measure navigation time between pages
2. Create a post and measure time

**Expected:** Actions complete within SLA timeframes.

---

### TC-PERF-003: Rapid Actions Handling
**Priority:** medium | **Type:** Performance

**Acceptance Criteria:**
- System handles rapid user actions without crashes
- No race conditions

**Steps:**
1. Perform rapid navigation between pages
2. Submit multiple actions quickly

**Expected:** System handles all actions correctly.

---

## Test Data Reference

| User | Email | Password | Role |
|------|-------|---------|------|
| Admin | admin@buzzhive.com | admin123 | Admin |
| Moderator | mod@buzzhive.com | mod123 | Moderator |
| Alice | alice@buzzhive.com | alice123 | User |
| Bob | bob@buzzhive.com | bob123 | User |
| Carol | carol@buzzhive.com | carol123 | User |
| Dave | dave@buzzhive.com | dave123 | User (Private) |
| Eve | eve@buzzhive.com | eve123 | User (New) |
| Frank | frank@buzzhive.com | frank123 | Banned |
