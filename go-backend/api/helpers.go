package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

func Login(email, password string) (*http.Response, *LoginResponse, error) {
	body := strings.NewReader(fmt.Sprintf(`{"email":"%s","password":"%s"}`, email, password))
	resp, err := HTTPClient().Post(BaseURL()+"/auth/login", "application/json", body)
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
