"""Auth API tests - Python list (inline table-driven)"""
import pytest
import requests

BASE_URL = "http://localhost:8000/api"

# Inline test cases - same as Gherkin scenarios
# Format: (email, password, expected_status, check_token)
TEST_CASES = [
    # Valid login (from Gherkin: "Login with valid credentials")
    ("alice@buzzhive.com", "alice123", 200, True),
    
    # Wrong password (from Gherkin: "Login wrong password")
    ("alice@buzzhive.com", "wrongpassword", 401, False),
    
    # Invalid email
    ("invalid@test.com", "anypassword", 401, False),
    
    # Missing email
    ("", "alice123", 422, False),
    
    # Missing password
    ("alice@buzzhive.com", "", 422, False),
]


@pytest.mark.parametrize("email,password,expected,check_token", TEST_CASES)
def test_login(email, password, expected, check_token):
    """Test authentication login scenarios."""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    
    # Assert status code
    assert response.status_code == expected, \
        f"Expected {expected}, got {response.status_code}"
    
    # Check token if expected
    if check_token and expected == 200:
        assert "access_token" in response.json(), \
            "Expected access_token in response"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])