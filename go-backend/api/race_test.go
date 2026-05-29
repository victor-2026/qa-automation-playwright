package api

import (
	"net/http"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRaceParallelLogin(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping race test in short mode")
	}

	const concurrency = 10
	var wg sync.WaitGroup
	results := make([]int, concurrency)
	errors := make([]error, concurrency)

	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			resp, _, err := Login("alice@buzzhive.com", "alice123")
			if resp != nil {
				resp.Body.Close()
				results[idx] = resp.StatusCode
			}
			errors[idx] = err
		}(i)
	}
	wg.Wait()

	for i := 0; i < concurrency; i++ {
		assert.NoError(t, errors[i], "goroutine %d had error", i)
		assert.Equal(t, http.StatusOK, results[i], "goroutine %d had unexpected status", i)
	}
}

func TestRaceParallelFollowUnfollow(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping race test in short mode")
	}

	resp, loginResp, err := Login("alice@buzzhive.com", "alice123")
	require.NoError(t, err)
	resp.Body.Close()
	require.NotEmpty(t, loginResp.AccessToken)

	const concurrency = 5
	var wg sync.WaitGroup
	statuses := make([]int, concurrency*2)

	// Follow
	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			req := createAuthRequest(t, "POST", BaseURL()+"/users/bob_photo/follow", loginResp.AccessToken, nil)
			r, err := HTTPClient().Do(req)
			if err == nil {
				r.Body.Close()
				statuses[idx] = r.StatusCode
			}
		}(i)
	}

	// Unfollow
	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			req := createAuthRequest(t, "DELETE", BaseURL()+"/users/bob_photo/follow", loginResp.AccessToken, nil)
			r, err := HTTPClient().Do(req)
			if err == nil {
				r.Body.Close()
				statuses[concurrency+idx] = r.StatusCode
			}
		}(i)
	}

	wg.Wait()

	// All should be 2xx or 4xx (no 5xx)
	for i, s := range statuses {
		if s > 0 {
			assert.Less(t, s, 500, "goroutine %d got 5xx: %d", i, s)
		}
	}
}
