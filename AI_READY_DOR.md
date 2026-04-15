# Buzzhive - AI-Readable System Specification

**Purpose:** Machine-readable requirements for AI agents (Ollama, Copilot, etc.)
**Version:** 1.2 | **Date:** 2026-04-15

---

## 1. SYSTEM OVERVIEW

**Buzzhive** — социальная сеть (social network).

### Test Environment
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Test Accounts
| Email | Password | Role |
|-------|----------|------|
| alice@buzzhive.com | alice123 | user |
| bob@buzzhive.com | bob123 | user |
| admin@buzzhive.com | admin123 | admin |
| mod@buzzhive.com | mod123 | moderator |
| frank@buzzhive.com | frank123 | banned |

---

## 2. DATA MODELS

### User
```typescript
interface User {
  id: string;                    // UUID
  email: string;                  // required, unique
  username: string;               // required, unique
  display_name: string;           // required
  bio: string | null;             // optional
  avatar_url: string | null;      // optional
  cover_url: string | null;       // optional
  role: "user" | "moderator" | "admin";
  is_active: boolean;              // false = banned
  is_verified: boolean;
  is_private: boolean;
  created_at: string;              // ISO8601
  updated_at: string;              // ISO8601
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following?: boolean;          // from other user view
  is_followed_by?: boolean;
}
```

### Post
```typescript
interface Post {
  id: string;                      // UUID
  author: Author;                  // nested object
  content: string;                  // required, max 2000 chars
  image_url: string | null;
  is_pinned: boolean;
  is_deleted: boolean;              // soft delete flag
  parent_id: string | null;        // for comments/reposts
  repost_type: string | null;
  visibility: "public" | "private" | "unlisted";
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  hashtags: Hashtag[];
  created_at: string;
  updated_at: string;
  is_liked: boolean;
  is_bookmarked: boolean;
  user_reaction: string | null;
}

interface Author {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

interface Hashtag {
  id: string;
  name: string;
  posts_count: number;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  actor: Author;
  type: "like" | "comment" | "follow" | "repost" | "mention";
  target_type: string | null;
  target_id: string | null;
  is_read: boolean;
  created_at: string;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  is_group: boolean;
  name: string | null;
  participants: Participant[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender: Author;
  content: string;
  image_url: string | null;
  is_deleted: boolean;
  created_at: string;
}
```

### AuthTokens
```typescript
interface AuthTokens {
  access_token: string;           // JWT
  refresh_token: string;           // JWT
  token_type: string;              // "Bearer"
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
```

---

## 3. API ENDPOINTS

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | Returns JWT tokens |
| POST | /api/auth/register | No | Create new user |
| POST | /api/auth/refresh | No | Refresh access token |
| POST | /api/auth/logout | Yes | Revoke refresh token |
| GET | /api/auth/me | Yes | Current user profile |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts | No | List all posts |
| POST | /api/posts | Yes | Create post |
| GET | /api/posts/feed | Yes | Feed (followed users) |
| GET | /api/posts/{id} | No | Single post |
| PATCH | /api/posts/{id} | Yes | Edit post |
| DELETE | /api/posts/{id} | Yes | Delete post (owner) |
| POST | /api/posts/{id}/like | Yes | Like post |
| DELETE | /api/posts/{id}/like | Yes | Unlike post |
| POST | /api/posts/{id}/comments | Yes | Add comment |
| GET | /api/posts/{id}/comments | No | List comments |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/users | No | List users |
| GET | /api/users/{username} | No | User profile |
| GET | /api/users/{username}/posts | No | User posts |
| POST | /api/users/{username}/follow | Yes | Follow user |
| DELETE | /api/users/{username}/follow | Yes | Unfollow |
| GET | /api/users/{username}/followers | No | Followers list |
| GET | /api/users/{username}/following | No | Following list |

### Messages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/conversations | Yes | List conversations |
| POST | /api/conversations/dm/{username} | Yes | Start DM |
| GET | /api/conversations/{id} | Yes | Get messages |
| POST | /api/conversations/{id}/read | Yes | Mark read |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/notifications | Yes | List notifications |
| GET | /api/notifications/unread-count | Yes | Unread count |
| POST | /api/notifications/read-all | Yes | Mark all read |
| POST | /api/notifications/{id}/read | Yes | Mark one read |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | User list |
| PATCH | /api/admin/users/{id} | Admin | Update user |
| DELETE | /api/admin/users/{id} | Admin | Delete user |
| GET | /api/admin/posts | Admin | All posts |
| DELETE | /api/admin/posts/{id} | Mod+ | Delete any post |

### System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/reset | No | Reset DB |

---

## 4. ERROR CODES

### HTTP Status Codes

| Code | Type | Meaning | Example |
|------|------|---------|---------|
| 200 | OK | Success | Normal response |
| 201 | Created | Resource created | POST /posts |
| 204 | No Content | Success, no body | DELETE |
| 400 | Bad Request | Invalid input | Banned user login |
| 401 | Unauthorized | No/invalid token | Wrong password |
| 403 | Forbidden | No permission | User accessing admin |
| 404 | Not Found | Resource missing | Invalid UUID |
| 409 | Conflict | Duplicate action | Double like |
| 422 | Unprocessable | Validation failed | Invalid email |
| 500 | Server Error | Backend bug | Token refresh |

### Error Response Format
```json
{
  "detail": "Human-readable message",
  "error_code": "ERROR_CODE_NAME",
  "status_code": 400
}
```

### Validation Error Format (422)
```json
{
  "detail": [
    {
      "type": "missing" | "string_too_long" | "value_error",
      "loc": ["body", "field_name"],
      "msg": "Human-readable error",
      "input": "actual_value",
      "ctx": {}
    }
  ]
}
```

---

## 5. STATE MACHINES

