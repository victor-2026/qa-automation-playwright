#!/usr/bin/env python3
"""Generate monthly DORA report pages from metrics JSON files.

Reads monitoring/metrics/*.json, groups by month, computes DORA levels,
and writes markdown pages to docs/dora/.
"""

import json
import os
from collections import defaultdict
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
METRICS_DIR = BASE_DIR / "monitoring" / "metrics"
OUTPUT_DIR = BASE_DIR / "docs" / "dora"

DORA_BENCHMARKS = {
    "deploy_freq": [
        ("Elite", "Daily or more"),
        ("High", "Weekly to monthly"),
        ("Medium", "Monthly to every 6 months"),
        ("Low", "Less than every 6 months"),
    ],
    "lead_time": [
        ("Elite", "Less than 1 hour"),
        ("High", "Less than 1 day"),
        ("Medium", "Less than 1 week"),
        ("Low", "More than 1 week"),
    ],
    "mttr": [
        ("Elite", "Less than 1 hour"),
        ("High", "Less than 1 day"),
        ("Medium", "Less than 1 week"),
        ("Low", "More than 1 week"),
    ],
    "cfr": [
        ("Elite", "0–5%"),
        ("High", "5–10%"),
        ("Medium", "10–15%"),
        ("Low", ">15%"),
    ],
}


def load_json(path):
    with open(path) as f:
        return json.load(f)


def month_key(date_str):
    return date_str[:7]


def last_of_month(items):
    """Return the latest item (by date) from a list."""
    return max(items, key=lambda x: x["date"])


def cfr_level(pct):
    if pct <= 5:
        return "Elite"
    elif pct <= 10:
        return "High"
    elif pct <= 15:
        return "Medium"
    return "Low"


def hours_level(h):
    if h <= 1:
        return "Elite"
    elif h <= 24:
        return "High"
    elif h <= 168:
        return "Medium"
    return "Low"


def deploy_level(count_per_month):
    if count_per_month >= 30:
        return "Elite"
    elif count_per_month >= 4:
        return "High"
    elif count_per_month >= 1:
        return "Medium"
    return "Low"


def trend_arrow(current, previous):
    if previous is None:
        return "—"
    diff = current - previous
    if diff > 0:
        return "↑"
    elif diff < 0:
        return "↓"
    return "→"


def build_buzzhive_months(dora, health, gates):
    """Group buzzhive data by month, return {month: metrics_dict}."""
    months = {}

    # Group dora-core by month
    dora_by_month = defaultdict(list)
    for item in dora:
        dora_by_month[month_key(item["date"])].append(item)

    # Group test-health by month
    health_by_month = defaultdict(list)
    for item in health:
        health_by_month[month_key(item["date"])].append(item)

    # Group quality-gates by month
    gates_by_month = defaultdict(list)
    for item in gates:
        gates_by_month[month_key(item["date"])].append(item)

    all_months = sorted(set(
        list(dora_by_month.keys()) +
        list(health_by_month.keys()) +
        list(gates_by_month.keys())
    ))

    for m in all_months:
        d = last_of_month(dora_by_month[m]) if m in dora_by_month else None
        h = last_of_month(health_by_month[m]) if m in health_by_month else None
        g = last_of_month(gates_by_month[m]) if m in gates_by_month else None

        # CFR from pipe_pass (100 - pass_rate = failure rate)
        pipe_pass = d["pipe_pass"] if d else (h["pass_rate"] if h else None)
        cfr = round(100 - pipe_pass, 1) if pipe_pass else None

        # Mutation CFR alternative
        mutation_cfr = None
        if d and d["mutation_total"] > 0:
            mutation_cfr = round(
                (1 - d["mutation_caught"] / d["mutation_total"]) * 100, 1
            )

        months[m] = {
            "date": d["date"] if d else (h["date"] if h else m),
            "cfr": cfr,
            "mutation_cfr": mutation_cfr,
            "mutation_caught": d["mutation_caught"] if d else None,
            "mutation_total": d["mutation_total"] if d else None,
            "flaky_count": d["flaky_count"] if d else (h["flaky_count"] if h else None),
            "pipe_pass": pipe_pass,
            "regression_hours": d["regression_hours"] if d else None,
            "pass_rate": h["pass_rate"] if h else None,
            "api_coverage": h["api_coverage_pct"] if h else None,
            "tests_total": h["tests_total"] if h else None,
            "mutation_passed": g["mutation_passed"] if g else None,
            "contract_schema": g["contract_schema"] if g else None,
            "contract_consumer": g["contract_consumer"] if g else None,
            "contract_provider": g["contract_provider"] if g else None,
        }
    return months


