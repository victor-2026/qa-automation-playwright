package api

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

const DefaultBaseURL = "http://localhost:8000/api"

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
	return &http.Client{Timeout: 15 * time.Second}
}

func BearerHeader(token string) http.Header {
	h := http.Header{}
	h.Set("Authorization", "Bearer "+token)
	return h
}

func WarmUp(urls ...string) {
	client := &http.Client{Timeout: 30 * time.Second}
	for _, u := range urls {
		for i := 0; i < 3; i++ {
			resp, err := client.Get(u)
			if err == nil {
				resp.Body.Close()
				if resp.StatusCode < 500 {
					break
				}
			}
			fmt.Printf("  warm-up %s attempt %d: %v\n", u, i+1, err)
			time.Sleep(2 * time.Second)
		}
	}
}
