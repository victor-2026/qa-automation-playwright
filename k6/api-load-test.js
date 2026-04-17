// K6 Load Tests for Buzzhive API
// Run: k6 run k6/api-load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api';

// Custom metrics
const errors = new Counter('errors');
const successRate = new Rate('success_rate');

// Options
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up
    { duration: '1m', target: 10 },   // Stay at 10
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    success_rate: ['rate>0.95'],
  },
};

export default function () {
  // 1. Login
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'alice@buzzhive.com', password: 'alice123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  const loginOk = check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => r.json('access_token') !== undefined,
  });
  
  if (!loginOk) {
    errors.add(1);
    return;
  }
  
  const token = loginRes.json('access_token');
  const headers = { Authorization: `Bearer ${token}` };
  
  // 2. Get posts
  const postsRes = http.get(`${BASE_URL}/posts`, { headers });
  check(postsRes, { 'posts status 200': (r) => r.status === 200 });
  
  // 3. Get users
  const usersRes = http.get(`${BASE_URL}/users`, { headers });
  check(usersRes, { 'users status 200': (r) => r.status === 200 });
  
  sleep(1);
}

// Quick test (low load)
export const quickOptions = {
  vus: 5,
  duration: '30s',
};

// Stress test (high load)
export const stressOptions = {
  vus: 50,
  duration: '2m',
};