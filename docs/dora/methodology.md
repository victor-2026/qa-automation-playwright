---
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
