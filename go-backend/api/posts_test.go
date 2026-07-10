package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPostsListPublic(t *testing.T) {
	resp, err := HTTPClient().Get(BaseURL() + "/posts")
	require.NoError(t, err)
	defer resp.Body.Close()

	requireHTTPStatus(t, resp, http.StatusOK, http.StatusUnauthorized, http.StatusForbidden)

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	require.NoError(t, err)

	items, ok := result["items"]
	if !ok {
		items = result
	}
	assert.NotNil(t, items)
}

func TestPostsListAuthenticated(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	req := createAuthRequest(t, "GET", BaseURL()+"/posts", loginResp.AccessToken, nil)
	listResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer listResp.Body.Close()

	assert.Equal(t, http.StatusOK, listResp.StatusCode)

	var result map[string]interface{}
	err = json.NewDecoder(listResp.Body).Decode(&result)
	require.NoError(t, err)

	items, ok := result["items"]
	if !ok {
		items = result
	}
	assert.NotNil(t, items)

	itemsArr, ok := items.([]interface{})
	if ok && len(itemsArr) > 0 {
		first, ok := itemsArr[0].(map[string]interface{})
		if ok {
			assert.NotEmpty(t, first["id"])
		}
	}
}

func TestPostsCreate(t *testing.T) {
	resp, loginResp, err := Login("bob@buzzhive.com", "bob123")
	require.NoError(t, err)
	resp.Body.Close()

	body, _ := json.Marshal(map[string]string{"title": "Go Test Post", "content": "Created by Go test"})
	req := createAuthRequest(t, "POST", BaseURL()+"/posts", loginResp.AccessToken, body)

	createResp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer createResp.Body.Close()

	assert.Equal(t, http.StatusCreated, createResp.StatusCode)

	var post map[string]interface{}
	err = json.NewDecoder(createResp.Body).Decode(&post)
	require.NoError(t, err)
	assert.NotEmpty(t, post["id"])

	// Cleanup: delete created post
	delReq := createAuthRequest(t, "DELETE", fmt.Sprintf("%s/posts/%s", BaseURL(), post["id"]), loginResp.AccessToken, nil)
	delResp, err := HTTPClient().Do(delReq)
	require.NoError(t, err)
	delResp.Body.Close()
}

func TestPostsCreateUnauthorized(t *testing.T) {
	body, _ := json.Marshal(map[string]string{"title": "Hack", "content": "No token"})
	resp, err := HTTPClient().Post(BaseURL()+"/posts", "application/json", bytes.NewReader(body))
	require.NoError(t, err)
	defer resp.Body.Close()

	requireHTTPStatus(t, resp, http.StatusUnauthorized, http.StatusForbidden)
}

func TestPostsGetByID(t *testing.T) {
	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()

	// Get first post ID
	req := createAuthRequest(t, "GET", BaseURL()+"/posts", loginResp.AccessToken, nil)
	listResp, err := HTTPClient().Do(req)
	require.NoError(t, err)

	var listResult map[string]interface{}
	err = json.NewDecoder(listResp.Body).Decode(&listResult)
	listResp.Body.Close()
	require.NoError(t, err)

	items, ok := listResult["items"].([]interface{})
	if !ok || len(items) == 0 {
		t.Skip("no posts available to test GET by ID")
	}

	first := items[0].(map[string]interface{})
	postID := first["id"].(string)

	// Get post by ID
	getReq := createAuthRequest(t, "GET", fmt.Sprintf("%s/posts/%s", BaseURL(), postID), loginResp.AccessToken, nil)
	getResp, err := HTTPClient().Do(getReq)
	require.NoError(t, err)
	defer getResp.Body.Close()

	assert.Equal(t, http.StatusOK, getResp.StatusCode)

	var post map[string]interface{}
	err = json.NewDecoder(getResp.Body).Decode(&post)
	require.NoError(t, err)
	assert.Equal(t, postID, post["id"])
}
