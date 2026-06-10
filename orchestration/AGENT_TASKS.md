# Agent Task Board

## Agents

| Agent | Model | Strengths | Weaknesses |
|-------|-------|-----------|------------|
| MiMo | mimo-v2.5-free | TypeScript, Playwright, code gen | 6GB VRAM limit |
| DeepSeek | deepseek-v4-flash-free | Reasoning, analysis, planning | No code execution |
| BigPickle | bigpickle-multimodal-v1-rc1 | Multimodal, vision, screenshots | Slower, less precise |

## Task Lock Protocol

1. **Read** this file to see available tasks
2. **Lock** a task by editing this file: change `status: available` → `status: locked` + add your agent name
3. **Work** on the task
4. **Complete** by changing `status: done` + adding result summary
5. **Never** work on a task with `status: locked` by another agent

## Active Tasks

### TASK-001: OrangeHRM Phase 3 — My Info POM + Spec
- **Status:** available
- **Assigned:** —
- **Project:** OrangeHRM
- **Files:** `pom/MyInfoPage.ts`, `e2e/myinfo.spec.ts`
- **Description:** Create MyInfoPage POM + 2-3 tests (load page, edit personal details, change avatar)
- **Dependencies:** None
- **Estimated time:** 20 min

### TASK-002: OrangeHRM Phase 3 — Time POM + Spec
- **Status:** available
- **Assigned:** —
- **Project:** OrangeHRM
- **Files:** `pom/TimePage.ts`, `e2e/time.spec.ts`
- **Description:** Create TimePage POM + 2 tests (load page, punch in/out if available)
- **Dependencies:** None
- **Estimated time:** 15 min

### TASK-003: OrangeHRM Phase 3 — Claim POM + Spec
- **Status:** available
- **Assigned:** —
- **Project:** OrangeHRM
- **Files:** `pom/ClaimPage.ts`, `e2e/claim.spec.ts`
- **Description:** Create ClaimPage POM + 1-2 tests (load page, submit claim if available)
- **Dependencies:** None
- **Estimated time:** 15 min

### TASK-004: OrangeHRM — Playwright Dual-Target Config
- **Status:** available
- **Assigned:** —
- **Project:** OrangeHRM
- **Files:** `playwright.config.ts`, `helpers/credentials.ts`
- **Description:** Update playwright.config.ts to support dual targets: smoke→demo, destructive→local. Update credentials.ts for LOCAL=true switch.
- **Dependencies:** None
- **Estimated time:** 10 min

### TASK-005: OrangeHRM — Destructive Tests on Local
- **Status:** available
- **Assigned:** —
- **Project:** OrangeHRM
- **Files:** `e2e/admin.spec.ts`, `e2e/pim.spec.ts`, `e2e/buzz.spec.ts`
- **Description:** Remove skip markers for admin-002 (add user), pim-002 (add employee), buzz-002 (create post). These only work on local Docker.
- **Dependencies:** TASK-004 (dual-target config)
- **Estimated time:** 15 min

### TASK-006: LinkedIn Posts Publication
- **Status:** available
- **Assigned:** —
- **Project:** Articles
- **Files:** `Articles/linkedin-posts/OrangeHRM/0-orangehrm-phase0.md`, `1-orangehrm-phase1-skeleton.md`
- **Description:** Final review + format for LinkedIn. Phase 0 hook: "12 modules. 51 tests. 20% coverage." Phase 1 hook: "5 POMs. 11 tests. 2 expected fails."
- **Dependencies:** None
- **Estimated time:** 10 min

### TASK-007: SOP Files (NotebookLM P1)
- **Status:** available
- **Assigned:** —
- **Project:** qa-automation-sandbox
- **Files:** `sop/mutation-testing.md`, `sop/contract-testing.md`, `sop/deploy-render.md`, `sop/new-module.md`
- **Description:** Create 4 SOP files from NotebookLM playbook recommendations. Template: Purpose → Steps → Quality Checks → Failure Points → Checklist.
- **Dependencies:** None
- **Estimated time:** 20 min

---

## Completed Tasks

(none yet)

---

## Lock History

| Time | Agent | Task | Action |
|------|-------|------|--------|
| — | — | — | — |

---

*Created: 2026-06-04*
*Protocol: Lock before work, complete after finish, never steal locked tasks*
