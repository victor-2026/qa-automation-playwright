# Bug Tracker - Buzzhive Social Network

## Legend
- 🟢 Fixed
- 🟡 Known Issue
- 🔴 Open

---

## Fixed Bugs

### BUG-001: Unicode control chars in post body → 500
**Status:** 🟢 Fixed (2026-05-28)  
**Date:** 2026-05-28  
**Severity:** High  
**Module:** API/Posts  
**Found by:** `FuzzerTests.Post_UnicodeGarbage_Returns4xx` (C#)

**Fix:** `BeforeValidator` (`SafeContent`) в `common.py` — применяется ко всем текстовым полям. Control chars (Cc, Cs, non-characters) вырезаются, пустой результат → 422.

---

### BUG-002: Concurrent follow/unfollow → 500
**Status:** 🟢 Fixed (2026-05-28)  
**Date:** 2026-05-28  
**Severity:** Medium  
**Module:** API/Follows  
**Found by:** `RaceTests.Race_FollowUnfollowStorm` (C#)

**Fix:** `.with_for_update()` к `SELECT Follow` в `follow_user()` и `unfollow_user()`. `IntegrityError` catch как safety net.

---

### BUG-003: Parallel register allows duplicate users
**Status:** 🟢 Fixed (2026-05-28)  
**Date:** 2026-05-28  
**Severity:** Medium  
**Module:** API/Auth  
**Found by:** `PropertiesTests.Register_Parallel_NoDuplicates` (C#)

**Fix:** Удалён check-then-insert. `IntegrityError` → 409 Conflict.

---

### BUG-004: Parallel register → 500 (IntegrityError unhandled)
**Status:** 🟢 Fixed (2026-05-28)  
**Date:** 2026-05-28  
**Severity:** Medium  
**Module:** API/Auth  
**Found by:** `PropertiesTests.Register_Parallel_NoDuplicates` (C#)

**Fix:** Тот же fix, что и BUG-003.

---

### BUG-005: Post content не экранирует HTML (XSS)
**Status:** 🟢 False Positive  
**Date:** 2026-05-28  
**Severity:** Closed  
**Module:** Frontend/Feed  

**Resolution:** React автоматически экранирует строки в JSX. `{renderContent(post.content)}` рендерит `<script>` как текст. `dangerouslySetInnerHTML` не используется.

---

### BUG-006: Отрицательный likes_count отображается как есть
**Status:** 🟢 Fixed (2026-05-28)  
**Date:** 2026-05-28  
**Severity:** Low  
**Module:** Frontend/PostCard  

**Fix:** `PostCard.tsx` — `{Math.max(0, likesCount)}` вместо `{likesCount}`.

---

### AUTH-011-01: No HTML5 minlength on password field
**Status:** 🟢 Fixed (2026-05-29)  
**Date:** 2026-04-14  
**Severity:** Medium  
**Module:** Auth/Login  

**Fix:** `LoginPage.tsx` — добавлен `minLength={6}` на password input.

---

### AUTH-011-02: POST /api/auth/refresh (Was returning 500)
**Status:** 🟢 Fixed (2026-04-15)  
**Date:** 2026-04-14  
**Severity:** High  
**Module:** API/Auth  

**Fix:** Добавлен `jti: uuid.uuid4()` в refresh token payload (уникаль_violation при concurrent refresh).

---

## Open Bugs

_(No open bugs at this time.)_

---

## Bug Report Template

```markdown
### BUG-XXX: Title
**Status:** 🔴 Open  
**Date:** YYYY-MM-DD  
**Severity:** Low/Medium/High/Critical  
**Module:** Module Name  

**Description:**
What is the bug?

**Current Behavior:**
What happens now?

**Expected Behavior:**
What should happen?

**Test Evidence:**
Code or screenshots

**Steps to Reproduce:**
1. Step 1
2. Step 2

**Files to Fix:**
- file path
```

---

## Severity Levels

| Level | Description | Example |
|-------|-------------|---------|
| Critical | Security vulnerability, data loss | SQL injection, XSS |
| High | Major feature broken | Login doesn't work |
| Medium | Feature partially works | Validation missing |
| Low | Minor issue, cosmetic | Typo, styling |
