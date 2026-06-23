#!/usr/bin/env python3
"""Parse Allure results and push to Notion Test Runs DB."""

import json
import glob
import os
import sys
from datetime import datetime, timezone, timedelta
import ssl
try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except:
    SSL_CONTEXT = ssl.create_default_context()
    SSL_CONTEXT.check_hostname = False
    SSL_CONTEXT.verify_mode = ssl.CERT_NONE
from urllib.request import Request, urlopen
from urllib.error import HTTPError

NOTION_TOKEN = os.environ.get("NOTION_TOKEN") or open(os.path.expanduser("~/.notion-token")).read().strip()
DATABASE_ID = os.environ.get("NOTION_DATABASE_ID", "382a5ab6-666f-81b5-8f5d-e6f1d415677f")
NOTION_VERSION = "2022-06-28"

PROJECTS = {
    "qa-automation-sandbox": os.path.expanduser("~/Projects/qa-automation-sandbox/allure-results"),
    "OrangeHRM": os.path.expanduser("~/Projects/OrangeHRM/allure-results"),
}

SUITE_TO_MODULE = {
    "admin.spec.ts": "Admin",
    "auth.spec.ts": "Auth",
    "buzz.spec.ts": "Buzz",
    "claim.spec.ts": "Claim",
    "dashboard.spec.ts": "Dashboard",
    "directory.spec.ts": "Directory",
    "leave.spec.ts": "Leave",
    "maintenance.spec.ts": "Maintenance",
    "myinfo.spec.ts": "My Info",
    "performance.spec.ts": "Performance",
    "pim.spec.ts": "PIM",
    "recruitment.spec.ts": "Recruitment",
    "time.spec.ts": "Time",
    "seed.spec.ts": "Infrastructure",
    "visual/visual.spec.ts": "Visual",
    "smoke.spec.ts": "Smoke",
    "../contracts/schema-validation.spec.ts": "Contracts",
}

def notion_req(method, path, body=None):
    url = f"https://api.notion.com/v1{path}"
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode() if body else None
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, context=SSL_CONTEXT) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        print(f"  [ERROR] {method} {path}: {e.code} {e.reason}")
        print(f"  Body: {e.read().decode()[:500]}")
        return None

def get_existing_runs():
    """Fetch all existing Test Name + Date entries to avoid duplicates."""
    existing = set()
    cursor = None
    while True:
        body = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        resp = notion_req("POST", f"/databases/{DATABASE_ID}/query", body)
        if not resp:
            break
        for r in resp.get("results", []):
            props = r.get("properties", {})
            name = "".join(t.get("plain_text", "") for t in props.get("Test Name", {}).get("title", []))
            date_val = props.get("Date", {}).get("date", {})
            date_str = date_val.get("start", "") if date_val else ""
            if name and date_str:
                existing.add((name, date_str[:10]))
        if not resp.get("has_more"):
            break
        cursor = resp.get("next_cursor")
    print(f"  Existing entries: {len(existing)}")
    return existing

def get_suite(labels):
    for l in labels:
        if l.get("name") == "suite":
            return l.get("value", "")
    return ""

def extract_module(labels, suite):
    if suite:
        return SUITE_TO_MODULE.get(suite, suite.replace(".spec.ts", "").replace(".spec", "").title())
    for l in labels:
        if l.get("name") == "package":
            pkg = l.get("value", "")
            for spec, mod in SUITE_TO_MODULE.items():
                if spec in pkg:
                    return mod
    return "Unknown"

def extract_run_type(labels, suite, project):
    for l in labels:
        if l.get("name") == "tag":
            val = l.get("value", "")
            if val == "smoke":
                return "Smoke"
    if suite == "smoke.spec.ts":
        return "Smoke"
    if "contract" in suite.lower() or "schema" in suite.lower():
        return "Contract"
    if "visual" in suite.lower():
        return "E2E"
    return "E2E"

