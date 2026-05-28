package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFollowUser(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "POST", BaseURL()+"/users/bob_photo/follow", loginResp.AccessToken, nil)
	followResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer followResp.Body.Close()

	requireHTTPStatus(t, followResp, http.StatusCreated, http.StatusConflict)

	if followResp.StatusCode == http.StatusCreated {
		var followRes map[string]interface{}
		err = json.NewDecoder(followResp.Body).Decode(&followRes)
		require.NoError(t, err)
		assert.Equal(t, "accepted", followRes["status"])
		assert.NotEmpty(t, followRes["id"])
	}
}

func TestFollowSelf(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "POST", BaseURL()+"/users/alice_dev/follow", loginResp.AccessToken, nil)
	selfResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer selfResp.Body.Close()

	assert.Equal(t, http.StatusBadRequest, selfResp.StatusCode)
}

func TestFollowUnauthorized(t *testing.T) {
	req, _ := http.NewRequest("POST", BaseURL()+"/users/bob_photo/follow", nil)
	resp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	requireHTTPStatus(t, resp, http.StatusUnauthorized, http.StatusForbidden)
}

func TestUnfollowUser(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	// Follow first
	followReq := createAuthRequest(t, "POST", BaseURL()+"/users/bob_photo/follow", loginResp.AccessToken, nil)
	followResp, err := HTTPClient().Do(followReq)
	require.NoError(t, err)
	followResp.Body.Close()

	// Unfollow
	unfollowReq := createAuthRequest(t, "DELETE", BaseURL()+"/users/bob_photo/follow", loginResp.AccessToken, nil)
	unfollowResp, err := HTTPClient().Do(unfollowReq)
	require.NoError(t, err)
	defer unfollowResp.Body.Close()

	assert.Equal(t, http.StatusNoContent, unfollowResp.StatusCode)
}

func TestFollowDuplicate(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	username := fmt.Sprintf("gotest_dup_%d", time.Now().UnixNano())
	regBody := fmt.Sprintf(`{"email":"%s@test.com","password":"test123","username":"%s","display_name":"Dupe Test"}`, username, username)
	regResp, err := HTTPClient().Post(BaseURL()+"/auth/register", "application/json", bytes.NewReader([]byte(regBody)))
	require.NoError(t, err)
	regResp.Body.Close()

	// Follow once
	req := createAuthRequest(t, "POST", BaseURL()+"/users/"+username+"/follow", loginResp.AccessToken, nil)
	firstResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	firstResp.Body.Close()

	// Follow again — should be 409
	req2 := createAuthRequest(t, "POST", BaseURL()+"/users/"+username+"/follow", loginResp.AccessToken, nil)
	secondResp, err := HTTPClient().Do(req2)
	require.NoError(t, err)
	defer secondResp.Body.Close()

	requireHTTPStatus(t, secondResp, http.StatusConflict)
}
