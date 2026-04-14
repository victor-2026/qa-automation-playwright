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
| GET | /api/posts | List posts | ✅ Tested |
| POST | /api/posts | Create post | ✅ Tested |
| GET | /api/posts/feed | Feed | ✅ Tested |
| GET | /api/posts/{id} | Single post | ✅ Tested |
| PATCH | /api/posts/{id} | Edit post | ✅ Tested |
| DELETE | /api/posts/{id} | Delete post | ✅ Tested |
| GET | /api/users/{username}/posts | User posts | ✅ Tested |
| POST | /api/notifications/{id}/read | Mark one read | ⏳ |
| PATCH | /api/admin/users/{id} | Update user | ✅ Tested |
| DELETE | /api/admin/posts/{id} | Delete post | ✅ Tested |
| GET | /api/bookmarks | Bookmarks | ✅ Tested |
| POST | /api/comments/{id}/like | Like comment | ✅ Tested |
| DELETE | /api/comments/{id}/like | Unlike comment | ✅ Tested |
| GET | /api/comments/{id}/replies | Replies | ✅ Tested |
| GET | /api/follows/requests | Requests | ✅ Tested |
| POST | /api/follows/requests/{id}/accept | Accept | ✅ Tested |
| POST | /api/follows/requests/{id}/reject | Reject | ✅ Tested |
| POST | /api/upload/image | Upload | ⏳ |
**Legend:** ✅ Tested | ⚠️ Bug | ⏳ Not tested

**Total API Coverage:** 45/52 (87%)
