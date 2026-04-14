# Traceability Matrix - Buzzhive Social Network

## Requirement → Test Case Mapping

### Legend
- ✅ Pass
- ❌ Fail
- ⏳ Pending
- ❌ Not Covered

---

## Authentication (AUTH)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| AUTH-001 | User Login with JWT | TC-AUTH-001 | Login with alice@buzzhive.com | ✅ Pass |
| AUTH-001 | JWT tokens stored | TC-AUTH-001 | JWT tokens stored after login | ✅ Pass |
| AUTH-001 | Session persists | TC-AUTH-001 | Session persists on page reload | ✅ Pass |
| AUTH-001 | Sidebar shows username | TC-AUTH-001 | Sidebar shows username after login | ✅ Pass |
| AUTH-001 | Multiple users login | TC-AUTH-001 | Login as different users | ✅ Pass |
| AUTH-002 | Wrong password error | TC-AUTH-002 | Login with wrong password shows error | ✅ Pass |
| AUTH-002 | No tokens on failure | TC-AUTH-002 | No tokens stored on failed login | ✅ Pass |
| AUTH-002 | Stay on login page | TC-AUTH-002 | User stays on login page after error | ✅ Pass |
| AUTH-003 | Banned user blocked | TC-AUTH-003 | Banned user cannot login | ✅ Pass |
| AUTH-004 | Registration | TC-AUTH-004 | Registration with valid data | ✅ Pass |
| AUTH-005 | Registration validation | TC-AUTH-008 | Username validation rejects spaces | ✅ Pass |
| AUTH-006 | Token refresh | TC-AUTH-006 | Token refresh flow | ⏳ Pending |
| AUTH-007 | Quick login buttons | TC-AUTH-007 | Quick login buttons fill form | ⏳ Pending |
| AUTH-009 | Wrong email error | TC-AUTH-009 | Login with wrong email shows error | ✅ Pass |

---

## Posts (POST)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| POST-001 | Create post | TC-POST-001 | Can create a post | ✅ Pass |
| POST-001 | Post in feed | TC-POST-001 | Post appears in feed | ✅ Pass |
| POST-002 | Hashtag auto-link | TC-POST-002 | Hashtag auto-links | ⏳ Pending |
| POST-003 | Like post | TC-POST-003 | Can like and unlike a post | ✅ Pass |
| POST-003 | Like count update | TC-POST-003 | Like count updates | ✅ Pass |
| POST-004 | Delete own post | TC-POST-005 | Delete own post | ⏳ Pending |
| POST-005 | Moderator delete | TC-POST-006 | Moderator soft-deletes post | ⏳ Pending |

---

## Security (SEC)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| SEC-001 | XSS Prevention | TC-EDGE-002 | XSS attempt in content | ⏳ Pending |
| SEC-002 | SQL Injection Prevention | TC-EDGE-001 | SQL injection in content is safe | ⏳ Pending |
| SEC-003 | Admin access blocked | TC-ADM-004 | Regular user blocked from admin | ✅ Pass |
| SEC-004 | Token expiration | TC-AUTH-006 | Token expiration handling | ⏳ Pending |

---

## Social Features

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| SOCIAL-001 | Follow user | TC-FOL-001 | Can follow and unfollow a user | ✅ Pass |
| SOCIAL-001 | Follow count update | TC-FOL-001 | Followers count increments | ✅ Pass |
| SOCIAL-002 | Private account | TC-FOL-002 | Follow request for private account | ⏳ Pending |
| SOCIAL-003 | Add comment | TC-COM-001 | Can add a comment to post | ✅ Pass |
| SOCIAL-004 | Bookmark | TC-POST-004 | Can bookmark a post | ✅ Pass |

---

## Messages (MSG)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| MSG-001 | Start DM | TC-MSG-001 | Start new DM conversation | ⏳ Pending |
| MSG-002 | Send message | TC-MSG-002 | Send a message | ⏳ Pending |
| MSG-003 | Unread badge | TC-MSG-003 | Unread messages badge | ⏳ Pending |

---

## Notifications (NOTIF)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| NOTIF-001 | Notification feed | TC-NOT-001 | Unread badge in sidebar | ✅ Pass |
| NOTIF-002 | Mark as read | TC-NOT-002 | Mark all as read | ✅ Pass |

---

## Search (SEARCH)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| SEARCH-001 | Search users | TC-SRC-001 | Can search for users | ✅ Pass |
| SEARCH-002 | Search posts | TC-SRC-002 | Can search for posts | ✅ Pass |
| SEARCH-003 | Search hashtags | TC-SRC-003 | Can search for hashtags | ✅ Pass |
| SEARCH-004 | Empty results | TC-SRC-004 | Empty search shows no results | ✅ Pass |

---

## Admin (ADMIN)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| ADMIN-001 | Dashboard stats | TC-ADM-001 | Admin dashboard shows stats | ✅ Pass |
| ADMIN-002 | Ban user | TC-ADM-002 | Admin can ban a user | ✅ Pass |
| ADMIN-002 | Banned cannot login | TC-ADM-002 | Banned user cannot login | ✅ Pass |
| ADMIN-003 | Change role | TC-ADM-003 | Admin can change user role | ✅ Pass |

---

## Moderator (MOD)

| Requirement ID | Requirement | Test Case ID | Test Name | Status |
|---------------|-------------|--------------|-----------|--------|
| MOD-001 | Access admin panel | - | Moderator can access admin panel | ✅ Pass |
| MOD-002 | Delete posts | - | Moderator can delete any post | ✅ Pass |
| MOD-003 | Cannot ban users | - | Moderator cannot ban users | ✅ Pass |

---

## Summary

| Category | Total | Pass | Fail | Pending |
|----------|-------|------|------|---------|
| Authentication | 14 | 11 | 0 | 3 |
| Posts | 7 | 4 | 0 | 3 |
| Security | 4 | 1 | 0 | 3 |
| Social | 5 | 4 | 0 | 1 |
| Messages | 3 | 0 | 0 | 3 |
| Notifications | 2 | 2 | 0 | 0 |
| Search | 4 | 4 | 0 | 0 |
| Admin | 4 | 4 | 0 | 0 |
| Moderator | 3 | 3 | 0 | 0 |
| **TOTAL** | **46** | **33** | **0** | **13** |

**Coverage: 72%** (33/46 requirements tested)

---

## Test Execution Date

Last updated: 2026-04-14

Generated from: `tests/buzzhive.spec.ts`