def render_index(months, orange_months):
    lines = [
        "---",
        "title: DORA Monthly Reports",
        "layout: default",
        "---",
        "",
        "# DORA Monthly Reports",
        "",
        "Centralised DORA metrics dashboard for QA Automation Sandbox projects.",
        "",
        "---",
        "",
        "## Buzzhive (qa-automation-sandbox)",
        "",
        "| Month | CFR | Lead Time | MTTR | Mutation CFR | Flaky | Trend |",
        "|-------|-----|-----------|------|--------------|-------|-------|",
    ]

    sorted_months = sorted(months.keys())
    prev = None
    for m in sorted_months:
        d = months[m]
        cfr_str = f"{d['cfr']}%" if d["cfr"] is not None else "N/A"
        lead_str = f"{d['regression_hours']}h" if d["regression_hours"] is not None else "N/A"
        mttr_str = lead_str
        mut_str = (
            f"{d['mutation_caught']}/{d['mutation_total']}"
            if d["mutation_caught"] is not None else "N/A"
        )
        flaky_str = str(d["flaky_count"]) if d["flaky_count"] is not None else "N/A"
        tr = trend_arrow(d["cfr"], months[prev]["cfr"] if prev else None)
        label = datetime.strptime(m, "%Y-%m").strftime("%B %Y")
        lines.append(
            f"| [{label}](buzzhive/{m}.md) | {cfr_str} | {lead_str} | {mttr_str} | {mut_str} | {flaky_str} | {tr} |"
        )
        prev = m

    lines += [
        "",
        "### DORA Levels (June 2026)",
        "",
        f"| Metric | Value | Level |",
        "|--------|-------|-------|",
    ]

    latest = months.get("2026-06", months.get("2026-05"))
    if latest and latest["cfr"] is not None:
        lines.append(f"| CFR | {latest['cfr']}% | {cfr_level(latest['cfr'])} |")
    if latest and latest.get("regression_hours"):
        lines.append(f"| Lead Time | {latest['regression_hours']}h | {hours_level(latest['regression_hours'])} |")
        lines.append(f"| MTTR | {latest['regression_hours']}h | {hours_level(latest['regression_hours'])} |")

    lines += [
        "",
        "[Methodology →](methodology.md)",
        "",
        "---",
        "",
        "## OrangeHRM",
        "",
        "| Month | Coverage | Modules | POMs | Smoke Tests |",
        "|-------|----------|---------|------|-------------|",
    ]

    for m in sorted(orange_months.keys()):
        d = orange_months[m]
        label = datetime.strptime(m, "%Y-%m").strftime("%B %Y")
        lines.append(
            f"| [{label}](orangehrm/{m}.md) | {d['coverage_pct']}% | {d['modules_covered']} | {d['pom_count']} | {d['smoke_tests']} |"
        )

    lines += [
        "",
        "> **Note:** OrangeHRM does not yet have DORA core metrics (CI/CD, Allure).",
        "> Only test coverage data is available at this stage.",
        "",
        "---",
        "",
        "[Grafana Dashboard →](http://localhost:3003/d/dora-core/dora-core-e28094-qa-metrics)",
        "",
    ]
    return "\n".join(lines)


def render_methodology():
    return """---
title: DORA Methodology
layout: default
---

# DORA Methodology — QA Adaptation

## Metrics Mapping

| DORA Metric | Buzzhive Proxy | Why |
|-------------|----------------|-----|
| **Deployment Frequency** | CI pipeline runs / month | Allure TestOps CI runs count |
| **Lead Time for Changes** | Regression test duration (hours) | Time from commit to regression verification |
| **MTTR** | Same as Lead Time (current) | Recovery = regression fix + re-run |
| **Change Failure Rate** | `100% — pipeline pass rate` | Failed pipeline = broken change |

## Levels (DORA 2025 Benchmarks)

| Level | CFR | Lead Time | MTTR | Deployment Frequency |
|-------|-----|-----------|------|---------------------|
| **Elite** | 0–5% | < 1 hour | < 1 hour | Daily or more |
| **High** | 5–10% | < 1 day | < 1 day | Weekly to monthly |
| **Medium** | 10–15% | < 1 week | < 1 week | Monthly to 6 months |
| **Low** | > 15% | > 1 week | > 1 week | < every 6 months |

## Quality Gates (Buzzhive-specific)

- **Mutation tests**: % caught → complements CFR
- **Contract tests**: schema + consumer + provider = 28 total
- **Flaky count**: 0 = target, tracked per month

## Data Sources

| Source | Path | Update |
|--------|------|--------|
| DORA Core | `monitoring/metrics/dora-core.json` | Manual, per milestone |
| Test Health | `monitoring/metrics/buzzhive-test-health.json` | Manual, per milestone |
| Quality Gates | `monitoring/metrics/buzzhive-quality-gates.json` | Manual, per milestone |
| OrangeHRM | `monitoring/metrics/orangehrm-coverage.json` | Manual, per phase |
| Allure TestOps | `victor2026.testops.cloud` | Automated (CI) |
"""


