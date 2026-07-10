package api

import (
    "bytes"
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "strings"
    "testing"
    "time"
    
    "github.com/stretchr/testify/require"
)

// ============================================================================
// Original Helper Functions (Maintained for Compatibility)
// ============================================================================

type LoginResponse struct {
    AccessToken  string `json:"access_token"`
    RefreshToken string `json:"refresh_token"`
    TokenType    string `json:"token_type"`
}

type loginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

// Login performs HTTP login request with given credentials
func Login(email, password string) (*http.Response, *LoginResponse, error) {
    var buf bytes.Buffer
    if err := json.NewEncoder(&buf).Encode(loginRequest{Email: email, Password: password}); err != nil {
        return nil, nil, fmt.Errorf("encode login body: %w", err)
    }
    resp, err := HTTPClient().Post(BaseURL()+"/auth/login", "application/json", &buf)
    if err != nil {
        return nil, nil, fmt.Errorf("login request: %w", err)
    }
    
    var loginResp LoginResponse
    if resp.StatusCode == http.StatusOK {
        if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
            return nil, nil, fmt.Errorf("decode login response: %w", err)
        }
    }
    return resp, &loginResp, nil
}

type UserProfile struct {
    ID          string `json:"id"`
    Email       string `json:"email"`
    Username    string `json:"username"`
    DisplayName string `json:"display_name"`
    Role        string `json:"role"`
}

type Post struct {
    ID    string `json:"id"`
    Title string `json:"title"`
}

func createAuthRequest(t *testing.T, method, url, token string, body []byte) *http.Request {
    t.Helper()
    var req *http.Request
    var err error
    if body != nil {
        req, err = http.NewRequest(method, url, bytes.NewReader(body))
    } else {
        req, err = http.NewRequest(method, url, nil)
    }
    require.NoError(t, err)
    
    if token != "" {
        req.Header.Set("Authorization", "Bearer "+token)
    }
    
    if body != nil {
        req.Header.Set("Content-Type", "application/json")
    }
    
    return req
}

func createRequest(t *testing.T, method, url string, body []byte, token string) *http.Request {
    t.Helper()
    
    var req *http.Request
    var err error
    
    if body != nil {
        req, err = http.NewRequest(method, url, bytes.NewReader(body))
    } else {
        req, err = http.NewRequest(method, url, nil)
    }
    
    require.NoError(t, err)
    
    if token != "" {
        req.Header.Set("Authorization", "Bearer "+token)
    }
    
    if body != nil {
        req.Header.Set("Content-Type", "application/json")
    }
    
    return req
}

// ============================================================================
// Enhanced Test Infrastructure Helpers
// ============================================================================

// safeJson safely parses HTTP responses, handling non-JSON responses gracefully
func safeJson(resp *http.Response) (map[string]interface{}, error) {
    if resp == nil {
        return nil, fmt.Errorf("nil response")
    }
    
    contentType := resp.Header.Get("Content-Type")
    
    // Check if it's JSON
    if contentType != "" && strings.Contains(contentType, "application/json") {
        var result map[string]interface{}
        defer resp.Body.Close()
        
        err := json.NewDecoder(resp.Body).Decode(&result)
        if err != nil && err != io.EOF {
            return nil, fmt.Errorf("decode JSON response: %w", err)
        }
        
        return result, nil
    }
    
    // For non-JSON responses, extract the body content
    bodyBytes, err := io.ReadAll(resp.Body)
    defer resp.Body.Close()
    
    if err != nil {
        return nil, fmt.Errorf("read response body: %w", err)
    }
    
    bodyStr := strings.TrimSpace(string(bodyBytes))
    
    // Check if it's HTML
    if strings.HasPrefix(bodyStr, "<") && strings.Contains(bodyStr, "</html>") {
        return map[string]interface{}{
            "error":    "HTML response",
            "status":   resp.StatusCode,
            "headers":  contentType,
            "body":     bodyStr,
        }, nil
    }
    
    // Plain text or other non-JSON content
    return map[string]interface{}{
        "error":    "Non-JSON response",
        "status":   resp.StatusCode,
        "headers":  contentType,
        "body":     bodyStr,
    }, nil
}

