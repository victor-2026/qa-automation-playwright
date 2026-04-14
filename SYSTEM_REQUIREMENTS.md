# Buzzhive Social Network - System Requirements
*Reverse Engineered from Code and Tests*

## 1. SYSTEM FUNCTIONS BY PRIORITY

### Critical (Must Have)

#### Authentication (AUTH)
| ID | Function | Description |
|----|----------|-------------|
| AUTH-001 | User Login | Email/password authentication with JWT tokens |
| AUTH-002 | User Registration | Create account with email, username, display_name, password |
| AUTH-003 | Session Management | Access token + refresh token flow |
| AUTH-004 | Logout | Clear tokens and session |
| AUTH-005 | Account Blocking | Admin can ban users (is_active=false) |

#### Posts (POST)
| ID | Function | Description |
|----|----------|-------------|
| POST-001 | Create Post | Text content up to 2000 characters |
| POST-002 | View Feed | See posts from followed users |
| POST-003 | Like Post | Toggle like on posts |
| POST-004 | Delete Own Post | Soft delete by owner |
| POST-005 | Moderator Delete | Soft delete by moderator with reason |

#### Security (SEC)
| ID | Function | Description |
|----|----------|-------------|
| SEC-001 | XSS Prevention | Script tags rendered as plain text |
| SEC-002 | SQL Injection Prevention | Content sanitized in queries |
| SEC-003 | Unauthorized Access | Admin routes blocked for regular users |
| SEC-004 | Token Expiration | Expired tokens return 401 |

### High Priority

#### Social Features
| ID | Function | Description |
|----|----------|-------------|
| SOCIAL-001 | Follow User | Follow/unfollow with count update |
| SOCIAL-002 | Private Accounts | Follow requests for private users |
| SOCIAL-003 | Comments | Add comments to posts |
| SOCIAL-004 | Bookmarks | Save posts to bookmarks |

#### Messaging
| ID | Function | Description |
|----|----------|-------------|
| MSG-001 | Direct Messages | Send/receive DMs |
| MSG-002 | Group Conversations | Multi-user conversations |
| MSG-003 | Unread Badge | Visual indicator for unread messages |

#### Notifications
| ID | Function | Description |
|----|----------|-------------|
| NOTIF-001 | Notification Feed | List of user notifications |
| NOTIF-002 | Mark as Read | Individual and bulk marking |
| NOTIF-003 | Notification Triggers | Like, follow, mention notifications |

#### Admin Panel
| ID | Function | Description |
|----|----------|-------------|
| ADMIN-001 | User Management | View, ban, change roles |
| ADMIN-002 | Content Moderation | Delete posts with reason |
| ADMIN-003 | Statistics | User count, post count |

### Medium Priority

#### Search
| ID | Function | Description |
|----|----------|-------------|
| SEARCH-001 | User Search | Search by username/name |
| SEARCH-002 | Post Search | Search post content |
| SEARCH-003 | Hashtag Search | Search by #hashtags |

#### Profile
| ID | Function | Description |
|----|----------|-------------|
| PROFILE-001 | View Profile | Display name, bio, avatar, stats |
| PROFILE-002 | Followers/Following | Lists of followers |
| PROFILE-003 | Edit Profile | Update display_name, bio |

#### Content Features
| ID | Function | Description |
|----|----------|-------------|
| CONTENT-001 | Image Upload | JPEG, PNG, GIF, WebP up to 5MB |
| CONTENT-002 | Hashtags | Auto-link hashtags in posts |
| CONTENT-003 | Unicode Support | Chinese, Arabic, Russian, emoji |

### Low Priority

| Function | Description |
|----------|-------------|
| Private Post Visibility | Followers-only posts |
| Language Support | i18n (EN/RU) |
| Responsive Design | Mobile viewport support |
| Accessibility | ARIA labels, keyboard nav |

---

## 2. ACCEPTANCE CRITERIA

### Authentication

#### Login (TC-AUTH-001)
```
GIVEN: Valid user credentials
WHEN: User enters email and password and clicks Sign in
THEN: Redirect to feed, sidebar shows username, token stored
```

#### Wrong Password (TC-AUTH-002)
```
GIVEN: Valid email, wrong password
WHEN: User attempts login
THEN: Error "Invalid email or password" shown, stay on /login
```

#### Wrong Email (TC-AUTH-009)
```
GIVEN: Wrong email, valid password
WHEN: User attempts login
THEN: Error "Invalid email or password" shown, stay on /login
```

#### Banned User (TC-AUTH-003)
```
GIVEN: User with is_active=false
WHEN: User attempts login
THEN: Error "Account is deactivated", no token stored
```

#### Registration (TC-AUTH-004)
```
GIVEN: Valid registration data
WHEN: User submits registration form
THEN: Redirect to /login with success toast, new user can login
```

#### Token Refresh (TC-AUTH-006)
```
GIVEN: Valid refresh token
WHEN: Access token expires
THEN: New token pair returned, API calls continue to work
```

### Posts

#### Create Post (TC-POST-001)
```
GIVEN: Logged in user
WHEN: User types content and clicks Post
THEN: Post appears at top of feed, success toast shown
```

#### Like Post (TC-POST-003)
```
GIVEN: Post not liked by current user
WHEN: User clicks like button
THEN: Count +1, heart filled red, state persists on reload
WHEN: User clicks again
THEN: Count -1, heart outline
```

#### Hashtag Auto-Link (TC-POST-002)
```
GIVEN: Post with #hashtag
WHEN: Post is displayed
THEN: Hashtag rendered as clickable link to Explore filtered by tag
```

#### Delete Post (TC-POST-005)
```
GIVEN: User owns the post
WHEN: User clicks menu → Delete → Confirm
THEN: Post disappears from feed immediately
```

