# Test Cases - Buzzhive Social Network

**Reference:** All test implementations are in `e2e/buzzhive.spec.ts`

---

## Summary

| Category | Count | Priority Breakdown |
|----------|-------|-------------------|
| Authentication | 19 | critical: 14, high: 5 |
| API Tests | 65 | critical: 40, high: 25 |
| Navigation | 4 | high |
| Posts | 2 | high |
| Profile | 2 | medium |
| Messages | 1 | medium |
| Notifications | 2 | medium |
| Search | 8 | high |
| Admin | 4 | critical |
| Moderator | 3 | high |
| Performance | 4 | medium |
| **TOTAL** | **120** | |

---

## Authentication

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| AUTH-001 | Login with valid credentials | critical | UI | buzzhive.spec.ts:27 |
| AUTH-001 | JWT tokens stored | critical | UI | buzzhive.spec.ts:42 |
| AUTH-001 | Session persists on reload | critical | UI | buzzhive.spec.ts:64 |
| AUTH-001 | Sidebar shows username | critical | UI | buzzhive.spec.ts:82 |
| AUTH-001 | Admin can login | critical | UI | buzzhive.spec.ts:277 |
| AUTH-002 | Wrong password error | critical | UI | buzzhive.spec.ts:98 |
| AUTH-002 | No tokens on failed login | critical | UI | buzzhive.spec.ts:243 |
| AUTH-002 | Stay on login page | critical | UI | buzzhive.spec.ts:265 |
| AUTH-003 | Banned user blocked | high | Integration | buzzhive.spec.ts:800 |
| AUTH-004 | Registration - all fields | critical | UI | buzzhive.spec.ts:289 |
| AUTH-004 | Registration - email validation | critical | UI | buzzhive.spec.ts:299 |
| AUTH-004 | Registration - password validation | critical | UI | buzzhive.spec.ts:314 |
| AUTH-009 | Wrong email error | critical | UI | buzzhive.spec.ts:210 |
| AUTH-009 | HTML5 email validation | high | UI | buzzhive.spec.ts:231 |
| AUTH-010 | SQL injection in password | critical | Security | buzzhive.spec.ts:152 |
| AUTH-010 | SQL injection in email | critical | Security | buzzhive.spec.ts:172 |
| AUTH-010 | XSS in fields blocked | critical | Security | buzzhive.spec.ts:191 |
| AUTH-011 | Password boundary (1 char) | high | Boundary | buzzhive.spec.ts:107 |
| AUTH-011 | Password boundary (6 chars) | high | Boundary | buzzhive.spec.ts:122 |

---

## API - Authentication

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-AUTH-001 | POST /auth/login returns tokens | critical | API | buzzhive.spec.ts:1074 |
| API-AUTH-001 | Wrong password returns 401 | critical | API | buzzhive.spec.ts:1090 |
| API-AUTH-002 | GET /auth/me returns profile | critical | API | buzzhive.spec.ts:1102 |
| API-AUTH-002 | No token returns 403 | critical | API | buzzhive.spec.ts:1124 |
| API-AUTH-003 | Register creates user | critical | API | buzzhive.spec.ts:1131 |
| API-AUTH-003 | Duplicate email returns 409 | high | API | buzzhive.spec.ts:1149 |
| API-AUTH-004 | POST /auth/refresh | high | API | buzzhive.spec.ts:1163 |
| API-AUTH-005 | POST /auth/logout | high | API | buzzhive.spec.ts:1188 |

---

