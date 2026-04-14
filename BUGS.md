# Bug Tracker - Buzzhive Social Network

## Legend
- 🟢 Fixed
- 🟡 Known Issue
- 🔴 Open

---

## Found Bugs

### AUTH-011-01: No HTML5 minlength on password field
**Status:** 🔴 Open  
**Date:** 2026-04-14  
**Severity:** Medium  
**Module:** Auth/Login  

**Description:**
HTML5 `minlength="6"` attribute is missing from password input field.

**Current Behavior:**
- User can enter 1 character password
- HTML5 validation does NOT block submission
- Backend must handle short passwords

**Expected Behavior:**
- Password field should have `minlength="6"` attribute
- Browser should block form submission for passwords < 6 characters

**Test Evidence:**
```typescript
const isInvalid = await passwordInput.evaluate(el => el.validity.valid);
// Result: true (valid) - minlength not set
```

**Steps to Reproduce:**
1. Go to /login
2. Enter email: alice@buzzhive.com
3. Enter password: "a" (1 character)
4. Click Sign in
5. Form submits (should be blocked by HTML5)

**Files to Fix:**
- `frontend/src/pages/auth/LoginPage.tsx`

---

### AUTH-011-02: POST /api/auth/refresh returns 500
**Status:** 🔴 Open  
**Date:** 2026-04-14  
**Severity:** High  
**Module:** API/Auth  

**Description:**
Token refresh endpoint returns 500 Internal Server Error.

**Current Behavior:**
```
POST /api/auth/refresh
→ 500 Internal Server Error
```

**Expected Behavior:**
```
POST /api/auth/refresh
→ 200 { access_token, refresh_token }
```

**Steps to Reproduce:**
1. Login: POST /api/auth/login
2. Get refresh_token
3. POST /api/auth/refresh with refresh_token
4. Get 500 error

---

## Closed Bugs

*(No bugs closed yet)*

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