def render_buzzhive_month(month_key, d):
    label = datetime.strptime(month_key, "%Y-%m").strftime("%B %Y")
    cfr_str = f"{d['cfr']}%" if d["cfr"] is not None else "N/A"
    lines = [
        f"---",
        f"title: Buzzhive DORA Report — {label}",
        f"layout: default",
        f"---",
        "",
        f"# Buzzhive — {label} DORA Report",
        "",
        f"**Report date:** {d['date']}",
        "",
        "## Summary",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Pipeline Pass Rate | {d['pipe_pass']}% |",
        f"| Change Failure Rate | {cfr_str} |",
        f"| Lead Time for Changes | {d['regression_hours']}h |" if d["regression_hours"] is not None else "",
        f"| MTTR | {d['regression_hours']}h |" if d["regression_hours"] is not None else "",
        f"| Test Pass Rate | {d['pass_rate']}% |" if d["pass_rate"] is not None else "",
        f"| API Coverage | {d['api_coverage']}% |" if d["api_coverage"] is not None else "",
        f"| Flaky Tests | {d['flaky_count']} |",
        "",
        "## Mutation Testing",
        "",
        f"| Metric | Value |",
        "|--------|-------|",
        f"| Mutations Caught | {d['mutation_caught']} / {d['mutation_total']} |",
        f"| Mutation CFR | {d['mutation_cfr']}% |",
    ]

    if d["mutation_passed"] is not None:
        lines += [
            "",
            "## Quality Gates",
            "",
            "| Gate | Passed / Total |",
            "|------|---------------|",
            f"| Mutation Tests | {d['mutation_passed']} / {d['mutation_total']} |",
            f"| Contract Schema | {d['contract_schema']} / 17 |",
            f"| Contract Consumer | {d['contract_consumer']} / 9 |",
            f"| Contract Provider | {d['contract_provider']} / 2 |",
        ]

    lines += [
        "",
        "## DORA Level",
        "",
        "| Metric | Value | Level |",
        "|--------|-------|-------|",
    ]
    if d["cfr"] is not None:
        lines.append(f"| CFR | {d['cfr']}% | {cfr_level(d['cfr'])} |")
    if d["regression_hours"] is not None:
        lines.append(f"| Lead Time | {d['regression_hours']}h | {hours_level(d['regression_hours'])} |")
        lines.append(f"| MTTR | {d['regression_hours']}h | {hours_level(d['regression_hours'])} |")

    lines += [
        "",
        f"[← All months](index.md) · [Methodology →](../methodology.md)",
        "",
    ]
    return "\n".join([l for l in lines if l])


def render_april():
    return """---
title: Buzzhive DORA Report — April 2026
layout: default
---

# Buzzhive — April 2026 DORA Report

> ⚠️ **Structured metrics collection started in May 2026.**
> April data is limited to qualitative assessment from session archives.

## What We Know

| Aspect | Status |
|--------|--------|
| Project start | April 2026 |
| First test suite | ~489 tests (JS/Python/Go) |
| API Coverage | ~94% |
| PBT Coverage | 100% |
| DORA Metrics | **Not collected** — first Grafana data point is May 15 |

## DORA Levels

| Metric | Value | Level |
|--------|-------|-------|
| CFR | N/A | — |
| Lead Time | N/A | — |
| MTTR | N/A | — |
| Deployment Frequency | N/A | — |

## Why No Data?

- Allure TestOps was not yet integrated (integrated June 16)
- No CI/CD monitoring (first Uptime Monitor run: June 2026)
- Session checkpoints started from May 2026

See [May report](2026-05.md) for the first structured DORA metrics.

[← All months](index.md) · [Methodology →](../methodology.md)
"""


def build_orange_months(coverage):
    months = {}
    cov_by_month = defaultdict(list)
    for item in coverage:
        cov_by_month[month_key(item["date"])].append(item)
    for m in sorted(cov_by_month.keys()):
        d = last_of_month(cov_by_month[m])
        months[m] = d
    return months


