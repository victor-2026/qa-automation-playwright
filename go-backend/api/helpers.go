package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

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
