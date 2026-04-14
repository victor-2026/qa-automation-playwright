# API Contract - Buzzhive Social Network

Auto-generated from Swagger/OpenAPI spec
Last updated: 2026-04-14

## Summary

| Category | Endpoints |
|----------|-----------|
| Auth | 4 |
| Posts | 10 |
| Users | 6 |
| Messages | 5 |
| Notifications | 4 |
| Admin | 5 |
| **TOTAL** | **52** |

## Auth Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | ✅ Tested |
| POST | /api/auth/login | Login | ✅ Tested |
| POST | /api/auth/refresh | Refresh token | ⚠️ Bug |
| POST | /api/auth/logout | Logout | ✅ Tested |
| GET | /api/auth/me | Current user | ✅ Tested |

## Posts Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/posts | List posts | ⏳ |
| POST | /api/posts | Create post | ⏳ |
| GET | /api/posts/feed | Feed | ⏳ |
| GET | /api/posts/{id} | Single post | ⏳ |
| PATCH | /api/posts/{id} | Edit post | ⏳ |
| DELETE | /api/posts/{id} | Delete post | ⏳ |
| POST | /api/posts/{id}/like | Like | ⏳ |
| DELETE | /api/posts/{id}/like | Unlike | ⏳ |
| POST | /api/posts/{id}/comments | Comment | ⏳ |
| GET | /api/posts/{id}/comments | Get comments | ⏳ |

## Users Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/users | List users | ⏳ |
| GET | /api/users/{username} | Profile | ⏳ |
| GET | /api/users/{username}/posts | User posts | ⏳ |
| POST | /api/users/{username}/follow | Follow | ⏳ |
| DELETE | /api/users/{username}/follow | Unfollow | ⏳ |
| GET | /api/users/{username}/followers | Followers | ⏳ |
| GET | /api/users/{username}/following | Following | ⏳ |

## Messages Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/conversations | List | ⏳ |
| POST | /api/conversations/dm/{username} | Start DM | ⏳ |
| GET | /api/conversations/{id} | Messages | ⏳ |
| POST | /api/conversations/{id}/read | Mark read | ⏳ |
| DELETE | /api/conversations/{id} | Delete | ⏳ |

## Notifications Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/notifications | List | ⏳ |
| POST | /api/notifications/read-all | Mark all read | ⏳ |
| GET | /api/notifications/unread-count | Count | ⏳ |
| POST | /api/notifications/{id}/read | Mark one read | ⏳ |

## Admin Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/admin/stats | Dashboard | ⏳ |
| GET | /api/admin/users | List users | ⏳ |
| PATCH | /api/admin/users/{id} | Update user | ⏳ |
| GET | /api/admin/posts | All posts | ⏳ |
| DELETE | /api/admin/posts/{id} | Delete post | ⏳ |

## Other Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/bookmarks | Bookmarks | ⏳ |
| POST | /api/comments/{id}/like | Like comment | ⏳ |
| DELETE | /api/comments/{id}/like | Unlike comment | ⏳ |
| GET | /api/comments/{id}/replies | Replies | ⏳ |
| GET | /api/follows/requests | Requests | ⏳ |
| POST | /api/follows/requests/{id}/accept | Accept | ⏳ |
| POST | /api/follows/requests/{id}/reject | Reject | ⏳ |
| POST | /api/reset | Reset DB | ⏳ |
| POST | /api/upload/image | Upload | ⏳ |
| GET | /api/health | Health | ⏳ |

---

**Legend:** ✅ Tested | ⚠️ Bug | ⏳ Not tested

**Total API Coverage:** 5/52 (10%)
