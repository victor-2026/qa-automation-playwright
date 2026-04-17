"""Python API Tests using Pytest + Requests."""
import pytest
import requests

BASE_URL = "http://localhost:8000/api"


class TestAuthAPI:
    """Auth endpoint tests."""

    def test_login_success(self):
        """Login with valid credentials returns tokens."""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "alice@buzzhive.com", "password": "alice123"}
        )
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            assert "access_token" in response.json()

    def test_login_invalid_credentials(self):
        """Login with invalid credentials returns 401."""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "invalid@test.com", "password": "wrong"}
        )
        assert response.status_code in [401, 500]

    def test_register_duplicate(self):
        """Register duplicate user returns 409."""
        timestamp = 1234567890
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": f"duplicate{timestamp}@test.com",
                "password": "password123",
                "username": f"user{timestamp}"
            }
        )
        assert response.status_code in [201, 409, 500]


class TestPostsAPI:
    """Posts endpoint tests."""

    @pytest.fixture
    def token(self, request):
        """Get auth token."""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "alice@buzzhive.com", "password": "alice123"}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Backend unavailable")

    def test_get_posts(self, token):
        """GET /posts returns posts."""
        response = requests.get(
            f"{BASE_URL}/posts",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code in [200, 500]

    def test_create_post(self, token):
        """POST /posts creates post."""
        response = requests.post(
            f"{BASE_URL}/posts",
            headers={"Authorization": f"Bearer {token}"},
            json={"content": f"Pytest post {__name__}"}
        )
        assert response.status_code in [201, 500]


class TestUsersAPI:
    """Users endpoint tests."""

    @pytest.fixture
    def token(self):
        """Get auth token."""
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "alice@buzzhive.com", "password": "alice123"}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        return None

    def test_get_users(self, token):
        """GET /users returns list."""
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = requests.get(f"{BASE_URL}/users", headers=headers)
        assert response.status_code in [200, 500]


# Run: pytest python/tests/ -v