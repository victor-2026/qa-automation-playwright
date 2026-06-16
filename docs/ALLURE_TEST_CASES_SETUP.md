# Allure TestOps — Test Cases & Test Plan Setup Guide

**Trial:** https://victor2026.testops.cloud
**Project:** qa-automation-sandbox (Project ID = 2)
**Date:** 2026-06-16

---

## Goal

Add 9 test cases and 1 test plan in Allure TestOps UI. Each click below is a step you take in the browser. I'll do the actual clicking — you stay on the page.

---

## Important: Form Fields May Differ

The form fields below are based on **standard** Allure TestOps Test Case fields. Your trial instance may have:
- **Different field names** (e.g. "Type" might be "Workflow" or "Status")
- **Missing fields** (e.g. no "Priority" if not configured)
- **Custom fields** (if your admin added them)

**Fields confirmed to exist in this trial:**
- **Name** — always required
- **Description** — free text, optional
- **Tags** — comma-separated list, optional
- **Steps** — list of test steps (description + expected result), optional
- **Comments** — comments on test case
- **Issues** — link to issues (Jira, GitHub, etc.)
- **Test keys** — test ID (e.g. TC-001)
- **Members** — assigned people
- **Owner** — owner (default: victor2026)
- **Custom Fields** — custom fields
- **Mutes** — notification settings
- **Relations** — links to other test cases

**For each test case below, fill in at minimum:**
1. **Name** (required)
2. **Description** (recommended — paste the "Description" field from the table)
3. **Tags** (paste the "Tags" field as comma-separated)
4. **Steps** (paste the numbered steps)

**Skip optional fields** unless you have a specific need. Do NOT invent Type/Priority/Layer — they don't exist in this trial.

**Workflow** is set globally (Default Manual / Default Automated) and doesn't appear in the create form.

---

---

## Step 1: Open Project 2

URL: https://victor2026.testops.cloud/project/2

You should see:
- Project name: qa-automation-sandbox
- Left sidebar with: Launches, Test Cases, Test Plans, etc.
- Right side: empty area (no test cases yet)

---

## Step 2: Create Test Case TC-001: User can register via UI

**Click path:** Test Cases (left sidebar) → + Create (top right)

Fill the form:
| Field | Value |
|-------|-------|
| Name | TC-001: User can register via UI |
| Description | Verify new user can register through the web form on http://localhost:3000/register. Should receive confirmation, be logged in, redirected to feed. |
| Tags | `registration`, `ui`, `smoke` |
| Owner | `victor2026` |

**Steps** (click + Add Step for each):
1. Navigate to http://localhost:3000/register
2. Fill email with `newuser-{timestamp}@test.com`
3. Fill password with `Test1234!`
4. Fill display_name with `Test User`
5. Click Submit
6. Verify redirect to `/feed`
7. Verify user avatar appears in nav

**Expected result:** User is logged in, sees feed, can navigate to profile.

**Click:** Create / Save

---

## Step 3: Create Test Case TC-002: Login with valid credentials returns 200 + token

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-002: Login with valid credentials returns 200 + token |
| Description | API test: POST /api/auth/login with valid email/password returns 200 + access_token. Automated via Playwright (e2e/api/auth.spec.ts → AUTH-API-001). |
| Tags | `auth`, `api`, `smoke` |
| Test keys | `AUTH-API-001` |
| Owner | `victor2026` |

**Steps** (click + Add Step for each):
1. POST /api/auth/login with `{"email": "alice@buzzhive.com", "password": "alice123"}`
2. Verify status = 200
3. Verify response.access_token is non-empty string

**Expected result:** 200 OK, valid JWT token returned.

**Click:** Create / Save

---

## Step 4: Create Test Case TC-003: Login with deactivated account returns 400

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-003: Login with deactivated account returns 400 |
| Description | Verify backend rejects login for deactivated accounts. Real bug found via Allure TestOps: previous test runs accidentally deactivated admin@buzzhive.com. |
| Tags | `auth`, `deactivated`, `regression` |
| Owner | `victor2026` |

**Steps:**
1. POST /api/auth/login with `{"email": "frank@buzzhive.com", "password": "frank123"}` (frank is banned by default)
2. Verify status = 400
3. Verify error code = `BAD_REQUEST`
4. Verify error detail contains "deactivated" or "banned"

**Expected result:** 400 Bad Request, clear error message.

**Click:** Create / Save

---

## Step 5: Create Test Case TC-004: POST /posts rejects XSS script tag

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-004: POST /posts rejects XSS script tag |
| Description | Verify backend sanitizes or rejects HTML/script content in posts. Automated via Playwright (e2e/api/posts.spec.ts → POST-API-018). |
| Tags | `security`, `xss`, `posts` |
| Test keys | `POST-API-018` |
| Owner | `victor2026` |

**Steps:**
1. POST /api/posts with `{"content": "<script>alert('xss')</script>"}`
2. Verify status in [200, 400, 422]
3. If 200: GET /api/posts/{id} and verify content is sanitized (no `<script>` tag)
4. If 400/422: verify error is descriptive

**Expected result:** Either reject malicious content OR sanitize it (no script execution).

**Click:** Create / Save

---

## Step 6: Create Test Case TC-005: Moderator cannot ban admin user

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-005: Moderator cannot ban admin user |
| Description | Security boundary: moderator role has limited powers. Should NOT be able to ban/deactivate admin accounts. This was a real bug found via soft-delete pattern. |
| Tags | `security`, `rbac`, `admin`, `moderator` |
| Owner | `victor2026` |

