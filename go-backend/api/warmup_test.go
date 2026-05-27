package api

import (
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"
)

func TestMain(m *testing.M) {
	urls := []string{
		BaseURL() + "/health",
	}

	client := &http.Client{Timeout: 30 * time.Second}
	for _, u := range urls {
		for i := 0; i < 3; i++ {
			resp, err := client.Get(u)
			if err == nil {
				resp.Body.Close()
				if resp.StatusCode < 500 {
					fmt.Printf("  warm-up %s OK (status %d)\n", u, resp.StatusCode)
					break
				}
			}
			fmt.Printf("  warm-up %s attempt %d: %v\n", u, i+1, err)
			time.Sleep(3 * time.Second)
		}
	}

	os.Exit(m.Run())
}