### Security

#### XSS Prevention (TC-EDGE-001, TC-EDGE-002)
```
GIVEN: Post containing <script>alert("xss")</script>
WHEN: Post is displayed
THEN: Content is plain text, no script execution, no console errors
```

#### SQL Injection (TC-EDGE-001)
```
GIVEN: Content with SQL injection attempt
WHEN: Content is saved and retrieved
THEN: Database intact, content stored as plain text
```

#### Admin Access (TC-ADM-004)
```
GIVEN: Regular user (role=user)
WHEN: User tries to access /admin
THEN: No admin link visible, API returns 403 Forbidden
```

### Social

#### Follow (TC-FOL-001)
```
GIVEN: User does not follow target
WHEN: User clicks Follow
THEN: Button changes to Unfollow, followers count +1, notification sent
```

#### Private Account (TC-FOL-002)
```
GIVEN: Target user has is_private=true
WHEN: User tries to follow
THEN: Button shows "Request to Follow", status = pending
```

### Messages

#### Send DM (TC-MSG-002)
```
GIVEN: Inside a conversation
WHEN: User types and sends message
THEN: Message appears as right-aligned blue bubble with timestamp
```

#### Unread Badge (TC-MSG-003)
```
GIVEN: User has unread messages
WHEN: User views sidebar
THEN: Red badge with unread count on Messages icon
```

### Edge Cases

#### Duplicate Like (TC-EDGE-004)
```
GIVEN: User already liked the post
WHEN: User tries to like again via API
THEN: 409 Conflict returned
```

#### Duplicate Follow (TC-EDGE-005)
```
GIVEN: User already follows target
WHEN: User tries to follow again via API
THEN: 409 Conflict returned
```

#### Non-existent Resource (TC-EDGE-006)
```
GIVEN: Request for non-existent resource
WHEN: API call made
THEN: 404 with {"detail": "...not found", "error_code": "NOT_FOUND"}
```

#### Image Upload Limits (TC-EDGE-007, TC-EDGE-008)
```
GIVEN: File exceeds 5MB or wrong format
WHEN: User uploads image
THEN: 400 with appropriate error message
```

---

## 3. NON-FUNCTIONAL REQUIREMENTS

### Performance
| Requirement | Target |
|-------------|--------|
| Page Load Time | < 2 seconds |
| API Response Time | < 500ms |
| Feed Load | < 3 seconds with 25+ posts |

### Security
| Requirement | Implementation |
|-------------|----------------|
| Password Storage | Hashed (bcrypt) |
| Session Tokens | JWT with expiration |
| HTTPS | Required for production |
| XSS Prevention | Content escaping |
| SQL Injection | Parameterized queries |
| CORS | Configured origins only |

### Data Limits
| Resource | Limit |
|----------|-------|
| Post Length | 2000 characters |
| Username | 3-30 chars, alphanumeric + underscore |
| Password | Minimum 6 characters |
| Display Name | Maximum 100 characters |
| Image Upload | 5MB, JPEG/PNG/GIF/WebP only |

### User Limits
| Resource | Limit |
|----------|-------|
| Post Edit Window | 15 minutes after creation |
| API Rate | Not specified in docs |

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile responsive (320px - 1920px)

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast

### Data Persistence
| Action | Endpoint | Behavior |
|--------|----------|----------|
| Reset Database | POST /api/reset | Delete custom data, re-seed |

### Seed Data
- 8 seed users (alice_dev, bob_photo, carol_writes, dave_quiet, eve_new, frank_banned, admin, moderator)
- 25+ seed posts
- Pre-configured follows, comments, messages
- Posts for edge cases (XSS, SQL injection, max length, unicode)

---

## 4. API ENDPOINTS SUMMARY

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns tokens)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke refresh token
- `GET /api/auth/me` - Current user profile

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - List all posts
- `GET /api/posts/feed` - Feed (followed users only)
- `GET /api/posts/{id}` - Single post
- `PATCH /api/posts/{id}` - Edit post (15 min window)
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Like post
- `DELETE /api/posts/{id}/like` - Unlike post
- `POST /api/upload/image` - Upload image

### Users
- `GET /api/users` - List users
- `GET /api/users/{username}` - User profile
- `GET /api/users/{username}/posts` - User posts
- `POST /api/users/{username}/follow` - Follow user
- `DELETE /api/users/{username}/follow` - Unfollow user
- `GET /api/users/{username}/followers` - Followers list
- `GET /api/users/{username}/following` - Following list

### Comments
- `POST /api/posts/{id}/comments` - Add comment
- `GET /api/posts/{id}/comments` - List comments
- `POST /api/comments/{id}/like` - Like comment

### Messages
- `GET /api/conversations` - List conversations
- `POST /api/conversations/dm/{username}` - Start DM
- `GET /api/conversations/{id}` - Get messages
- `POST /api/conversations/{id}/read` - Mark as read

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications/read-all` - Mark all read
- `POST /api/notifications/{id}/read` - Mark one read

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - User list
- `PATCH /api/admin/users/{id}` - Update user (ban, role)
- `GET /api/admin/posts` - All posts including deleted
- `DELETE /api/admin/posts/{id}` - Moderator delete

### System
- `POST /api/reset` - Reset database

---

## 5. USER ROLES

| Role | Permissions |
|------|-------------|
| user | Create posts, follow, message, comment |
| moderator | Delete any post with reason |
| admin | Ban users, change roles, full moderation |
| (banned) | is_active=false, cannot login |

---

*Generated: 2026-04-14*
*Source: Reverse engineered from TEST_CASES.md and frontend code*
