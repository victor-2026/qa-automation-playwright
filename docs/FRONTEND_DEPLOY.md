# Frontend Deployment Guide

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Frontend (Web)    │ ──────► │   Backend (API)      │
│ (your-app.onrender) │         │ buzzhive-test.onrender │
└─────────────────────┘         └─────────────────────┘
        │                            │
   VITE_API_URL ──────────────► https://buzzhive-test.onrender.com/api
```

## Quick Deploy (Render)

### 1. Backend (already deployed)
```
URL: https://buzzhive-test.onrender.com
Status: ✅ Running
```

### 2. Deploy Frontend (new service)

**Render Dashboard → New → Web Service**

| Setting          | Value                                         |
| ---------------- | --------------------------------------------- |
| Name             | `buzzhive-frontend`                           |
| Branch           | `main`                                        |
| Build Command    | `cd frontend && npm install && npm run build` |
| Output Directory | `dist`                                        |
| Start Command    | `npx serve dist`                              |

### 3. Environment Variables

```
VITE_API_URL=https://buzzhive-test.onrender.com/api
```

---

## Alternative: Static Hosting (GitHub Pages)

```bash
cd frontend
npm run build
# Upload dist/ folder to GitHub Pages
```

---

## Environment

| Variable | Backend | Frontend |
|----------|---------|----------|
| Local | http://localhost:8000 | http://localhost:3000 |
| Render | https://buzzhive-test.onrender.com | (your-frontend).onrender.com |

---

## Frontend Structure

```
frontend/
├── src/
│   ├── api/          # API client
│   ├── components/   # UI components
│   ├── pages/       # Route pages
│   └── context/     # Auth state
├── package.json
├── vite.config.ts
└── Dockerfile
```

---

## Development

```bash
# Local
cd frontend
npm run dev

# API in docker-compose
docker-compose up backend
```