### AUTH States
```
unauthenticated → authenticated (login)
authenticated → unauthenticated (logout)
* → blocked (admin bans user)
```

### POST States
```
none → published (POST)
published → published (PATCH, within time limit)
published → deleted (DELETE, soft)
```

### FOLLOW States
```
not_followed → followed (public user)
not_followed → pending (private user)
pending → followed (accept)
pending → not_followed (reject)
followed → not_followed (unfollow)
```

### LIKE States
```
not_liked → liked (POST /like)
liked → not_liked (DELETE /like)
liked → 409 (double like)
```

### NOTIFICATION States
```
unread → read (mark one)
unread → read (mark all)
```

### USER States (Admin)
```
active → banned (DELETE /admin/users/{id})
banned → active (PATCH /admin/users/{id}, is_active: true)
```

---

## 6. CONSTRAINTS

### Field Limits
| Field | Min | Max | Type |
|-------|-----|-----|------|
| post.content | 1 | 2000 | chars |
| user.username | 3 | 30 | chars |
| user.password | 6 | ∞ | chars |
| user.display_name | 1 | 100 | chars |
| image | - | 5MB | size |
| image | - | JPEG/PNG/GIF/WebP | format |

### Validation Rules
- email: valid email format, unique
- username: alphanumeric + underscore, unique
- password: minimum 6 characters (backend validates)
- post content: no script tags (XSS prevention)
- UUID fields: must be valid UUID v4 format

---

## 7. INVARIANTS

### Must Always Hold
```
1. post.like_count >= 0
2. post.comments_count >= 0
3. user.followers_count >= 0
4. user.following_count >= 0
5. conversation.unread_count >= 0
6. notification.is_read is boolean
7. deleted post not visible in feed (returns 404)
8. banned user cannot login
9. regular user cannot access /api/admin/*
10. JWT contains sub, exp, iat claims
```

---

## 8. ROLES & PERMISSIONS

| Role | Can Do |
|------|--------|
| user | Posts, comments, follow, DM, like, bookmark |
| moderator | Delete any post |
| admin | Ban users, change roles, full moderation |
| banned | Nothing (is_active=false) |

---

## 9. TESTING NOTES

### Selectors (data-testid) — VERIFIED
These selectors are confirmed to exist in the UI:

**Auth:**
- `auth-email-input`
- `auth-password-input`
- `auth-login-btn`
- `auth-logout-btn`
- `auth-register-btn`
- `auth-username-input`
- `auth-display-name-input`
- `auth-error-message`

**Navigation:**
- `nav-feed`
- `nav-profile`
- `nav-explore`
- `nav-messages`
- `nav-notifications`
- `nav-search`
- `nav-search-input`
- `nav-admin`

**Posts:**
- `post-composer-input`
- `post-composer-submit`
- `comment-input`
- `comment-submit-btn`

**Profile:**
- `profile-username`
- `profile-display-name`
- `profile-avatar`
- `profile-follow-btn`
- `profile-followers-count`
- `profile-posts-count`

**Notifications:**
- `notifications-filter-all`
- `notifications-mark-all-btn`

**Messages:**
- `new-conversation-btn`

**Admin:**
- `admin-stats-posts-count`
- `admin-stats-users-count`

### ⚠️ AI-GUESSED SELECTORS (NOT VERIFIED)
AI may suggest selectors that don't exist. ALWAYS verify against actual codebase.
Common AI hallucinations: `register-email-input`, `post-content-input`, `notification-item`, etc.

### Security Tests
- XSS: `<script>` rendered as plain text
- SQL injection: content sanitized
- CSRF: Bearer token required

---

## 10. AI-GENERATED TEST CASES

Generated by Groq Llama 3.3 70B on 2026-04-15. Priority: HIGH.

### Auth
```gherkin
Given: Registration with password "abcde" (5 chars, min is 6)
When: POST /api/auth/register
Then: 422 Unprocessable with password validation error
```

```gherkin
Given: Frank (banned) attempts login
When: POST /api/auth/login with frank@buzzhive.com
Then: 400 Bad Request (account suspended)
```

### Posts
```gherkin
Given: User tries to edit post after time limit exceeded
When: PATCH /api/posts/{id} with expired edit window
Then: 403 Forbidden or 400 Bad Request
```

### Follow
```gherkin
Given: Alice follows Bob, concurrent unfollow request from Bob
When: Simultaneous follow/unfollow race condition
Then: Final state is consistent (either followed or not, no orphaned state)
```

### Notifications
```gherkin
Given: Moderator deletes Alice's post
When: DELETE /api/admin/posts/{id}
Then: Alice receives a "post deleted by moderator" notification
```

```gherkin
Given: Mark one notification as read
When: POST /api/notifications/{id}/read
Then: GET /api/notifications/unread-count returns count - 1
```

### Pagination
```gherkin
Given: User has 100 followers, page size is 20
When: GET /api/users/{username}/followers?page=3
Then: Returns followers 41-60, total=100, pages=5
```

### Unlisted Visibility
```gherkin
Given: Alice creates unlisted post
When: Bob has direct link to post
Then: Post is accessible with link
When: Bob searches public feed or user posts
Then: Post is NOT visible in results
```

---

## 11. OPEN QUESTIONS (from AI Review)

1. **Comment character limit** — Is it same as post (2000)? Not specified.
2. **Unlisted visibility** — Exact behavior unclear.
3. **Post edit time limit** — "within time limit" mentioned but duration not specified.
4. **Admin stats** — What metrics included?
5. **Moderation criteria** — What triggers admin intervention?
6. **Private account posts** — Who can see them before following?
7. **Image upload** — Any crop/resize validation?

---

*This spec is complete and machine-readable. AI agents can generate tests directly from this document without access to implementation code.*
