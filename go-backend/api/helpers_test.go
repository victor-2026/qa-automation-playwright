package api

import (
	"net/http"
	"testing"
)

func requireHTTPStatus(t *testing.T, resp *http.Response, allowed ...int) {
	t.Helper()
	for _, code := range allowed {
		if resp.StatusCode == code {
			return
		}
	}
	t.Errorf("unexpected status code: got %d, want %v", resp.StatusCode, allowed)
}