## API - Posts

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-POST-001 | GET /posts returns list | critical | API | buzzhive.spec.ts:1363 |
| API-POST-002 | POST /posts creates post | critical | API | buzzhive.spec.ts:1379 |
| API-POST-003 | GET /posts/feed | critical | API | buzzhive.spec.ts:1396 |
| API-POST-004 | POST /posts/{id}/like | high | API | buzzhive.spec.ts:1412 |
| API-POST-005 | DELETE /posts/{id}/like | high | API | buzzhive.spec.ts:1456 |
| API-POST-006 | POST /posts/{id}/comments | high | API | buzzhive.spec.ts:1500 |
| API-POST-007 | GET /posts/{id}/comments | high | API | buzzhive.spec.ts:1545 |
| API-POST-008 | GET /posts without auth | critical | API | buzzhive.spec.ts:1589 |

---

## API - Users

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-USER-001 | GET /users returns list | high | API | buzzhive.spec.ts:1613 |
| API-USER-002 | GET /users/{username} | high | API | buzzhive.spec.ts:1627 |
| API-USER-003 | POST /users/{username}/follow | high | API | buzzhive.spec.ts:1641 |
| API-USER-004 | DELETE /users/{username}/follow | high | API | buzzhive.spec.ts:1655 |
| API-USER-005 | GET /users/{username}/followers | high | API | buzzhive.spec.ts:1669 |
| API-USER-006 | GET /users/{username}/following | high | API | buzzhive.spec.ts:1683 |

---

## API - Messages

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-MSG-001 | GET /conversations | high | API | buzzhive.spec.ts:1239 |
| API-MSG-002 | POST /conversations/dm/{username} | high | API | buzzhive.spec.ts:1250 |
| API-MSG-003 | GET /conversations/{id} | high | API | buzzhive.spec.ts:1262 |
| API-MSG-004 | POST /conversations/{id}/read | high | API | buzzhive.spec.ts:1286 |
| API-MSG-005 | DELETE /conversations/{id} | high | API | buzzhive.spec.ts:1315 |
| API-MSG-006 | GET /conversations without auth | critical | API | buzzhive.spec.ts:1339 |

---

## API - Notifications

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-NOTIF-001 | GET /notifications | high | API | buzzhive.spec.ts:1715 |
| API-NOTIF-002 | GET /notifications/unread-count | high | API | buzzhive.spec.ts:1729 |
| API-NOTIF-003 | POST /notifications/read-all | high | API | buzzhive.spec.ts:1743 |
| API-NOTIF-004 | POST /notifications/{id}/read | high | API | buzzhive.spec.ts:1757 |
| API-NOTIF-005 | Mark one read without auth | critical | API | buzzhive.spec.ts:1787 |

---

## API - Admin

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-ADMIN-001 | GET /admin/stats | critical | API | buzzhive.spec.ts:1775 |
| API-ADMIN-002 | GET /admin/users | high | API | buzzhive.spec.ts:1789 |
| API-ADMIN-003 | GET /admin/posts | high | API | buzzhive.spec.ts:1803 |
| API-ADMIN-004 | Non-admin blocked | critical | API | buzzhive.spec.ts:1817 |
| API-ADMIN-EXT-001 | PATCH /admin/users/{id} | high | API | buzzhive.spec.ts:2092 |
| API-ADMIN-EXT-002 | DELETE /admin/posts/{id} | high | API | buzzhive.spec.ts:2107 |
| API-ADMIN-EXT-003 | PATCH /admin/users/{id}/ban | high | API | buzzhive.spec.ts:2272 |
| API-ADMIN-EXT-004 | PATCH /admin/users/{id}/unban | high | API | buzzhive.spec.ts:2286 |
| API-ADMIN-EXT-005 | DELETE /admin/users/{id} | high | API | buzzhive.spec.ts:2300 |

---

