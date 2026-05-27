package api

import (
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"
)

func TestMain(m *testing.M) {
	client := &http.Client{Timeout: WarmUpTimeout}
	for _, u := range []string{BaseURL() + "/health"} {
		for i := range WarmUpRetries {
			resp, err := client.Get(u)
			if err == nil {
				resp.Body.Close()
				if resp.StatusCode < 500 {
					fmt.Printf("  warm-up %s OK (status %d)\n", u, resp.StatusCode)
					break
				}
			}
			fmt.Printf("  warm-up %s attempt %d: %v\n", u, i+1, err)
			time.Sleep(WarmUpDelay)
		}
	}

	os.Exit(m.Run())
}
