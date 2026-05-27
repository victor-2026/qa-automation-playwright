package api

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

const (
	DefaultBaseURL = "http://localhost:8000/api"
	HTTPTimeout    = 15 * time.Second
	WarmUpTimeout  = 30 * time.Second
	WarmUpRetries  = 3
	WarmUpDelay    = 2 * time.Second
)

func BaseURL() string {
	if u := os.Getenv("API_BASE_URL"); u != "" {
		return u
	}
	if u := os.Getenv("APP_TARGET_URL"); u != "" {
		return u + "/api"
	}
	return DefaultBaseURL
}

func HTTPClient() *http.Client {
	return &http.Client{Timeout: HTTPTimeout}
}

func BearerHeader(token string) http.Header {
	h := http.Header{}
	h.Set("Authorization", "Bearer "+token)
	return h
}

func WarmUp(urls ...string) {
	client := &http.Client{Timeout: WarmUpTimeout}
	for _, u := range urls {
		for i := range WarmUpRetries {
			resp, err := client.Get(u)
			if err == nil {
				resp.Body.Close()
				if resp.StatusCode < 500 {
					break
				}
			}
			fmt.Printf("  warm-up %s attempt %d: %v\n", u, i+1, err)
			time.Sleep(WarmUpDelay)
		}
	}
}
