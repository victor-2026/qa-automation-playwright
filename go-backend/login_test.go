package main

import (
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/playwright-community/playwright-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func warmUp(url string) {
	client := &http.Client{Timeout: 30 * time.Second}
	for i := 0; i < 3; i++ {
		resp, err := client.Get(url)
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode < 500 {
				fmt.Printf("  warm-up %s OK (status %d)\n", url, resp.StatusCode)
				return
			}
		}
		fmt.Printf("  warm-up %s attempt %d: %v\n", url, i+1, err)
		time.Sleep(3 * time.Second)
	}
}

// Helper function to manage page setup and teardown for Go Playwright tests
func runTestWithPage(t *testing.T, testFunc func(playwright.Page, string)) {
	baseURL := os.Getenv("APP_TARGET_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}

	warmUp(baseURL + "/login")

	pw, err := playwright.Run()
	if err != nil {
		t.Fatalf("Could not start Playwright: %v", err)
	}
	defer func() {
		_ = pw.Stop()
	}()

	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(true),
	})
	if err != nil {
		t.Fatalf("Could not launch browser: %v", err)
	}
	defer func() {
		_ = browser.Close()
	}()

	page, err := browser.NewPage()
	if err != nil {
		t.Fatalf("Could not create page: %v", err)
	}

	page.On("response", func(res playwright.Response) {
		t.Logf("🌐 RESPONSE LOG: %d %s", res.Status(), res.URL())
	})

	response, err := page.Goto(baseURL+"/login", playwright.PageGotoOptions{
		WaitUntil: playwright.WaitUntilStateNetworkidle,
	})
	if err != nil {
		t.Fatalf("Failed navigation to login page: %v", err)
	}
	if response == nil {
		t.Fatal("Failed navigation to login page: received nil response")
	}
	if response.Status() != 200 {
		t.Fatalf("Login page returned status %d for %s; ensure frontend is running at %s", response.Status(), response.URL(), baseURL)
	}

	testFunc(page, baseURL)
}

// TestUserLoginFlow verifies successful login with valid credentials (AUTH-001)
func TestUserLoginFlow(t *testing.T) {
	runTestWithPage(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("admin@buzzhive.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("admin123"))

		response, err := page.ExpectResponse("**/api/auth/login*", func() error {
			return page.Locator("[data-testid='auth-login-btn']").Click()
		}, playwright.PageExpectResponseOptions{
			Timeout: playwright.Float(6000),
		})
		require.NoError(t, err)
		require.NotNil(t, response)
		require.Equal(t, 200, response.Status())

		require.NoError(t, page.WaitForURL(baseURL+"/"))

		visible, err := page.Locator("[data-testid='nav-profile']").IsVisible()
		require.NoError(t, err)
		assert.True(t, visible, "Profile nav link should be visible after login")

		accessToken, err := page.Evaluate("localStorage.getItem('access_token')")
		require.NoError(t, err)
		assert.NotEmpty(t, accessToken)

		refreshToken, err := page.Evaluate("localStorage.getItem('refresh_token')")
		require.NoError(t, err)
		assert.NotEmpty(t, refreshToken)
	})
}

// TestUserLoginWrongPassword verifies login failure with incorrect credentials (AUTH-002)
func TestUserLoginWrongPassword(t *testing.T) {
	runTestWithPage(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("admin@buzzhive.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("wrongpassword"))

		response, err := page.ExpectResponse("**/api/auth/login*", func() error {
			return page.Locator("[data-testid='auth-login-btn']").Click()
		}, playwright.PageExpectResponseOptions{
			Timeout: playwright.Float(6000),
		})
		require.NoError(t, err)
		require.NotNil(t, response)
		require.Equal(t, 401, response.Status())

		require.NoError(t, page.WaitForURL(baseURL+"/login"))

		visible, err := page.Locator("[data-testid='auth-error-message']").IsVisible()
		require.NoError(t, err)
		assert.True(t, visible, "Error message should be visible on failed login")

		accessToken, err := page.Evaluate("localStorage.getItem('access_token')")
		require.NoError(t, err)
		assert.Nil(t, accessToken)
	})
}

// TestUserLoginInvalidEmail verifies login failure with a non-existent email address (AUTH-009)
func TestUserLoginInvalidEmail(t *testing.T) {
	runTestWithPage(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("wrong@buzzhive.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("admin123"))

		response, err := page.ExpectResponse("**/api/auth/login*", func() error {
			return page.Locator("[data-testid='auth-login-btn']").Click()
		}, playwright.PageExpectResponseOptions{
			Timeout: playwright.Float(6000),
		})
		require.NoError(t, err)
		require.NotNil(t, response)
		require.Equal(t, 401, response.Status())

		require.NoError(t, page.WaitForURL(baseURL+"/login"))

		visible, err := page.Locator("[data-testid='auth-error-message']").IsVisible()
		require.NoError(t, err)
		assert.True(t, visible, "Error message should be visible on failed login")
	})
}

// TestUserLoginHTML5EmailValidation verifies browser-level email validation for malformed email (AUTH-009)
func TestUserLoginHTML5EmailValidation(t *testing.T) {
	runTestWithPage(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("invalid-email"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("admin123"))
		require.NoError(t, page.Locator("[data-testid='auth-login-btn']").Click())

		validValue, err := page.Locator("[data-testid='auth-email-input']").Evaluate("el => el.validity.valid", nil)
		require.NoError(t, err)
		assert.False(t, validValue.(bool), "Email input should be invalid for malformed email format")
	})
}

// TestUserLoginSQLInjection verifies that SQL injection payloads are blocked (AUTH-010)
func TestUserLoginSQLInjection(t *testing.T) {
	sqlPayloads := []string{
		"' OR '1'='1",
		"admin'--",
		"' OR 1=1--",
		"'; DROP TABLE users;--",
	}

	for _, payload := range sqlPayloads {
		t.Run(payload, func(t *testing.T) {
			runTestWithPage(t, func(page playwright.Page, baseURL string) {
				require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("alice@buzzhive.com"))
				require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill(payload))

			response, err := page.ExpectResponse("**/api/auth/login*", func() error {
				return page.Locator("[data-testid='auth-login-btn']").Click()
			}, playwright.PageExpectResponseOptions{
				Timeout: playwright.Float(10000),
			})
			require.NoError(t, err)
			require.NotNil(t, response)
			require.Contains(t, []int{401, 403}, response.Status())

			if response.Status() == 401 {
				require.NoError(t, page.WaitForURL(baseURL+"/login"))

				visible, err := page.Locator("[data-testid='auth-error-message']").IsVisible()
				require.NoError(t, err)
				assert.True(t, visible, "Error message should be visible on 401")
			}
			})
		})
	}
}
