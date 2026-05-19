#!/usr/bin/env python3
"""
MAS Quality Check — Полный цикл с улучшенным промптом

Usage:
  python scripts/mas-quality-check.py e2e/api/metamorphic.spec.ts
  python scripts/mas-quality-check.py e2e/api/metamorphic.spec.ts --fix
  python scripts/mas-quality-check.py e2e/api/*.spec.ts --fix --test

Features:
  - Детальный breakdown: stability/assertions/coverage/edge_cases
  - Threshold: 85
  - Output: mas-reports/{filename}/
  - Fixer: авто-применяет
  - Тесты верификация (--test)
"""

import sys
import json
import os
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

THRESHOLD = 85
MAX_FIXES = 1

ANALYZE_PROMPT = """Ты — Senior QA Lead. Проведи аудит качества Playwright тестов.

## Scoring Breakdown (100 points max)

### 1. Stability (0-25)
- [ ] retry: есть минимум 3 попытки для flaky операций?
- [ ] timeout: указан для всех HTTP запросов (минимум 5000ms)?
- [ ] safe_json: try/catch вокруг всех .json() вызовов?
- [ ] cleanup: afterAll/afterEach для созданных данных?

### 2. Assertions Quality (0-25)
- [ ] НЕТ permissive массивов типа [200,201,400,403,404,409,422]
- [ ] Конкретные ожидаемые статусы (200, 401, 403, 404)
- [ ] Проверка не только status, но и body content

### 3. Coverage (0-25)
- [ ] Auth endpoints: login, logout, refresh, me
- [ ] CRUD endpoints: posts, users
- [ ] Business logic: follow, notifications, admin

### 4. Edge Cases (0-25)
- [ ] 500 error handling (сервер может вернуть)
- [ ] 401 without token
- [ ] Rate limiting response
- [ ] Empty response handling

## Output (только JSON)

{{
  "score": 0-100,
  "breakdown": {{
    "stability": 0-25,
    "assertions": 0-25,
    "coverage": 0-25,
    "edge_cases": 0-25
  }},
  "issues": [
    {{"severity": "critical/medium/low", "category": "stability/assertions/coverage/edge", "description": "...", "line": N}}
  ],
  "recommendations": ["..."],
  "summary": "короткое резюме"
}}

## Файл для анализа (первые 7000 символов):
```
{{content}}
```"""

def get_groq_key() -> str:
    key = os.environ.get("GROQ_API_KEY")
    if key:
        return key
    raise ValueError("GROQ_API_KEY environment variable not set")

def get_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def get_report_dir(filepath: str) -> Path:
    base_name = os.path.basename(filepath).replace(".spec.ts", "")
    report_dir = Path(f"mas-reports/{get_timestamp()}/{base_name}")
    report_dir.mkdir(parents=True, exist_ok=True)
    return report_dir

def save_json(report_dir: Path, name: str, data: dict):
    with open(report_dir / name, "w") as f:
        json.dump(data, f, indent=2)

def analyze_full(filepath: str, content: str) -> dict:
    """Полный анализ с breakdown"""

    prompt = ANALYZE_PROMPT.format(content=content[:7000])

    headers = {"Authorization": f"Bearer {get_groq_key()}", "Content-Type": "application/json"}
    data = {"model": GROQ_MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.3, "max_tokens": 2500}

    for attempt in range(3):
        try:
            resp = requests.post(GROQ_API_URL, headers=headers, json=data, timeout=90)
            if resp.status_code == 429:
                wait = 2 ** attempt
                print(f"   ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            result = resp.json()
            content_resp = result["choices"][0]["message"]["content"]

            start = content_resp.find("{")
            end = content_resp.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(content_resp[start:end])
            else:
                return {"error": "No JSON", "raw": content_resp[:200]}
        except Exception as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
                continue
            return {"error": str(e)}
    return {"error": "All retries failed"}

def generate_fix(filepath: str, content: str, issue_desc: str) -> Optional[str]:
    """Groq генерирует исправление"""

    prompt = f"""Ты — Fixer. Исправь проблему в тестовом файле.

Проблема: {issue_desc}

Текущий файл (первые 5000 символов):
```
{content[:5000]}
```

Верни ТОЛЬКО исправленный код файла целиком (без markdown, без пояснений).
Сохрани всю логику, исправь только указанную проблему."""

    headers = {"Authorization": f"Bearer {get_groq_key()}", "Content-Type": "application/json"}
    data = {"model": GROQ_MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 4000}

    for attempt in range(3):
        try:
            resp = requests.post(GROQ_API_URL, headers=headers, json=data, timeout=90)
            if resp.status_code == 429:
                time.sleep(2 ** attempt)
                continue
            resp.raise_for_status()
            result = resp.json()
            code = result["choices"][0]["message"]["content"]
            # Clean markdown
            code = code.replace("```javascript", "").replace("```typescript", "").replace("```", "")
            return code.strip()
        except Exception as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
                continue
            print(f"   ❌ Fix failed: {e}")
            return None
    return None

def apply_fix(filepath: str, fixed_code: str) -> bool:
    try:
        with open(filepath, "w") as f:
            f.write(fixed_code)
        return True
    except Exception as e:
        print(f"   ❌ Write failed: {e}")
        return False

def run_tests(filepath: str) -> dict:
    """Запускает smoke тесты для файла"""
    cmd = ["npx", "playwright", "test", filepath, "--project=chromium", "--timeout=60000"]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180, cwd=os.path.dirname(os.path.dirname(filepath)))
        return {"passed": result.returncode == 0, "exit_code": result.returncode}
    except subprocess.TimeoutExpired:
        return {"passed": False, "error": "timeout"}
    except Exception as e:
        return {"passed": False, "error": str(e)}

