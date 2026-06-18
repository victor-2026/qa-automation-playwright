# QA Metrics Dashboard

Self-contained HTML dashboard for Buzzhive + OrangeHRM test metrics.

## Open

```bash
./start.sh
```

Or open directly: **`dashboard.html`** in any browser. No server needed — all data is embedded.

## Dashboards (3 tabs)

| Tab | Data | What It Shows |
|-----|------|---------------|
| OrangeHRM — Coverage | orangehrm-coverage | 20%→65% over 6 phases, KPIs, timeline table |
| Buzzhive — Test Health | buzzhive-test-health | Pass rate 78%→94%, API coverage, flaky→0, suite growth |
| Buzzhive — Quality Gates | buzzhive-quality-gates | Mutation 28→34/34, contract tests 17+9+2 |

## Updating Data

Edit `metrics/*.json` → run this to regenerate:

```bash
python3 -c "
import json
data = {}
for f in ['orangehrm-coverage.json','buzzhive-test-health.json','buzzhive-quality-gates.json','buzzhive-api-latency.json']:
    with open(f'metrics/{f}') as fh: data[f.replace('.json','')] = json.load(fh)
# paste full dashboard.html generation here
"
```

Or add data rows manually and regenerate via the script above.

## Screenshots for LinkedIn

Open `dashboard.html` → switch tab → Cmd+Shift+4 → capture.