## API - Other

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| API-HEALTH-001 | GET /health | critical | API | buzzhive.spec.ts:1835 |
| API-RESET-001 | POST /reset | high | API | buzzhive.spec.ts:1841 |
| API-COMMENT-001 | POST /comments/{id}/like | high | API | buzzhive.spec.ts:1865 |
| API-COMMENT-002 | DELETE /comments/{id}/like | high | API | buzzhive.spec.ts:1879 |
| API-COMMENT-003 | GET /comments/{id}/replies | high | API | buzzhive.spec.ts:1893 |
| API-BOOK-001 | GET /bookmarks | medium | API | buzzhive.spec.ts:1925 |
| API-FOLLOW-001 | GET /follows/requests | high | API | buzzhive.spec.ts:1957 |
| API-FOLLOW-002 | POST /follows/requests/{id}/accept | high | API | buzzhive.spec.ts:1971 |
| API-FOLLOW-003 | POST /follows/requests/{id}/reject | high | API | buzzhive.spec.ts:1985 |
| API-POST-EXT-001 | GET /posts/{id} | high | API | buzzhive.spec.ts:2017 |
| API-POST-EXT-002 | PATCH /posts/{id} | high | API | buzzhive.spec.ts:2031 |
| API-POST-EXT-003 | DELETE /posts/{id} | high | API | buzzhive.spec.ts:2046 |
| API-POST-EXT-004 | GET /users/{username}/posts | high | API | buzzhive.spec.ts:2060 |
| API-UPLOAD-001 | POST /upload/image (valid) | high | API | buzzhive.spec.ts:2139 |
| API-UPLOAD-002 | POST /upload/image (reject) | high | API | buzzhive.spec.ts:2165 |
| API-UPLOAD-003 | POST /upload/image (no auth) | critical | API | buzzhive.spec.ts:2191 |
| API-MOD-001 | DELETE /posts/{id} by mod | high | API | buzzhive.spec.ts:2226 |
| API-MOD-002 | Non-owner blocked | high | API | buzzhive.spec.ts:2240 |

---

## E2E - Navigation

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| NAV-001 | Navigation elements visible | high | UI | buzzhive.spec.ts:430 |
| NAV-002 | Navigate to profile | medium | UI | buzzhive.spec.ts:445 |
| NAV-003 | Navigate to search | medium | UI | buzzhive.spec.ts:457 |
| NAV-004 | Navigate to explore | medium | UI | buzzhive.spec.ts:468 |

---

## E2E - Posts

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| POST-001 | Feed shows posts | high | UI | buzzhive.spec.ts:482 |
| POST-002 | Create a post | critical | UI | buzzhive.spec.ts:493 |
| POST-003 | Like and unlike | high | UI | buzzhive.spec.ts:604 |
| POST-004 | Bookmark a post | medium | UI | buzzhive.spec.ts:627 |
| POST-005 | Add comment | high | UI | buzzhive.spec.ts:646 |

---

## E2E - Search

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| SEARCH-001 | Search page loads | high | UI | buzzhive.spec.ts:848 |
| SEARCH-002 | Search for users | high | UI | buzzhive.spec.ts:863 |
| SEARCH-003 | Search for posts | high | UI | buzzhive.spec.ts:884 |
| SEARCH-004 | Search for hashtags | high | UI | buzzhive.spec.ts:907 |
| SEARCH-005 | Search via Enter key | medium | UI | buzzhive.spec.ts:930 |
| SEARCH-006 | Display result counts | medium | UI | buzzhive.spec.ts:949 |
| SEARCH-007 | Empty search results | medium | UI | buzzhive.spec.ts:973 |
| SEARCH-008 | Tab switching | medium | UI | buzzhive.spec.ts:997 |

---

## E2E - Admin/Moderator

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| ADMIN-001 | Dashboard shows stats | critical | UI | buzzhive.spec.ts:751 |
| ADMIN-002 | Admin can ban user | critical | UI | buzzhive.spec.ts:781 |
| ADMIN-003 | Change user role | high | UI | buzzhive.spec.ts:811 |
| ADMIN-004 | Regular user blocked | critical | UI | buzzhive.spec.ts:768 |
| MOD-001 | Moderator access panel | high | UI | buzzhive.spec.ts:696 |
| MOD-002 | Moderator delete posts | high | UI | buzzhive.spec.ts:711 |
| MOD-003 | Moderator cannot ban | high | UI | buzzhive.spec.ts:733 |