// retryWithBackoff implements exponential backoff with jitter for HTTP requests
func retryWithBackoff(operation func() (*http.Response, error), maxRetries int) (*http.Response, error) {
    if operation == nil {
        return nil, fmt.Errorf("nil operation function")
    }
    
    var lastErr error
    var lastResp *http.Response
    
    for attempt := 0; attempt < maxRetries; attempt++ {
        resp, err := operation()
        
        // Success condition: no error and valid response
        if err == nil && resp != nil {
            if resp.StatusCode >= 200 && resp.StatusCode < 300 {
                return resp, nil
            }
            
            // Server error (4xx or 5xx) - log and potentially retry
            if resp != nil {
                resp.Body.Close()
            }
            
            // Don't retry on client errors (4xx) except rate limiting
            if resp.StatusCode >= 400 && resp.StatusCode < 500 {
                switch resp.StatusCode {
                case http.StatusTooManyRequests:
                    time.Sleep(time.Duration(attempt+1) * 2 * time.Second)
                    continue
                case http.StatusUnauthorized, http.StatusForbidden:
                    return resp, err
                default:
                    return resp, err
                }
            }
        }
        
        lastResp = resp
        lastErr = err
        
        // Calculate backoff with jitter
        if attempt < maxRetries-1 {
            backoff := time.Duration(1<<uint(attempt)) * time.Second
            if backoff > 10 * time.Second {
                backoff = 10 * time.Second
            }
            time.Sleep(backoff)
        }
    }
    
    return lastResp, lastErr
}

// ============================================================================
// Cleanup Registry for Test Resource Management
// ============================================================================

var cleanupRegistry []func()

// RegisterCleanup adds a cleanup function to be called at the end of the test
func RegisterCleanup(fn func()) {
    cleanupRegistry = append(cleanupRegistry, fn)
}

// RunCleanup executes all registered cleanup functions
func RunCleanup() {
    for _, fn := range cleanupRegistry {
        fn()
    }
    cleanupRegistry = nil
}

// ============================================================================
// Test Infrastructure Setup
// ============================================================================

// SetupTestInfrastructure configures the test environment
func SetupTestInfrastructure() {
}

// CleanupTestInfrastructure performs cleanup operations
func CleanupTestInfrastructure() {
}

// ============================================================================
// Test Infrastructure Setup
// ============================================================================

// randomSuffix generates a random hex string for unique test usernames
func randomSuffix() string {
	b := make([]byte, 4)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// RegisterAndLogin registers a new user and logs in, returning a valid token.
func RegisterAndLogin(email, password, username string) (*http.Response, *LoginResponse, error) {
	client := HTTPClient()
	regBody, _ := json.Marshal(map[string]string{
		"email": email, "password": password, "username": username,
		"display_name": username,
	})
	regReq, err := http.NewRequest("POST", BaseURL()+"/auth/register", bytes.NewReader(regBody))
	if err != nil {
		return nil, nil, fmt.Errorf("register request: %w", err)
	}
	regReq.Header.Set("Content-Type", "application/json")
	regResp, err := client.Do(regReq)
	if err != nil {
		return nil, nil, fmt.Errorf("register do: %w", err)
	}
	io.Copy(io.Discard, regResp.Body)
	regResp.Body.Close()

	if regResp.StatusCode != http.StatusOK && regResp.StatusCode != http.StatusCreated {
		return nil, nil, fmt.Errorf("register returned status %d for %s", regResp.StatusCode, email)
	}

	loginBody, _ := json.Marshal(map[string]string{"email": email, "password": password})
	loginReq, err := http.NewRequest("POST", BaseURL()+"/auth/login", bytes.NewReader(loginBody))
	if err != nil {
		return nil, nil, fmt.Errorf("login request: %w", err)
	}
	loginReq.Header.Set("Content-Type", "application/json")
	loginResp, err := client.Do(loginReq)
	if err != nil {
		return nil, nil, fmt.Errorf("login do: %w", err)
	}
	var lr LoginResponse
	if loginResp.StatusCode == http.StatusOK {
		if err := json.NewDecoder(loginResp.Body).Decode(&lr); err != nil {
			return nil, nil, fmt.Errorf("decode login response: %w", err)
		}
	} else {
		bodyBytes, _ := io.ReadAll(loginResp.Body)
		loginResp.Body.Close()
		return nil, nil, fmt.Errorf("login returned status %d: %s", loginResp.StatusCode, string(bodyBytes))
	}
	return loginResp, &lr, nil
}

// AdminLogin returns an admin token for admin-only endpoints
func AdminLogin(t *testing.T) *LoginResponse {
	t.Helper()
	resp, loginResp, err := Login("admin@buzzhive.com", "admin123")
	require.NoError(t, err)
	resp.Body.Close()
	return loginResp
}

// CreateTestPost creates a post and returns its ID for test assertions
func CreateTestPost(t *testing.T, token, title, content string) string {
	t.Helper()
	body, _ := json.Marshal(map[string]string{"title": title, "content": content})
	req := createRequest(t, "POST", BaseURL()+"/posts", body, token)
	resp, err := HTTPClient().Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()
	requireHTTPStatus(t, resp, http.StatusCreated)
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result["id"].(string)
}

// init registers global test setup
func init() {
    SetupTestInfrastructure()
}