package api

import (
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
	return &http.Client{Timeout: 10 * time.Second}
}

func BearerHeader(token string) http.Header {
	h := http.Header{}
	h.Set("Authorization", "Bearer "+token)
	return h
}
