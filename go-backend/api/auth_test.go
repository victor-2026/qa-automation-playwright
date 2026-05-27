package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuthLoginValid(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.NotEmpty(t, loginResp.AccessToken)
	assert.NotEmpty(t, loginResp.RefreshToken)
	assert.Equal(t, "bearer", loginResp.TokenType)
}

func TestAuthLoginWrongPassword(t *testing.T) {
	resp, _, err := Login("alice@buzzhive.com", "wrongpassword")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestAuthLoginNonexistentEmail(t *testing.T) {
	resp, _, err := Login("nonexistent@test.com", "anypassword")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestAuthLoginEmptyBody(t *testing.T) {
	resp, err := HTTPClient().Post(BaseURL()+"/auth/login", "application/json", strings.NewReader(`{}`))
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Contains(t, []int{http.StatusBadRequest, http.StatusUnprocessableEntity}, resp.StatusCode)
}

func TestAuthMeValidToken(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req, _ := http.NewRequest("GET", BaseURL()+"/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)

	meResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer meResp.Body.Close()

	assert.Equal(t, http.StatusOK, meResp.StatusCode)

	var profile UserProfile
	err = json.NewDecoder(meResp.Body).Decode(&profile)
	require.NoError(t, err)
	assert.Equal(t, "alice@buzzhive.com", profile.Email)
	assert.NotEmpty(t, profile.ID)
	assert.NotEmpty(t, profile.Username)
	assert.NotEmpty(t, profile.DisplayName)
	assert.NotEmpty(t, profile.Role)
}

func TestAuthMeNoToken(t *testing.T) {
	req, _ := http.NewRequest("GET", BaseURL()+"/auth/me", nil)
	resp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Contains(t, []int{http.StatusUnauthorized, http.StatusForbidden}, resp.StatusCode)
}

func TestAuthRegisterNewUser(t *testing.T) {
	username := fmt.Sprintf("gotest_%d", time.Now().UnixNano())
	body := strings.NewReader(fmt.Sprintf(`{"email":"%s@test.com","password":"test123","username":"%s","display_name":"Go Test"}`, username, username))
	resp, err := HTTPClient().Post(BaseURL()+"/auth/register", "application/json", body)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	require.NoError(t, err)
	assert.Equal(t, username, result["username"])
}

func TestAuthRegisterDuplicate(t *testing.T) {
	body := strings.NewReader(`{"email":"bob@buzzhive.com","password":"bob123","username":"bob","display_name":"Bob"}`)
	resp, err := HTTPClient().Post(BaseURL()+"/auth/register", "application/json", body)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusConflict, resp.StatusCode)
}
