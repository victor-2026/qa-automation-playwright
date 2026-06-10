# SOP: Deploy to Render

## Purpose
Deploy frontend + backend to Render free tier.

## When to Use
- After merging to main
- Auto-deploy on push (polling, no webhook)

## Steps

1. Push to main:
```bash
git push origin main
```

2. Wait for auto-deploy (10-20 min free tier cold start)

3. Verify backend health:
```bash
curl -s --max-time 30 https://buzzhive-test.onrender.com/health
```

4. Verify frontend:
```bash
curl -s --max-time 30 https://qa-automation-playwright-front.onrender.com/ | head -5
```

5. Run smoke tests:
```bash
npm run test:render
```

## Quality Checks
- Backend health returns `{"status":"healthy","database":"connected"}`
- Frontend returns HTML with React root
- Smoke API tests: 12/12 pass

## Failure Points
- Render free tier hibernates → first request returns 429 (wait 30s, retry)
- Neon DB connection → check sslmode stripped in config.py
- nginx proxy → needs `proxy_ssl_server_name on` + Host header
- Build context = Dockerfile directory (not repo root)

## Checklist
- [ ] Pushed to main
- [ ] Backend healthy
- [ ] Frontend loads
- [ ] Smoke tests pass
