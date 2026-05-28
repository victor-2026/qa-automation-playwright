package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUsersListPublic(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "GET", BaseURL()+"/users", loginResp.AccessToken, nil)
	listResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer listResp.Body.Close()

	assert.Equal(t, http.StatusOK, listResp.StatusCode)

	var result map[string]interface{}
	err = json.NewDecoder(listResp.Body).Decode(&result)
	require.NoError(t, err)

	items, ok := result["items"].([]interface{})
	assert.True(t, ok, "response should have items array")
	if ok && len(items) > 0 {
		first := items[0].(map[string]interface{})
		assert.NotEmpty(t, first["username"])
	}
	assert.NotZero(t, result["total"])
}

func TestUsersProfileByUsername(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "GET", BaseURL()+"/users/bob_photo", loginResp.AccessToken, nil)
	profileResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer profileResp.Body.Close()

	assert.Equal(t, http.StatusOK, profileResp.StatusCode)

	var profile map[string]interface{}
	err = json.NewDecoder(profileResp.Body).Decode(&profile)
	require.NoError(t, err)
	assert.Equal(t, "bob_photo", profile["username"])
	assert.Equal(t, "bob@buzzhive.com", profile["email"])
	assert.NotEmpty(t, profile["id"])
	assert.NotEmpty(t, profile["display_name"])
	assert.NotEmpty(t, profile["role"])
	assert.NotNil(t, profile["is_following"])
	assert.NotNil(t, profile["is_followed_by"])
}

func TestUsersProfileByUsernamePublic(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "GET", BaseURL()+"/users/alice_dev", loginResp.AccessToken, nil)
	profileResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer profileResp.Body.Close()

	assert.Equal(t, http.StatusOK, profileResp.StatusCode)

	var profile map[string]interface{}
	err = json.NewDecoder(profileResp.Body).Decode(&profile)
	require.NoError(t, err)
	assert.Equal(t, "alice_dev", profile["username"])
}

func TestUsersProfileNotFound(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "GET", BaseURL()+"/users/nonexistent_user_xyz", loginResp.AccessToken, nil)
	notFoundResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer notFoundResp.Body.Close()

	assert.Equal(t, http.StatusNotFound, notFoundResp.StatusCode)
}

func TestUsersUpdateProfile(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	body, _ := json.Marshal(map[string]string{
		"display_name": "Alice Updated",
	})
	req := createAuthRequest(t, "PATCH", BaseURL()+"/users/me", loginResp.AccessToken, body)
	updateResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer updateResp.Body.Close()

	assert.Equal(t, http.StatusOK, updateResp.StatusCode)

	var profile map[string]interface{}
	err = json.NewDecoder(updateResp.Body).Decode(&profile)
	require.NoError(t, err)
	assert.Equal(t, "Alice Updated", profile["display_name"])
	assert.Equal(t, "alice_dev", profile["username"])

	// Restore original display_name
	restoreBody, _ := json.Marshal(map[string]string{
		"display_name": "Alice",
	})
	restoreReq := createAuthRequest(t, "PATCH", BaseURL()+"/users/me", loginResp.AccessToken, restoreBody)
	restoreResp, err := HTTPClient().Do(restoreReq)
	require.NoError(t, err)
	restoreResp.Body.Close()
	assert.Equal(t, http.StatusOK, restoreResp.StatusCode)
}

func TestUsersUpdateProfileUnauthorized(t *testing.T) {
	body, _ := json.Marshal(map[string]string{"display_name": "Hacker"})
	req, _ := http.NewRequest("PATCH", BaseURL()+"/users/me", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	requireHTTPStatus(t, resp, http.StatusUnauthorized, http.StatusForbidden)
}