**Steps:**
1. Login as `mod@buzzhive.com / mod123` → get modToken
2. GET /api/admin/users → find admin user
3. PATCH /api/admin/users/{admin.id}/ban with `Authorization: Bearer {modToken}`
4. Verify status in [403, 404]
5. GET /api/admin/users → verify admin still has `is_active: true`

**Expected result:** 403 Forbidden, admin user NOT banned.

**Click:** Create / Save

---

## Step 7: Create Test Case TC-006: Password reset via email flow

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-006: Password reset via email flow |
| Description | Verify password reset flow: user requests reset → email sent → link clicked → password changed → can login with new password. NOT covered by automation. |
| Tags | `auth`, `email`, `password-reset` |
| Owner | `victor2026` |

**Steps:**
1. Navigate to http://localhost:3000/forgot-password
2. Fill email with `alice@buzzhive.com`
3. Click Submit
4. Check email inbox (or Mailtrap if dev) for reset link
5. Click reset link → new password form
6. Set new password `NewPass456!`
7. Click Submit
8. Verify redirect to /login
9. Login with new password → verify success
10. Try login with old password → verify failure

**Expected result:** Password changed, new password works, old password fails.

**Click:** Create / Save

---

## Step 8: Create Test Case TC-007: User can upload avatar (image file)

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-007: User can upload avatar (image file) |
| Description | Verify avatar upload works: select file → upload → preview → save. NOT covered by automation. |
| Tags | `profile`, `upload`, `ui` |
| Owner | `victor2026` |

**Steps:**
1. Login as alice@buzzhive.com
2. Navigate to /profile/edit
3. Click "Upload avatar"
4. Select file `test-avatar.jpg` (any small JPG)
5. Verify preview appears
6. Click Save
7. Verify new avatar appears in nav and profile

**Expected result:** Avatar uploaded, visible in UI.

**Click:** Create / Save

---

## Step 9: Create Test Case TC-008: POST /conversations/{id}/read marks conversation as read

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-008: POST /conversations/{id}/read marks conversation as read |
| Description | Verify read receipt functionality. Automated via Playwright (e2e/api/conversations.spec.ts → MSG-API-011). |
| Tags | `messaging`, `conversations`, `read-receipts` |
| Test keys | `MSG-API-011` |
| Owner | `victor2026` |

**Steps:**
1. Login as alice@buzzhive.com → get userToken
2. POST /api/conversations to create conversation with bob → get convId
3. POST /api/conversations/{convId}/read with userToken
4. Verify status = 200
5. GET /api/conversations → verify `unread_count: 0` for this conversation

**Expected result:** 200 OK, unread count reset to 0.

**Click:** Create / Save

---

## Step 10: Create Test Case TC-009: GET /bookmarks returns 200 with auth

**Click path:** Test Cases → + Create

| Field | Value |
|-------|-------|
| Name | TC-009: GET /bookmarks returns 200 with auth |
| Description | Verify bookmarks endpoint requires auth and returns user's bookmarks. Automated via Playwright (e2e/api/health.spec.ts → HEALTH-API-006). |
| Tags | `bookmarks`, `api` |
| Test keys | `HEALTH-API-006` |
| Owner | `victor2026` |

**Steps:**
1. GET /api/bookmarks without auth → expect 401
2. Login as alice → get userToken
3. GET /api/bookmarks with userToken → expect 200
4. Verify response is array (or `{items: []}`)

**Expected result:** 401 without auth, 200 with auth.

**Click:** Create / Save

---

## Step 11: Create Test Plan "Buzzhive Core Smoke"

**Click path:** Test Plans (left sidebar) → + Create

| Field | Value |
|-------|-------|
| Name | Buzzhive Core Smoke |
| Description | Critical path coverage combining manual + automated tests. Run daily via Allure TestOps. |
| Tags | `smoke`, `core`, `regression` |

**Add test cases** (click + Add Test Case, search by name):
1. TC-001: User can register via UI
2. TC-002: Login with valid credentials returns 200 + token
3. TC-003: Login with deactivated account returns 400
4. TC-004: POST /posts rejects XSS script tag
5. TC-005: Moderator cannot ban admin user
6. TC-006: Password reset via email flow
7. TC-007: User can upload avatar
8. TC-008: POST /conversations/{id}/read marks as read
9. TC-009: GET /bookmarks returns 200 with auth

**Click:** Create / Save

---

## Step 12: Verify

1. Go back to Test Cases → should see 9 entries
2. Go to Test Plans → should see "Buzzhive Core Smoke" with 9 test cases
3. Click on a test case → see steps, description, tags

---

## After Setup

- Each daily cron run (06:00 UTC) will create a **launch** in Allure
- Launch will show pass/fail per test case
- Test Plan can be run manually: Test Plans → Buzzhive Core Smoke → Run
- This combines **manual** (TC-001, TC-003, TC-005, TC-006, TC-007) and **automated** (TC-002, TC-004, TC-008, TC-009) coverage in one place

---

## What This Gives Us

| Without Test Cases/Plans | With Test Cases/Plans |
|--------------------------|----------------------|
| Just launch history (raw test runs) | Structured test cases with steps |
| Can't track manual coverage | Manual + auto in one view |
| No test documentation | Steps are the test plan |
| Allure Report is enough | Allure TestOps adds value |

---

**Time estimate:** 20-30 minutes for 9 test cases + 1 plan.