---

## E2E - Other

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| PROFILE-001 | Profile shows info | medium | UI | buzzhive.spec.ts:515 |
| PROFILE-002 | Navigate to settings | medium | UI | buzzhive.spec.ts:531 |
| MSG-001 | Messages page | medium | UI | buzzhive.spec.ts:552 |
| NOTIF-001 | Notifications page | medium | UI | buzzhive.spec.ts:568 |
| NOTIF-002 | Mark all as read | medium | UI | buzzhive.spec.ts:582 |
| SOCIAL-001 | Follow and unfollow | high | UI | buzzhive.spec.ts:671 |
| LOGOUT-001 | Can logout | critical | UI | buzzhive.spec.ts:830 |

---

## Performance

| ID | Test Name | Priority | Type | Location |
|----|-----------|----------|------|----------|
| PERF-001 | Login page < 2s | medium | Performance | buzzhive.spec.ts:332 |
| PERF-001 | Feed < 3s | medium | Performance | buzzhive.spec.ts:342 |
| PERF-001 | API < 500ms | medium | Performance | buzzhive.spec.ts:357 |
| PERF-002 | Navigation < 1s | medium | Performance | buzzhive.spec.ts:371 |
| PERF-002 | Post creation < 2s | medium | Performance | buzzhive.spec.ts:387 |
| PERF-003 | Rapid actions | medium | Performance | buzzhive.spec.ts:406 |

---

## Priority Legend

| Priority | Description |
|----------|-------------|
| critical | Must pass for release |
| high | Important, should pass |
| medium | Nice to have |

## Type Legend

| Type | Description |
|------|-------------|
| UI | End-to-end UI test |
| API | API integration test |
| Integration | Cross-component test |
| Security | Security validation |
| Boundary | Edge case testing |
| Performance | Performance test |

---

## Примеры реализации тест-кейсов в разных форматах

### 1. Gherkin (Cucumber) — Текущий формат

```gherkin
# features/auth.feature
Feature: Buzzhive Authentication

  Scenario: Login with valid credentials
    Given I am on the login page
    When I enter "alice@buzzhive.com" as email
    And I enter "alice123" as password
    And I click the login button
    Then I should be logged in

# Запуск: npm run test:gherkin
```

---

### 2. Python (Pytest + Table-Driven) — БЕЗ Gherkin/Cucumber

**Python List (Inline):**
```python
# python/tests/test_auth.py
import pytest
import requests

BASE_URL = "http://localhost:8000/api"

TEST_CASES = [
    # (email, password, expected_status, check_token)
    ("alice@buzzhive.com", "alice123", 200, True),
    ("alice@buzzhive.com", "wrongpassword", 401, False),
    ("", "alice123", 422, False),
]

@pytest.mark.parametrize("email,password,expected,check_token", TEST_CASES)
def test_login(email, password, expected, check_token):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == expected
    if check_token:
        assert "access_token" in response.json()

# Запуск: pytest python/tests/test_auth.py -v
```

**JSON (External):**
```python
# python/tests/test_auth_json.py
import json
import pytest
import requests

BASE_URL = "http://localhost:8000/api"

with open("python/tests/test_data/auth_cases.json") as f:
    cases = json.load(f)

@pytest.mark.parametrize("case", cases)
def test_login_json(case):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": case["email"], "password": case["password"]}
    )
    assert response.status_code == case["expected"]

# python/tests/test_data/auth_cases.json:
# [
#   {"email": "alice@buzzhive.com", "password": "alice123", "expected": 200},
#   {"email": "wrong@test.com", "password": "wrong", "expected": 401}
# ]
```

---

### 3. YAML (Data-Driven) — БЕЗ Gherkin/Cucumber

