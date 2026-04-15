# API Contract - Buzzhive Social Network

Auto-generated from Swagger/OpenAPI spec
Last updated: 2026-04-14

## Summary

| Category | Endpoints |
|----------|-----------|
| Auth | 5 |
| Posts | 10 |
| Users | 6 |
| Messages | 5 |
| Notifications | 4 |
| Admin | 8 |
| Other | 4 |
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
| GET | /api/posts | List posts | ✅ Tested |
| POST | /api/posts | Create post | ✅ Tested |
| GET | /api/posts/feed | Feed | ✅ Tested |
| GET | /api/posts/{id} | Single post | ✅ Tested |
| PATCH | /api/posts/{id} | Edit post | ✅ Tested |
| DELETE | /api/posts/{id} | Delete post | ✅ Tested |
| POST | /api/posts/{id}/like | Like | ✅ Tested |
| DELETE | /api/posts/{id}/like | Unlike | ✅ Tested |
| POST | /api/posts/{id}/comments | Comment | ✅ Tested |
| GET | /api/posts/{id}/comments | Get comments | ✅ Tested |

## Users Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/users | List users | ✅ Tested |
| GET | /api/users/{username} | Profile | ✅ Tested |
| GET | /api/users/{username}/posts | User posts | ✅ Tested |
| POST | /api/users/{username}/follow | Follow | ✅ Tested |
| DELETE | /api/users/{username}/follow | Unfollow | ✅ Tested |
| GET | /api/users/{username}/followers | Followers | ✅ Tested |
| GET | /api/users/{username}/following | Following | ✅ Tested |

## Messages Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/conversations | List | ✅ Tested |
| POST | /api/conversations/dm/{username} | Start DM | ✅ Tested |
| GET | /api/conversations/{id} | Messages | ✅ Tested |
| POST | /api/conversations/{id}/read | Mark read | ✅ Tested |
| DELETE | /api/conversations/{id} | Delete | ✅ Tested |

## Notifications Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/notifications | List | ✅ Tested |
| POST | /api/notifications/read-all | Mark all read | ✅ Tested |
| GET | /api/notifications/unread-count | Count | ✅ Tested |
| POST | /api/notifications/{id}/read | Mark one read | ✅ Tested |

## Admin Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/admin/stats | Dashboard | ✅ Tested |
| GET | /api/admin/users | List users | ✅ Tested |
| PATCH | /api/admin/users/{id} | Update user | ✅ Tested |
| PATCH | /api/admin/users/{id}/ban | Ban user | ✅ Tested |
| PATCH | /api/admin/users/{id}/unban | Unban user | ✅ Tested |
| DELETE | /api/admin/users/{id} | Delete user | ✅ Tested |
| GET | /api/admin/posts | All posts | ✅ Tested |
| DELETE | /api/admin/posts/{id} | Delete post | ✅ Tested |

## Comments Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | /api/comments/{id}/like | Like comment | ✅ Tested |
| DELETE | /api/comments/{id}/like | Unlike comment | ✅ Tested |
| GET | /api/comments/{id}/replies | Replies | ✅ Tested |

## Other Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/bookmarks | Bookmarks | ✅ Tested |
| GET | /api/follows/requests | Requests | ✅ Tested |
| POST | /api/follows/requests/{id}/accept | Accept | ✅ Tested |
| POST | /api/follows/requests/{id}/reject | Reject | ✅ Tested |
| POST | /api/upload/image | Upload | ✅ Tested |
| POST | /api/reset | Reset DB | ✅ Tested |
| GET | /api/health | Health | ✅ Tested |

---

**Legend:** ✅ Tested | ⚠️ Bug | ⏳ Not tested

**Total API Coverage:** 49/52 (94%)
