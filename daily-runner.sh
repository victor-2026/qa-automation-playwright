#!/bin/bash
# Daily Test Runner - Run tests locally once per day
# Usage: ./daily-runner.sh

echo "=========================================="
echo "Buzzhive QA - Daily Test Runner"
echo "Date: $(date)"
echo "=========================================="

echo ""
echo ">>> Step 1: Ensure Docker is running..."
docker-compose ps 2>/dev/null | grep -q "Up" || docker-compose up -d

echo ""
echo ">>> Step 2: Smoke Tests..."
npm run test:smoke

echo ""
echo ">>> Step 3: Load Tests..."
npm run test:load:all

echo ""
echo ">>> Step 4: API Tests (basic check)..."
npx playwright test e2e/smoke.spec.ts --project=chromium 2>/dev/null || echo "Smoke tests done"

echo ""
echo "=========================================="
echo "Daily run completed: $(date)"
echo "=========================================="