def extract_environment(labels):
    for l in labels:
        if l.get("name") == "host":
            host = l.get("value", "")
            if "Render" in host or "render" in host:
                return "Render"
    return "Local Docker"

def parse_allure_files(project, path):
    files = glob.glob(os.path.join(path, "*.json"))
    if not files:
        return []
    results = []
    for f in files:
        with open(f) as fh:
            try:
                d = json.load(fh)
            except json.JSONDecodeError:
                continue
        labels = d.get("labels", [])
        suite = get_suite(labels)
        start_ms = d.get("start", 0)
        stop_ms = d.get("stop", start_ms)
        start_dt = datetime.fromtimestamp(start_ms / 1000, tz=timezone.utc)
        duration_s = round((stop_ms - start_ms) / 1000, 1) if stop_ms > start_ms else 0
        status_raw = d.get("status", "unknown")
        status_map = {"passed": "Passed", "failed": "Failed", "skipped": "Skipped", "broken": "Blocked", "unknown": "Skipped"}
        status = status_map.get(status_raw, "Skipped")
        msg = d.get("statusDetails", {}).get("message", "") if status_raw in ("failed", "skipped", "broken") else ""
        results.append({
            "name": d.get("name", "Unknown test"),
            "status": status,
            "notes": msg[:1000] if msg else "",
            "module": extract_module(labels, suite) or project,
            "run_type": extract_run_type(labels, suite, project),
            "environment": extract_environment(labels),
            "date": start_dt.strftime("%Y-%m-%d"),
            "duration": duration_s,
        })
    return results

def create_notion_entry(entry):
    props = {
        "Test Name": {"title": [{"text": {"content": entry["name"][:200]}}]},
        "Status": {"select": {"name": entry["status"]}},
        "Date": {"date": {"start": entry["date"]}},
        "Duration": {"number": entry["duration"]},
    }
    if entry["module"]:
        props["Module"] = {"select": {"name": entry["module"]}}
    if entry["run_type"]:
        props["Run Type"] = {"select": {"name": entry["run_type"]}}
    if entry["environment"]:
        props["Environment"] = {"select": {"name": entry["environment"]}}
    if entry.get("notes"):
        props["Notes"] = {"rich_text": [{"text": {"content": entry["notes"][:2000]}}]}
    return notion_req("POST", "/pages", {"parent": {"database_id": DATABASE_ID}, "properties": props})

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Import Allure results to Notion Test Runs DB")
    parser.add_argument("--dir", help="Path to allure-results directory")
    parser.add_argument("--project", default="qa-automation-sandbox", help="Project name")
    parser.add_argument("--env", default="CI/CD", help="Environment name")
    args = parser.parse_args()

    if args.dir:
        print(f"=== Allure → Notion ({args.project}, {args.env}) ===")
        existing = get_existing_runs()
        entries = parse_allure_files(args.project, args.dir)
        print(f"  Parsed {len(entries)} results")
        new_count = 0
        for e in entries:
            e["environment"] = args.env
            key = (e["name"], e["date"])
            if key in existing:
                continue
            print(f"  + {e['name']} ({e['status']})")
            create_notion_entry(e)
            new_count += 1
            existing.add(key)
        print(f"  New: {new_count}")
    else:
        print("=== Allure → Notion Test Runs ===")
        existing = get_existing_runs()
        total_new = 0
        for project, path in PROJECTS.items():
            if not os.path.isdir(path):
                print(f"\n[{project}] No allure-results at {path}")
                continue
            entries = parse_allure_files(project, path)
            print(f"\n[{project}] Parsed {len(entries)} results")
            new_count = 0
            for e in entries:
                key = (e["name"], e["date"])
                if key in existing:
                    continue
                print(f"  + {e['name']} ({e['status']}, {e['module']})")
                create_notion_entry(e)
                new_count += 1
                existing.add(key)
            total_new += new_count
            print(f"  New: {new_count}")
        print(f"\nTotal new entries: {total_new}")

if __name__ == "__main__":
    main()
