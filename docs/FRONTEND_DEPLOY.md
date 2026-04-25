# Frontend Deployment Guide — Render

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Render Infrastructure                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Service (Static)     Backend Service (API)       │
│  ─────────────────────          ──────────────────────        │
│  URL: qa-automation-play...    URL: buzzhive-test.onrender  │
│  Port: 80 (nginx)              Port: 8000 (FastAPI)         │
│                                                         │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │                                    │
    /login, /feed                      /api/auth/login,...
    (SPA → static files)              (HTTP → API)
```

## Render Services

### 1. Backend (already deployed)

| Setting | Value |
|---------|-------|
| URL | https://buzzhive-test.onrender.com |
| Type | Web Service |
| Port | 8000 |

**Status**: ✅ Running

**Test**:
```bash
curl https://buzzhive-test.onrender.com/api/health
```

---

### 2. Frontend (new deployment)

| Setting | Value |
|---------|-------|
| URL | https://qa-automation-playwright-1.onrender.com |
| Type | Web Service |
| Dockerfile | frontend/Dockerfile |

**Status**: ✅ Running

**Test**:
```bash
curl https://qa-automation-playwright-1.onrender.com/
# Should return HTML
```

---

## Deployment Files

### Dockerfile (frontend/Dockerfile)

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Config (frontend/nginx.conf)

**Current status**: CORS issues with browser login

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://buzzhive-test.onrender.com;
        proxy_http_version 1.1;
        proxy_set_header Host buzzhive-test.onrender.com;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
            return 204;
        }
        
        add_header 'Access-Control-Allow-Origin' '$http_origin';
        add_header 'Access-Control-Allow-Credentials' 'true';
    }

    location /uploads/ {
        proxy_pass http://buzzhive-test.onrender.com;
        proxy_http_version 1.1;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Current Status (2026-04-25)

### Working ✅
- Backend API deployed and accessible
- Frontend SPA deployed and accessible
- CI/CD smoke tests use backend directly

### Issues ⚠️
- **CORS**: Browser login from frontend → backend proxy has CORS issues
- **Workaround**: Use direct backend URL for API testing or CI tests

---

## Testing

### Direct Backend (works)
```bash
curl -X POST https://buzzhive-test.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@buzzhive.com","password":"alice123"}'
```

### Frontend (works for static)
```bash
curl https://qa-automation-playwright-1.onrender.com/
# Returns HTML
```

### Combined (CORS issues)
- Browser login from frontend → backend proxy = CORS error
- Use CI smoke tests instead

---

## CI/CD Integration

### Smoke Tests
- Uses direct backend: `https://buzzhive-test.onrender.com/api`
- Works in CI ✅

### Full Tests  
- Full suite runs locally with Docker
- Not practical for CI due to timeout (2+ hours)

---

## Local Development

```bash
# Backend
docker-compose up backend

# Frontend + tests
cd frontend && npm run dev
npm test -- e2e/smoke.spec.ts
```

---

## Commands Reference

```bash
# Build frontend locally
cd frontend
npm install
npm run build

# Deploy to Render
# 1. Connect repo to Render
# 2. Use Dockerfile: frontend/Dockerfile
# 3. Environment: (none needed for static)
```

---

## Notes

- Backend and Frontend are **separate Render services**
- Frontend nginx tries to proxy `/api/` to backend but has CORS issues
- For production: add CORS headers to backend code or use API gateway
- Current workaround: CI tests use direct backend URL