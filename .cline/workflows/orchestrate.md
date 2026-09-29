---
name: orchestrate
description: End-to-end orchestrated BDD automation workflow. Delegate the full pipeline (planner, branch, test generator, validation/healing, commit, push, optional PR) to the Orchestrator Agent, which enforces approval gates between every stage and tracks state in .cline/state/orchestrator.json.
mode: act
agents:
  - orchestrator-agent
---

# Orchestrate Workflow

Follow this workflow when the user wants an end-to-end automation task run through
the entire pipeline: planning, branching, test generation, validation/healing,
commit, push, and optional pull request.

## How it works

The **Orchestrator Agent** (`.cline/agents/orchestrator/orchestrator-agent.md`) runs
the pipeline. It NEVER performs specialized work itself — it delegates every stage to
the existing agents:

1. Planner → `.cline/agents/planner/planner-agent.md`
2. Branch → `.cline/agents/git/branch-agent.md`
3. Test Generator → `.cline/agents/test-generator/test-generator-agent.md`
4. Healer → `.cline/agents/healer/healer-agent.md`
5. Commit → `.cline/agents/git/commit-agent.md`
6. Push → `.cline/agents/git/push-agent.md`
7. PR (optional) → `.cline/agents/git/pr-agent.md`
8. Jira (opt-in only) → `.cline/agents/jira-import/jira-import-agent.md` and `.cline/agents/jira-status/jira-status-agent.md`

## Pipeline

```text
User Request
    ↓
Planner Agent
    ↓
STOP — Ask User Approval
    ↓
Branch Agent
    ↓
STOP — Ask User Approval
    ↓
Test Generator Agent
    ↓
Validate / Run Generated Tests
    ↓
PASS ──────────────────────────────┐
                                   │
FAIL                               │
 ↓                                 │
Healer Agent (max 3 attempts)      │
 ↓                                 │
Re-run Test                        │
 ↓                                 │
PASS ──────────────────────────────┘
 ↓
STOP — Ask User Approval
 ↓
Commit Agent
 ↓
STOP — Ask User Approval
 ↓
Push Agent
 ↓
STOP — Ask User Approval
 ↓
PR Agent — OPTIONAL
 ↓
DONE
```

Branch creation MUST happen before the Test Generator modifies the framework, so
generated code is never created directly on `main`.

## Mandatory approval gates

The Orchestrator stops between every major stage and asks the user:

| Between                 | Ask                                                                            |
| ----------------------- | ------------------------------------------------------------------------------ |
| Planner → Branch        | "Planning is complete. Would you like to continue with Branch creation?"       |
| Branch → Test Generator | "Branch creation is complete. Would you like to continue with Test Generator?" |
| Validation → Commit     | "Tests are passing. Would you like to continue with the Commit Agent?"         |
| Commit → Push           | "Commit completed successfully. Would you like to continue with Push Agent?"   |
| Push → PR               | "Push completed successfully. Would you like to create a Pull Request?"        |

Never run the whole pipeline automatically; ambiguous responses are re-asked.

## Validation command gate

Validation is PASS only when the affected tests pass AND the quality gates pass.
Exact commands:

```bash
npm run test:dry-run            # all steps resolve (no unresolved/ambiguous steps)
npx cucumber-js --tags "<tag>"  # run the generated / affected tests
npm run verify                  # lint + format:check + typecheck
npm run report:cucumber         # summarize pass/fail counts
npm run verify:secrets          # secret scan — required before Commit
```

Rules:

- A dry-run failure routes back to the Test Generator, not the Healer.
- `npm run verify` must pass before `TESTS_READY` and again before Commit.
- A failing test routes to the Healer only when classified as an automation issue;
  application defects are reported to the user, not healed.
- Never approve the Commit Agent while `npm run verify:secrets` fails.

## State & resume

- The Orchestrator persists state to `.cline/state/orchestrator.json`
  (git-ignored runtime data, never committed).
- If the pipeline is interrupted at an approval gate, re-invoke the Orchestrator
  Agent — it reads the state file and resumes at the next gate instead of restarting.
- On `COMPLETED` or `BLOCKED`, the terminal state stays in the file for audit.

## Report

The Orchestrator closes with a WORKFLOW SUMMARY (planner/branch/test
generator/validation/healer/commit/push/PR status, pass/fail counts, files
created/modified, known issues, final state).
