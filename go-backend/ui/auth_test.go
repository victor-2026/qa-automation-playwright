package main

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/playwright-community/playwright-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func uiBaseURL() string {
	if u := os.Getenv("APP_TARGET_URL"); u != "" {
		return u
	}
	return "http://localhost:3000"
}

func runUITest(t *testing.T, fn func(playwright.Page, string)) {
	pw, err := playwright.Run()
	require.NoError(t, err)
	defer pw.Stop()

	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(true),
	})
	require.NoError(t, err)
	defer browser.Close()

	page, err := browser.NewPage()
	require.NoError(t, err)

	baseURL := uiBaseURL()
	_, err = page.Goto(baseURL+"/login", playwright.PageGotoOptions{
		WaitUntil: playwright.WaitUntilStateNetworkidle,
	})
	require.NoError(t, err)

	fn(page, baseURL)
}

func TestUILoginSessionPersists(t *testing.T) {
	runUITest(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("alice@buzzhive.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("alice123"))

		_, err := page.ExpectResponse("**/api/auth/login*", func() error {
			return page.Locator("[data-testid='auth-login-btn']").Click()
		})
		require.NoError(t, err)
		require.NoError(t, page.WaitForURL(baseURL + "/"))

		_, err = page.Reload()
		require.NoError(t, err)
		require.NoError(t, page.WaitForURL(baseURL+"/", playwright.PageWaitForURLOptions{
			Timeout: playwright.Float(15000),
		}))
		time.Sleep(3 * time.Second)

		err = page.Locator("[data-testid='nav-profile']").WaitFor(playwright.LocatorWaitForOptions{
			Timeout: playwright.Float(10000),
		})
		require.NoError(t, err)

		accessToken, err := page.Evaluate("localStorage.getItem('access_token')")
		require.NoError(t, err)
		assert.NotEmpty(t, accessToken)
	})
}

func TestUIAdminLogin(t *testing.T) {
	runUITest(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("admin@buzzhive.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("admin123"))

		response, err := page.ExpectResponse("**/api/auth/login*", func() error {
			return page.Locator("[data-testid='auth-login-btn']").Click()
		})
		require.NoError(t, err)
		require.Equal(t, 200, response.Status())
		require.NoError(t, page.WaitForURL(baseURL + "/"))

		time.Sleep(1 * time.Second)

		refreshToken, err := page.Evaluate("localStorage.getItem('refresh_token')")
		require.NoError(t, err)
		assert.NotEmpty(t, refreshToken)
	})
}

func TestUILogout(t *testing.T) {
	runUITest(t, func(page playwright.Page, baseURL string) {
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill("alice@buzzhive.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("alice123"))

		_, err := page.ExpectResponse("**/api/auth/login*", func() error {
			return page.Locator("[data-testid='auth-login-btn']").Click()
		})
		require.NoError(t, err)
		require.NoError(t, page.WaitForURL(baseURL + "/"))

		// Logout triggers async POST /api/auth/logout
		_, err = page.ExpectResponse("**/api/auth/logout*", func() error {
			return page.Locator("[data-testid='auth-logout-btn']").Click()
		})
		require.NoError(t, err)
		time.Sleep(2 * time.Second)

		// Tokens should be cleared from localStorage
		accessToken, err := page.Evaluate("localStorage.getItem('access_token')")
		require.NoError(t, err)
		assert.Nil(t, accessToken)
	})
}

func TestUIRegisterNewUser(t *testing.T) {
	runUITest(t, func(page playwright.Page, baseURL string) {
		// Navigate to register page from login page link
		require.NoError(t, page.Locator("a[href='/register']").Click())
		time.Sleep(1 * time.Second)

		uniqueName := fmt.Sprintf("goui_%d", time.Now().UnixNano()%100000)
		require.NoError(t, page.Locator("[data-testid='auth-username-input']").Fill(uniqueName))
		require.NoError(t, page.Locator("[data-testid='auth-email-input']").Fill(uniqueName+"@test.com"))
		require.NoError(t, page.Locator("[data-testid='auth-password-input']").Fill("test123"))
		require.NoError(t, page.Locator("[data-testid='auth-display-name-input']").Fill("Go UI Test"))

		_, err := page.ExpectResponse("**/api/auth/register*", func() error {
			return page.Locator("[data-testid='auth-register-btn']").Click()
		})
		require.NoError(t, err)

		time.Sleep(1 * time.Second)
		assert.NotEqual(t, baseURL+"/register", page.URL())
	})
}
