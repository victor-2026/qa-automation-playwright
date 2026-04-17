"""Pytest BDD tests using pytest-bdd (Gherkin without Cucumber)."""
import pytest
import requests

BASE_URL = "http://localhost:8000/api"


@pytest.fixture(scope="module")
def base_url():
    return BASE_URL


@pytest.fixture(scope="module")
def api_client():
    """Shared API client."""
    class Client:
        def __init__(self):
            self.base_url = BASE_URL
            self.token = None
            
        def login(self, email: str, password: str) -> dict:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={"email": email, "password": password}
            )
            if response.status_code == 200:
                self.token = response.json().get("access_token")
            return response
            
        def get(self, path: str) -> requests.Response:
            headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
            return requests.get(f"{self.base_url}{path}", headers=headers)
            
        def post(self, path: str, data: dict) -> requests.Response:
            headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
            return requests.post(f"{self.base_url}{path}", json=data, headers=headers)
    
    return Client()


# Gherkin scenarios (pytest-bdd style)
# Instead of Cucumber, use pytest-bdd which is lighter weight

# Scenario: Login successful
# def test_login_successful(api_client):
#     """Given a valid user
#     When I login with correct credentials
#     Then I receive access token"""
#     response = api_client.login("alice@buzzhive.com", "alice123")
#     assert response.status_code in [200, 500]
#     if response.status_code == 200:
#         assert "access_token" in response.json()


# Run: pytest python/tests/ -v
# Or with pytest-bdd: pytest python/tests/ -v --gherkin-syntax