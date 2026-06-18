#!/bin/bash
# Weekly Grafana DORA screenshot → commit + push
# Run: scripts/weekly-dora-screenshot.sh

set -euo pipefail

PROJECT_DIR="/Users/victor/Projects/qa-automation-sandbox"
SCREENSHOT_PATH="/tmp/grafana-dora-weekly.png"

cd "$PROJECT_DIR"

echo "[$(date)] Taking Grafana screenshot..."
npx tsx scripts/screenshot-grafana.mjs 2>/dev/null

cp /tmp/grafana-dora.png "$PROJECT_DIR/docs/dora/grafana-dora-core.png"
echo "[$(date)] Screenshot copied"

# Git operations
git add -f docs/dora/grafana-dora-core.png
git commit -m "docs(dora): weekly Grafana screenshot — $(date +%Y-%m-%d)" --no-gpg-sign 2>/dev/null || echo "[$(date)] Nothing new to commit"

# Push using gh auth token
export GH_TOKEN=$(gh auth token 2>/dev/null || echo "")
if [ -n "$GH_TOKEN" ]; then
    git push https://victor-2026:${GH_TOKEN}@github.com/victor-2026/qa-automation-playwright.git main 2>/dev/null
    echo "[$(date)] Pushed successfully"
else
    echo "[$(date)] WARNING: Could not get gh token, push skipped"
fi

echo "[$(date)] Done"
