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

### AUTH-011-02: POST /api/auth/refresh (Was returning 500)
**Status:** 🟢 Fixed (2026-04-15)  
**Date:** 2026-04-14  
**Severity:** High  
**Module:** API/Auth  

**Description:**
Token refresh endpoint was returning 500 Internal Server Error.

**Previous Behavior:**
```
POST /api/auth/refresh
→ 500 Internal Server Error
```

**Current Behavior (2026-04-15):**
```
POST /api/auth/refresh
→ 200 { access_token, refresh_token }
```

**Verification:**
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<valid_token>"}'
# Returns: 200 with new tokens ✅
```

**Steps to Reproduce:**
1. Login: POST /api/auth/login
2. Get refresh_token
3. POST /api/auth/refresh with refresh_token
4. Get 500 error

---

### BUG-001: Unicode control chars in post body → 500
**Status:** 🔴 Open  
**Date:** 2026-05-28  
**Severity:** High  
**Module:** API/Posts  
**Found by:** `FuzzerTests.Post_UnicodeGarbage_Returns4xx` (C#)

**Description:**
Posting unicode control characters (`\u0000`, `\u0001`, `\uFFFF`, `\uD800`) in post title/content causes 500 Internal Server Error.

**Current Behavior:**
```
POST /api/posts
{"title":"\u0000\u0001","content":"\uFFFF\uD800"}
→ 500 Internal Server Error
```

**Expected Behavior:**
```
→ 422 Unprocessable Entity (validation error)
```

**Root Cause (suspected):**
Unicode control chars bypass Pydantic validation and crash the PostgreSQL driver or JSON serializer.

**Reproduction:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@buzzhive.com","password":"alice123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"\u0000\u0001","content":"\uFFFF\uD800"}'
```

**Impact:** Any authenticated user can crash the backend (DoS).

**Fix Suggestions:**
- Add Pydantic validator on `title`/`content`: reject control chars (`< 0x20` except `\n`, `\r`, `\t`)
- Add DB-level sanitize before insert

---

### BUG-002: Concurrent follow/unfollow → 500
**Status:** 🔴 Open  
**Date:** 2026-05-28  
**Severity:** Medium  
**Module:** API/Follows  
**Found by:** `RaceTests.Race_FollowUnfollowStorm` (C#)

**Description:**
Concurrent POST + DELETE `/api/users/{username}/follow` against the same user produces 500 intermittently.

**Reproduction:**
```bash
dotnet test --filter Race_FollowUnfollowStorm
```

**Root Cause (suspected):**
Race condition: two threads check if-following simultaneously, both pass, then both try INSERT/ DELETE creating unique violation or NULL constraint error.

**Impact:** Low (requires concurrent requests), but indicates missing transaction isolation.

**Fix Suggestions:**
- Wrap follow/unfollow in transaction with `select_for_update()`
- Use `ON CONFLICT DO NOTHING` / catch IntegrityError → 409

---

### BUG-003: Parallel register allows duplicate users
**Status:** 🔴 Open  
**Date:** 2026-05-28  
**Severity:** Medium  
**Module:** API/Auth  
**Found by:** `PropertiesTests.Register_Parallel_NoDuplicates` (C#)

**Description:**
5 concurrent `POST /auth/register` with the same email+username produce 2+ successful (201) registrations.

**Root Cause (suspected):**
Check-then-insert pattern without `select_for_update()`:

```python
existing = await db.execute(select(User).where(User.email == email))
if existing.scalar_one_or_none():
    raise ConflictException(...)
db.add(new_user)  # race: two requests pass the check, both insert
```

**Impact:** Data integrity issue — duplicate user accounts possible.

**Fix Suggestions:**
- Use `select_for_update()` or `INSERT ... ON CONFLICT DO NOTHING`
- Catch `IntegrityError` → 409 Conflict

---

### BUG-004: Parallel register → 500 (IntegrityError unhandled)
**Status:** 🔴 Open  
**Date:** 2026-05-28  
**Severity:** Medium  
**Module:** API/Auth  
**Found by:** `PropertiesTests.Register_Parallel_NoDuplicates` (C#)

**Description:**
When 5 concurrent `POST /auth/register` with the same email fire simultaneously, some return 500 instead of 201/409.

**Root Cause (suspected):**
```python
db.add(new_user)
await db.commit()  # IntegrityError unhandled → FastAPI catches as 500
```

**Impact:** Client sees 500 instead of meaningful 409 Conflict.

**Fix Suggestions:**
- Wrap `db.commit()` in try/except for `IntegrityError` → raise `ConflictException`
- Use `db.merge()` or `INSERT ... ON CONFLICT DO NOTHING`

### BUG-005: Post content не экранирует HTML (XSS)
**Status:** 🔴 Open  
**Date:** 2026-05-28  
**Severity:** Critical  
**Module:** Frontend/Feed  
**Found by:** `DBMUT-003` (mutation — DB content replaces with `<script>`)

**Description:**
HTML/JS код в post content рендерится как есть, без экранирования. `<script>alert("xss")</script>` выполняется как HTML, не как текст.

**Current Behavior:**
- Post content `<script>alert("xss")</script>` отображается как скрипт (браузер пытается выполнить)
- `textContent()` возвращает исходный HTML-код без экранирования

**Expected Behavior:**
- HTML-теги должны экранироваться (`&lt;script&gt;`)
- `textContent()` должен показывать текст с экранированными символами

**Test Evidence:**
```typescript
const text = await content.textContent();
expect(text).toContain('<script>');           // ✅ тег виден как текст
expect(text).not.toContain(xssPayload);       // ❌ FAIL — сырой HTML не экранирован
// Received: '<script>alert("xss")</script>' — ни одно вхождение не экранировано
```

**Steps to Reproduce:**
1. Любой пользователь создаёт пост с HTML-контентом
2. PostCard рендерит контент через `dangerouslySetInnerHTML` или без `textContent`
3. `<script>` / `<img onerror>` теги выполняются

**Files to Fix:**
- `frontend/src/components/post/PostCard.tsx` — проверить как рендерится content

---

### BUG-006: Отрицательный likes_count отображается как есть
**Status:** 🔴 Open  
**Date:** 2026-05-28  
**Severity:** Low  
**Module:** Frontend/PostCard  
**Found by:** `DBMUT-004` (mutation — UPDATE posts SET likes_count = -5)

**Description:**
При отрицательном значении `likes_count` в БД, UI показывает `-5` без обработки.

**Current Behavior:**
```
{post.likes_count} → "-5"
```

**Expected Behavior:**
- `max(0, likes_count)` — показывать 0 или больше
- Или использовать абсолютное значение

**Test Evidence:**
```typescript
const text = await likesCount.textContent();  // "-5"
expect(text).not.toMatch(/^-\d+$/);           // ❌ FAIL — показывает "-5"
```

**Steps to Reproduce:**
1. UPDATE posts SET likes_count = -5 WHERE id = ...
2. Перезагрузить страницу
3. Счётчик лайков показывает "-5"

**Files to Fix:**
- `frontend/src/components/post/PostCard.tsx` — `{Math.max(0, likesCount)}`

---

## Closed Bugs

### AUTH-011-02: POST /api/auth/refresh (Was returning 500)
**Status:** 🟢 Fixed (2026-04-15)  
**Date:** 2026-04-14  

Fixed by adding `jti: uuid.uuid4()` to refresh token payload (eliminated unique_violation on concurrent refresh).

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