def classify_issues(issues: list) -> dict:
    result = {"critical": [], "medium": [], "low": []}
    for issue in issues:
        sev = issue.get("severity", "medium").lower()
        if sev in ["high", "critical"]:
            result["critical"].append(issue)
        elif sev == "low":
            result["low"].append(issue)
        else:
            result["medium"].append(issue)
    return result

def run_cycle(filepath: str, enable_fix: bool = True, enable_test: bool = False) -> dict:
    """Основной цикл: анализ → исправления → верификация"""

    if not os.path.exists(filepath):
        return {"error": "File not found", "filename": filepath}

    report_dir = get_report_dir(filepath)

    print(f"\n🔄 MAS Quality: {filepath}")

    with open(filepath, "r") as f:
        content = f.read()

    # Step 1: Full analysis
    print("   📊 Analyzing...")
    result = analyze_full(filepath, content)
    result["timestamp"] = get_timestamp()

    score = result.get("score", 0)
    breakdown = result.get("breakdown", {})
    print(f"   Score: {score}/100 (threshold: {THRESHOLD})")
    if breakdown:
        print(f"   Breakdown: stability={breakdown.get('stability',0)}, assertions={breakdown.get('assertions',0)}, coverage={breakdown.get('coverage',0)}, edge={breakdown.get('edge_cases',0)}")

    if "issues" in result:
        classified = classify_issues(result["issues"])
        result["issues_classified"] = classified
        print(f"   Issues: critical={len(classified['critical'])}, medium={len(classified['medium'])}, low={len(classified['low'])}")

        # Step 2: Apply fixes
        if enable_fix and (classified["critical"] or classified["medium"]):
            fixes_applied = 0
            for issue in (classified["critical"] + classified["medium"]):
                if fixes_applied >= MAX_FIXES:
                    break
                desc = issue.get("description", "")[:60]
                print(f"   🔧 Fixing: {desc}...")
                fixed = generate_fix(filepath, content, issue.get("description", ""))
                if fixed and apply_fix(filepath, fixed):
                    fixes_applied += 1
                    result["fixes_applied"] = result.get("fixes_applied", 0) + 1
                    print(f"   ✅ Applied: {desc}")
                    with open(filepath, "r") as f:
                        content = f.read()

    # Step 3: Final analysis after fixes
    if result.get("fixes_applied", 0) > 0:
        print("   📊 Re-analyzing after fixes...")
        result2 = analyze_full(filepath, content)
        result["score_after_fix"] = result2.get("score", score)
        result["breakdown_after_fix"] = result2.get("breakdown", {})
        score = result2.get("score", score)

    # Step 4: Test verification
    if enable_test and result.get("fixes_applied", 0) > 0:
        print("   🔬 Running tests...")
        test_result = run_tests(filepath)
        result["test_result"] = test_result
        print(f"   Tests: {'✅ PASS' if test_result.get('passed') else '❌ FAIL'}")

    # Save results
    status = "PASS" if score >= THRESHOLD else "FAIL"

    # Convert issues to gotchas format
    gotchas = []
    for issue in result.get("issues", []):
        gotchas.append({
            "issue": issue.get("description", ""),
            "severity": issue.get("severity", "low"),
            "line": issue.get("line", 0),
            "category": issue.get("category", "unknown"),
            "date": get_timestamp()
        })

    final = {
        "filename": filepath,
        "score": score,
        "threshold": THRESHOLD,
        "status": status,
        "breakdown": breakdown,
        "fixes_applied": result.get("fixes_applied", 0),
        "test_result": result.get("test_result"),
        "report_dir": str(report_dir),
        "gotchas": gotchas
    }

    save_json(report_dir, "analysis.json", result)
    save_json(report_dir, "final.json", final)

    print(f"\n📊 Final: {score}/100 → {status}")
    print(f"📁 {report_dir}/final.json")

    return final

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/mas-quality-check.py <file> [--fix] [--test]")
        sys.exit(1)

    files = [f for f in sys.argv[1:] if not f.startswith("--")]
    enable_fix = "--fix" in sys.argv
    enable_test = "--test" in sys.argv

    print(f"MAS Quality Check (v2 - Enhanced Prompt)")
    print(f"  Threshold: {THRESHOLD}, Max fixes: {MAX_FIXES}")
    print(f"  Fix: {enable_fix}, Test: {enable_test}")

    results = []
    for filepath in files:
        result = run_cycle(filepath, enable_fix, enable_test)
        results.append(result)

    print(f"\n{'='*50}")
    passed = sum(1 for r in results if r.get("status") == "PASS")
    print(f"Summary: {passed}/{len(results)} passed")
    return 0 if all(r.get("status") == "PASS" for r in results) else 1

if __name__ == "__main__":
    sys.exit(main())