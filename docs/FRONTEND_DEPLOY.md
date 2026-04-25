# Frontend Deployment Guide

## Quick Deploy (Render)

### 1. Connect Repository
```
https://github.com/victor-2026/qa-automation-playwright
```

### 2. Create Web Service
- **Name**: `buzzhive-frontend`
- **Branch**: `main`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Start Command**: `npm run preview`

### 3. Environment Variables
```
VITE_API_URL=https://buzzhive-test.onrender.com/api
```

### 4. Deploy

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