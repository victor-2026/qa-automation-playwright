# AGENTS.md — qa-automation-sandbox

## Purpose
This file defines the working rules for AI agents and contributors in this repository.

## Core Rules
- Read `session-checkpoint.md` at the start of each session.
- Update `session-checkpoint.md` at the end of each session.
- Use commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`.
- Never commit PAT/API tokens or secrets; use `gh auth`.
- Keep test code and documentation aligned when flows change.
- Do not hardcode credentials; use env vars and test-only accounts.

## Project Context
- Repository: `victor-2026/qa-automation-playwright`
- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- API base: `http://localhost:8000/api`
- Render: `https://buzzhive-test.onrender.com`

## Test Stack
- Playwright (E2E + API)
- Jest + `pg` (DB tests)
- Jest + `fast-check` (property-based tests)
- Cucumber (Gherkin)

## Runbook
```bash
# Local full run with Docker
docker-compose up --build -d
npm test

# Render smoke
npm run test:render
```

## CI Notes
- Quality gates: `lint` + `typecheck` + `audit`.
- For Render, run API-smoke coverage rather than the full Docker suite.
- For unstable backend behavior, limited retries are allowed where justified.

## Testing Priorities
- Keep smoke tests fast and stable.
- Validate auth, profile/me, posts (read/write), and unauthorized scenarios.
- Maintain cleanup in teardown for created entities.
- Add explicit assertions for response schema and status codes.

## Session Checklist
1. Read `session-checkpoint.md`.
2. Verify environment (`docker`, URLs, required env vars).
3. Run targeted tests first, then broader suites.
4. Update docs/checkpoint with what changed and why.
5. Commit with the correct prefix and clear scope.

## session-checkpoint.md Template
Minimum sections to keep updated:

```md
# Session Checkpoint - qa-automation-sandbox

**Date:** YYYY-MM-DD
**Status:** IN PROGRESS | COMPLETE | BLOCKED

## Work Completed
- ...

## Modified Files
- `path/to/file` - short reason

## Verification Results
- Command: `...`
- Result: PASS | FAIL
- Key details: ...

## Blockers
- ...

## Next Steps
1. ...
2. ...
```

## Self-Review Rule
- After generating code/tests, ask: "Am I 100% confident?"
- If not — find all possible holes, propose fixes, repeat until confident
- This applies to: code generation, test creation, documentation, reviews

## End-of-Session Report Template (chat/PR)
Use this short repeatable format:

```md
## Outcomes
- Completed: ...
- Verified: ...
- Risks/limitations: ...
- Next step: ...
```
