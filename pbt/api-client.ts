const API_BASE = 'http://localhost:8000/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})),
  };
}

export async function getMe(token: string) {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})),
  };
}

export async function register(email: string, password: string, username: string) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})),
  };
}

export async function getPosts() {
  const response = await fetch(`${API_BASE}/posts`);
  return {
    status: response.status,
    body: await response.json().catch(() => []),
  };
}

export async function getUser(username: string, token: string) {
  const response = await fetch(`${API_BASE}/users/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})),
  };
}

export async function getNotifications(token: string) {
  const response = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    status: response.status,
    body: await response.json().catch(() => []),
  };
}

export async function createPost(content: string, token: string) {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})),
  };
}
