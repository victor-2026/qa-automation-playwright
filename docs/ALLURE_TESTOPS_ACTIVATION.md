# Allure TestOps Activation Guide

**Status:** DRAFT — workflow files created, GitHub Secrets stub set, awaiting trial registration.

**Files created (2026-06-16):**
- `.github/workflows/allure-testops.yml` (qa-automation-sandbox) — draft, runs tests without Allure TestOps
- `.github/workflows/allure-testops.yml` (OrangeHRM) — draft, runs smoke tests without Allure TestOps

**GitHub Secrets set (qa-automation-sandbox):**
- `ALLURE_ENDPOINT` = `https://REPLACE_AFTER_TRIAL.testops.cloud` (placeholder)
- `ALLURE_PROJECT_ID` = `REPLACE_AFTER_TRIAL` (placeholder)
- `ALLURE_TOKEN` = `REPLACE_AFTER_TRIAL` (placeholder)

**OrangeHRM:** no GitHub remote (local-only project). When pushed to GitHub, secrets must be set there too.

---

## Activation steps (5 minutes)

### Step 1: Register trial
1. Open https://qameta.io/cloud-trial-request
2. Fill form: Name, Work Email, Company, Expected users, Domain (e.g., `qa-victor`)
3. Click **Start my free trial**
4. Check email for confirmation + trial URL (e.g., `https://qa-victor.testops.cloud`)

### Step 2: Create projects in Allure TestOps
1. Login to your trial instance
2. Click **+ Create project**
3. Project 1: `qa-automation-sandbox` (Type: Web/Mobile/API mix)
4. Project 2: `orangehrm` (Type: Web)
5. Note the **Project ID** from URL (e.g., `1`, `42`, etc.)

### Step 3: Generate API token
1. Click avatar (top right) → **API Tokens**
2. Click **+ Token**
3. Name: `github-actions-sandbox`
4. Copy the token (you'll only see it once)

### Step 4: Update GitHub Secrets
```bash
# qa-automation-sandbox
cd /Users/victor/Projects/qa-automation-sandbox
gh secret set ALLURE_ENDPOINT --body "https://qa-victor.testops.cloud"
gh secret set ALLURE_PROJECT_ID --body "42"  # actual project ID
gh secret set ALLURE_TOKEN --body "actual-token-from-allure"

# OrangeHRM (if/when pushed to GitHub)
cd /Users/victor/Projects/OrangeHRM
gh secret set ALLURE_ENDPOINT --body "https://qa-victor.testops.cloud"
gh secret set ALLURE_PROJECT_ID --body "43"  # actual project ID
gh secret set ALLURE_TOKEN --body "actual-token-from-allure"
```

### Step 5: Activate workflow
Edit `.github/workflows/allure-testops.yml` in each project:

**Uncomment these 3 blocks** (remove `# ` from start of each line):

1. `Install allurectl` (action step)
2. `Run tests with Allure TestOps upload` (changes `npx playwright test` to `allurectl watch -- npx playwright test`)
3. `Upload to Allure TestOps` (last step before artifact upload)

### Step 6: Test integration
```bash
# Push to trigger workflow
git add .github/workflows/allure-testops.yml
git commit -m "feat(ci): activate Allure TestOps integration"
git push
```

In GitHub UI: Actions → allure-testops → Run workflow

### Step 7: Verify
1. Check workflow logs for allurectl output
2. Login to Allure TestOps → Project → Launches
3. Should see new launch with results

---

## Troubleshooting

### "Connection refused" to testops.cloud
- Check `ALLURE_ENDPOINT` has `https://` prefix
- Check token is correct (regenerate if needed)

### "Project not found"
- Check `ALLURE_PROJECT_ID` is the numeric ID from project URL

### "Empty allure-results"
- Tests didn't produce JSON files
- Check `ALLURE_RESULTS` env var matches output dir
- For our setup, it's `allure-results` (Playwright's default)

### Bi-directional triggers (TestOps → GH)
Requires extra config in Allure TestOps (admin):
1. **Administration → Integrations → + Add integration → GitHub**
2. Endpoint: `https://api.github.com`
3. Personal access token (from GH) with `workflow` scope
4. **Add to project** with the token as secret
5. Add `workflow_dispatch` inputs to workflow file (see docs.qameta.io/allure-testops/integrations/github)

---

## Cost tracking reminder

- **Trial:** 14 days free
- **After trial:** $39/user/month
- **Set calendar reminder** 5 days before trial ends
- **Decision point:** continue (pay) or revert (remove from workflows)

---

## References

- [Allure TestOps docs](https://docs.qameta.io/allure-testops/)
- [GitHub integration guide](https://docs.qameta.io/allure-testops/integrations/github/)
- [allurectl docs](https://docs.qameta.io/allure-testops/ecosystem/allurectl/)
- Wiki: `wiki/allure-testops-research-2026.md`
