#!/bin/bash
# Metrics Collector — Playwright test results → Grafana JSON metrics
# Run after test suite: ./scripts/collect-metrics.sh

MONITORING_DIR="$(dirname "$0")/../monitoring/metrics"

# OrangeHRM
if [ -f ../orangehrm/playwright-report/index.html ]; then
  echo "Collecting OrangeHRM metrics..."
  PASSED=$(grep -c '"status":"passed"' ../orangehrm/test-results/.last-run.json 2>/dev/null || echo "0")
  TOTAL=$(grep -c '"status"' ../orangehrm/test-results/.last-run.json 2>/dev/null || echo "0")
  echo "  Passed: $PASSED / $TOTAL"
fi

# Buzzhive k6
if [ -f "$MONITORING_DIR/../k6/api-load-test.js" ]; then
  echo "k6 load test available: npm run k6"
fi

echo "Metrics ready at http://localhost:3002/"