```yaml
# python/tests/test_data/auth.yaml
- name: "Login valid"
  method: "POST"
  path: "/auth/login"
  body:
    email: "alice@buzzhive.com"
    password: "alice123"
  expected_status: 200

- name: "Login wrong password"
  method: "POST"
  path: "/auth/login"
  body:
    email: "alice@buzzhive.com"
    password: "wrong"
  expected_status: 401

- name: "Login missing email"
  method: "POST"
  path: "/auth/login"
  body:
    email: ""
    password: "alice123"
  expected_status: 422
```

```python
# python/tests/test_yaml.py
import yaml
import pytest
import requests

BASE_URL = "http://localhost:8000/api"

with open("python/tests/test_data/auth.yaml") as f:
    cases = list(yaml.safe_load_all(f))

@pytest.mark.parametrize("case", cases)
def test_auth_yaml(case):
    response = requests.request(
        case["method"],
        f"{BASE_URL}{case['path']}",
        json=case.get("body")
    )
    assert response.status_code == case["expected_status"]

# Запуск: pytest python/tests/test_yaml.py -v
```

---

### 4. JSON/Groovy (CI/CD) — БЕЗ Gherkin/Cucumber

**JSON Test Suite:**
```json
// python/tests/test_data/auth_suite.json
{
  "name": "Auth API Tests",
  "tests": [
    {
      "id": "AUTH-001",
      "method": "POST",
      "path": "/auth/login",
      "body": {"email": "alice@buzzhive.com", "password": "alice123"},
      "expected": 200
    },
    {
      "id": "AUTH-002",
      "method": "POST",
      "path": "/auth/login",
      "body": {"email": "alice@buzzhive.com", "password": "wrong"},
      "expected": 401
    }
  ]
}
```

**Groovy (Jenkins Pipeline):**
```groovy
// jenkins/auth_tests.groovy
def tests = [
    [email: "alice@buzzhive.com", password: "alice123", expected: 200],
    [email: "wrong@test.com", password: "wrong", expected: 401]
]

tests.each { tc ->
    def response = httpPost(
        url: "http://localhost:8000/api/auth/login",
        body: tc
    )
    assert response.status == tc.expected
}
```

---

## Какой формат выбрать

| Количество тестов | Рекомендуемый формат | Инструменты |
|-------------------|---------------------|-------------|
| < 20 тестов | Python list (inline) | pytest + requests |
| 20-100 тестов | YAML файлы | pytest + pyyaml |
| 100+ тестов | JSON suite | pytest + requests |
| CI/CD | Groovy | Jenkins Pipeline |
| BDD с бизнесом | Gherkin | Cucumber |

---

## Переход с Gherkin на другой формат

| Из Gherkin | На Python | На YAML | На JSON |
|-----------|----------|---------|---------|
| Feature: Auth | `test_auth.py` | `auth.yaml` | `auth_suite.json` |
| Scenario: Login | `@pytest.mark.parametrize` | `- name: "Login"` | `{ "id": "AUTH-001" }` |
| Given/When/Then | `requests.post()` | `method: POST` | `"method": "POST"` |

---

## TC Mapping Status (2026-04-24)

**Reference:** See `TC_MAPPING.md` for full mapping between frontend TC and e2e/ tests

| Source | Format | Count |
|--------|--------|-------|
| Frontend `/docs` | TC-AUTH-001 | 60 |
| e2e/ code | AUTH-API-001 | ~90 |

**Naming differs:** TC-{MODULE}-{###} vs {MODULE}-API-{###}

### Covered by e2e/

- ✅ Auth, Posts, Follows, Comments

### Missing (HIGH Priority)

| TC ID | Description |
|-------|--------------|
| TC-EDGE-010 | Private account post visibility |
| TC-FOL-002 | Follow request to private account |

---

*Generated: 2026-04-17*
*Updated: 2026-04-24 (TC mapping added)*
*See also: TC_MAPPING.md*