def render_orange_month(month_key, d):
    label = datetime.strptime(month_key, "%Y-%m").strftime("%B %Y")
    return f"""---
title: OrangeHRM Report — {label}
layout: default
---

# OrangeHRM — {label} Report

**Report date:** {d['date']}
**Phase:** {d['phase']}

## Coverage Metrics

| Metric | Value |
|--------|-------|
| Tests Passed | {d['passed']} / {d['total']} |
| Coverage | {d['coverage_pct']}% |
| Modules Covered | {d['modules_covered']} |
| Page Objects | {d['pom_count']} |
| Smoke Tests | {d['smoke_tests']} |

## DORA Status

| Metric | Status | Notes |
|--------|--------|-------|
| CFR | ❌ N/A | No CI/CD pipeline yet |
| Lead Time | ❌ N/A | No regression automation |
| MTTR | ❌ N/A | No monitoring |
| Deployment Frequency | ❌ N/A | Manual runs only |

> DORA core metrics require: Allure TestOps integration, CI/CD pipeline, nightly runs.

[← OrangeHRM overview](index.md)
"""


def render_orange_index():
    return """---
title: OrangeHRM DORA Reports
layout: default
---

# OrangeHRM — Monthly Reports

## Current Status: Coverage Only

OrangeHRM does not yet have DORA core metrics.  
Only test coverage progress is tracked monthly.

### What's Missing

| Requirement | Status | Priority |
|-------------|--------|----------|
| Allure TestOps integration | ❌ Not started | High |
| CI/CD pipeline (nightly runs) | ❌ Not started | High |
| DORA metric collection | ❌ Not started | Medium |
| Regression automation | ❌ Not started | Medium |

### When Will DORA Be Available?

1. Push OrangeHRM to GitHub
2. Set up GitHub Actions (nightly Playwright run)
3. Integrate Allure TestOps (add ALLURE_TOKEN secret)
4. First DORA report expected ~2 weeks after CI setup

---

[← Back to DORA reports](../index.md)
"""


def main():
    dora = load_json(METRICS_DIR / "dora-core.json")
    health = load_json(METRICS_DIR / "buzzhive-test-health.json")
    gates = load_json(METRICS_DIR / "buzzhive-quality-gates.json")
    coverage = load_json(METRICS_DIR / "orangehrm-coverage.json")

    # Create output directories
    buzzhive_dir = OUTPUT_DIR / "buzzhive"
    orange_dir = OUTPUT_DIR / "orangehrm"
    buzzhive_dir.mkdir(parents=True, exist_ok=True)
    orange_dir.mkdir(parents=True, exist_ok=True)

    # Build data
    buzzhive_months = build_buzzhive_months(dora, health, gates)
    orange_months = build_orange_months(coverage)

    # Write index
    (OUTPUT_DIR / "index.md").write_text(render_index(buzzhive_months, orange_months))
    print(f"  ✓ docs/dora/index.md")

    # Write methodology
    (OUTPUT_DIR / "methodology.md").write_text(render_methodology())
    print(f"  ✓ docs/dora/methodology.md")

    # Write April (special case — no data)
    (buzzhive_dir / "2026-04.md").write_text(render_april())
    print(f"  ✓ docs/dora/buzzhive/2026-04.md")

    # Write Buzzhive monthly reports
    for m in sorted(buzzhive_months.keys()):
        path = buzzhive_dir / f"{m}.md"
        path.write_text(render_buzzhive_month(m, buzzhive_months[m]))
        print(f"  ✓ docs/dora/buzzhive/{m}.md")

    # Write Buzzhive index (redirect to main)
    (buzzhive_dir / "index.md").write_text("""---
title: Buzzhive DORA Reports
layout: default
---

# Buzzhive — Monthly DORA Reports

| Month | Report |
|-------|--------|
""")
    for m in sorted(buzzhive_months.keys()):
        label = datetime.strptime(m, "%Y-%m").strftime("%B %Y")
        with open(buzzhive_dir / "index.md", "a") as f:
            f.write(f"| {label} | [{m}.md]({m}.md) |\n")
    current = (buzzhive_dir / "index.md").read_text()
    (buzzhive_dir / "index.md").write_text(
        current + "\n[← Back to DORA reports](../index.md)\n"
    )
    print(f"  ✓ docs/dora/buzzhive/index.md")

    # Write OrangeHRM reports
    (orange_dir / "index.md").write_text(render_orange_index())
    print(f"  ✓ docs/dora/orangehrm/index.md")
    for m in sorted(orange_months.keys()):
        path = orange_dir / f"{m}.md"
        path.write_text(render_orange_month(m, orange_months[m]))
        print(f"  ✓ docs/dora/orangehrm/{m}.md")

    print(f"\nDone. Generated {len(buzzhive_months) + 1} Buzzhive + {len(orange_months)} OrangeHRM reports.")


if __name__ == "__main__":
    main()
