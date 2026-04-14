# Buzzhive E2E Test Improvements Plan

Generated with Ollama review on 2026-04-14

## Current Status
- ✅ 14 tests passing
- Coverage: Auth, Navigation, Posts, Profile, Messages, Notifications

## Missing Tests (Priority Order)

### High Priority
1. **Logout flow** - session termination
2. **Like/Unlike posts** - `post-like-btn-{id}`
3. **Comments on posts** - `comment-input`, `comment-submit-btn`
4. **Bookmark posts** - `post-bookmark-btn-{id}`
5. **Follow/Unfollow users** - `profile-follow-btn`

### Medium Priority
6. **Admin Panel** - `admin-ban-btn-{id}`, `admin-role-select-{id}`, `admin-users-table`
7. **Notifications** - mark as read, mark all read
8. **Search functionality** - `nav-search`
9. **Explore page** - `nav-explore`

### Low Priority
10. **Responsive/Mobile** - different viewports
11. **Accessibility** - keyboard nav, ARIA
12. **Session expiration** - token handling
13. **Privacy settings** - profile visibility

## Next Steps
1. Get product specs/requirements from analysts
2. Map test cases to requirements
3. Implement missing tests
4. Add API tests for backend validation
