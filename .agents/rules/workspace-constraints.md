# Skill Constraints
Do not load, execute, or allocate token budget to the following scientific skills for this software development workspace:
- alphafold-database-fetch-and-analyze
- alphagenome-single-variant-analysis
- chembl-database

# Agent Execution Scopes
- When evaluating, reviewing, or writing Go automation test files, the agent MUST explicitly restrict its workspace boundary search exclusively to the `./go-backend/` directory.
- Do not attempt to execute recursive search tools or broad directory listing scripts across the global project root workspace path to prevent context window overflow bounds.

# Multi-Environment Testing Rule
- The workspace supports dual-target execution profiles: [Localhost, Render Staging].
- When writing new Go/C# Playwright locators, always consume base URLs via the `APP_TARGET_URL` environment flag. Never hardcode absolute landing domains inside assertions.

# Tool Exclusion
Do not load or allocate budget to the following unused Firebase and mobile skills for this workspace:
- firebase-data-connect
- firebase-remote-config-basics
- firebase-crashlytics
- xcode-project-setup

# Backend Workspace Rules
Target Stack: Go, C#, PostgreSQL, NATS, PKI.

Disable and truncate the following unrelated skills to save token budget:
- All firebase-* plugins
- All chrome-* and browser extension plugins
- android-cli
- xcode-project-setup
- modern-web-guidance

# Git Execution Constraints
- Always pre-execute `git config --global --add safe.directory ${workspaceRoot}` prior to initializing parallel Go test runners or spawning new task-isolated worktrees.
- If creating concurrent branches for testing execution loops, pass the global safe.directory configurations to avoid exit status 128 context breaks.

