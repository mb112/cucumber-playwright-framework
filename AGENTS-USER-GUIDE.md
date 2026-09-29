# Agent User Guide

A practical, example-driven guide to using the **Cline AI-agent toolchain** in this
Playwright + TypeScript + Cucumber BDD framework.

This guide shows you **what each agent does, how to invoke it, and real example
prompts** you can paste into the chat. All examples use the
**[Zinc Bank](https://zincbank.cydeo.io)** simulated banking app (a CYDEO QA teaching
project), so you can follow along against a real, deterministic target.

> This is a *usage* guide. It tells you **how to drive the agents** — it does not
> describe how to build the framework. For framework internals see
> [`README.md`](./README.md).

---

## Table of Contents

- [1. What Are the Agents?](#1-what-are-the-agents)
- [2. Quick Reference](#2-quick-reference)
- [3. Prerequisites](#3-prerequisites)
- [4. How to Invoke an Agent](#4-how-to-invoke-an-agent)
- [5. The Planner Agent](#5-the-planner-agent)
- [6. The Test Generator Agent](#6-the-test-generator-agent)
- [7. The Healer Agent](#7-the-healer-agent)
- [8. The Git Agents](#8-the-git-agents)
- [9. The Jira Import Agent](#9-the-jira-import-agent)
- [10. The Jira Status Update Agent](#10-the-jira-status-update-agent)
- [11. The Orchestrator Agent](#11-the-orchestrator-agent)
- [12. End-to-End Workflow Examples](#12-end-to-end-workflow-examples)
- [13. Skills](#13-skills)
- [14. Rules, Boundaries & Approval](#14-rules-boundaries--approval)
- [15. Command Cheat Sheet](#15-command-cheat-sheet)
- [16. Troubleshooting](#16-troubleshooting)

---

## 1. What Are the Agents?

Agents are specialized AI roles. Each one has a narrow job, a defined toolset, and
hard rules it must follow. Together they form a safe, repeatable pipeline for the
**test lifecycle**:

```text
Requirement
    ↓
Planner Agent          →  structured BDD test plan (no code)
    ↓
Test Generator Agent   →  feature file + step definitions + Page Objects
    ↓
Automation run         →  pass / fail
    ├── pass ──────────────→  reports → Jira Status Agent
    └── fail ──────────────→  Healer Agent (max 3 attempts)
                                  ↓ (still failing)
                            Ask the user for help
```

The **Git agents** (branch → commit → push → PR) wrap the code you produce safely.
The **Jira agents** mirror your BDD coverage and results into Jira.

The **Orchestrator Agent** coordinates this whole pipeline: it picks the right
specialist for each stage, hands context forward, enforces an approval gate between
stages, and tracks progress in a state file. It **never** does the specialist work
itself — it only delegates (see [Section 11](#11-the-orchestrator-agent)).

### Where they live

| Path | Contents |
| --- | --- |
| `.cline/agents/` | The agent definitions (planner, test-generator, healer, orchestrator, git/*, jira-import, jira-status) |
| `.cline/skills/` | Reusable skills the agents call (playwright, cucumber, git, jira, …) |
| `.cline/workflows/` | Multi-step recipes (`create-test`, `heal-test`, `orchestrate`, `jira-import`, `jira-status-update`) |
| `.clinerules/` | The rules every agent obeys (architecture, security, approval, …) |

---

## 2. Quick Reference

| Agent | Agent file | What it does | Produces |
| --- | --- | --- | --- |
| **Planner** | `.cline/agents/planner/planner-agent.md` | Inspects the live UI and turns a requirement into a BDD spec | A spec saved under `specs/` (**no code**, written only after user approval) |
| **Test Generator** | `.cline/agents/test-generator/test-generator-agent.md` | Turns the plan into working code, reusing existing framework pieces | `.feature`, `*.steps.ts`, Page Objects |
| **Healer** | `.cline/agents/healer/healer-agent.md` | Diagnoses and repairs a failing scenario | Fixed code (max **3 attempts**) |
| **Branch** | `.cline/agents/git/branch-agent.md` | Creates a correctly named branch | A new git branch |
| **Commit** | `.cline/agents/git/commit-agent.md` | Reviews the diff, blocks secrets, writes a Conventional Commit | A commit |
| **Push** | `.cline/agents/git/push-agent.md` | Pushes the branch (with approval) | A remote push |
| **PR** | `.cline/agents/git/pr-agent.md` | Drafts a PR with real test results and report links | A PR (with approval) |
| **Jira Import** | `.cline/agents/jira-import/jira-import-agent.md` | Imports BDD scenarios into Jira, after de-duplication | Jira test issues |
| **Jira Status** | `.cline/agents/jira-status/jira-status-agent.md` | Syncs Jira statuses from the latest report | Updated Jira issues |
| **Orchestrator** | `.cline/agents/orchestrator/orchestrator-agent.md` | Coordinates the full pipeline (planner → branch → generate → validate/heal → commit → push → PR) by delegating to the specialists | An end-to-end workflow driven through the specialists, with approval gates & a state file |

---

## 3. Prerequisites

Before you ask an agent to do anything, make sure the project is ready:

```bash
# 1. Install dependencies
npm install

# 2. Install the Playwright browsers you need
npm run install:browsers          # or: npx playwright install chromium

# 3. Create your local environment file (git-ignored)
cp .env.example .env
#    then fill in credentials / BASE_URL for the app under test

# 4. Confirm the config is healthy
npm run verify                    # lint + format:check + typecheck
```

For **Zinc Bank**, set the app URL and any demo credentials in `.env`:

```dotenv
ENV=qa
BASE_URL=https://zincbank.cydeo.io
# USERNAME=<your zinc bank user>
# PASSWORD=<your zinc bank password>
```

> **Security:** never type real passwords/tokens into chat. Credentials live only in
> `.env` / CI secret stores. If you paste an example, use placeholders.

---

## 4. How to Invoke an Agent

You don't "run" an agent like a script — you **describe the job** in a chat prompt and
the agent takes it from there. The framework routes your request to the right agent
automatically, based on what you ask for.

The three ways to work with them:

1. **Single agent** — ask directly: *"Use the Planner agent to plan login tests for Zinc Bank."*
2. **A workflow** — invoke a named recipe: *"Run the create-test workflow for Zinc Bank login."*
3. **Plain instruction** — the framework infers which agent fits: *"Zinc Bank login test is failing, fix it."*

There is no special command needed to "activate" an agent. Just describe the task and
let the agent follow its definition, skills, and rules.

---

## 5. The Planner Agent

**Job:** Convert a requirement into a structured BDD spec. It **inspects the real
application first** (via the browser) and **never writes code**. The finished spec is
saved under `specs/<area>/<name>.spec.md` — but only after your explicit approval.

**Rule to remember:** the Planner must look at the live UI before proposing scenarios,
and must hand off to the Test Generator for any implementation.

### Example prompt — plan a Zinc Bank login feature

```
Use the Planner agent.

I need BDD test coverage for the Zinc Bank login flow.
The app is at https://zincbank.cydeo.io/login.

Please inspect the live login page and produce a test plan covering:
- successful sign-in with valid credentials
- sign-in with an invalid password
- empty required fields
- the "New to ZincBank? Open an account" path

Reuse any existing steps/page objects where possible, and tag scenarios
appropriately (@smoke, @sanity, @critical, @regression).
Do NOT write any code — just the plan.
```

### What you can expect back (a plan, not code)

```text
Test Plan
---------
Feature: Zinc Bank Login

Scenario 1: Successful sign-in with valid credentials
Preconditions: registered user, on /login
Steps:
  Given I open the Zinc Bank login page
  When I sign in with email "user@example.com" and password "secret"
  Then I am signed in to the account dashboard
Priority: Critical
Tag: @smoke

Scenario 2: Sign-in with an invalid password shows an error
Preconditions: on /login
Steps:
  Given I open the Zinc Bank login page
  When I sign in with email "user@example.com" and password "wrong"
  Then a sign-in error is displayed
Priority: High
Tag: @critical

Scenario 3: Required fields are validated
...
```

The plan reflects what the agent actually observed on the page — for Zinc Bank that
means the **Email** and **Password** fields and the **Sign in** button it found on
`/login`.

> Because the planner inspects the live UI, the labels in its plan (e.g. "Email",
> "Password", "Sign in") are grounded in the real page, not guessed.


---

## 6. The Test Generator Agent

**Job:** Turn the Planner's test plan into **working code** — a feature file, thin step
definitions, and Page Objects — reusing existing framework code, then **run the test**
and `npm run verify`.

**Rules to remember:** search before creating duplicate Page Objects/steps; keep step
definitions thin; follow the locator order; never use XPath when a Playwright locator
exists; never use arbitrary `waitForTimeout`; never hardcode credentials/URLs.

### Example prompt

```
Use the Test Generator agent.

Implement the Zinc Bank login test plan:
1. Create features/login/login.feature describing business behavior
   (not DOM details), tagged @smoke / @critical.
2. Add thin step definitions in src/steps/.
3. Add/reuse a ZincBankLoginPage Page Object that exposes waitForReady().

Follow the locator rules (role > label > placeholder > text > data-test > CSS > XPath).
Run the generated scenarios and then npm run verify.
```

### What the agent would produce

A feature file (modeled on the existing `features/login.feature`):

```gherkin
@smoke
Feature: Zinc Bank Login
  As a Zinc Bank customer
  I want to sign in with my email and password
  So that I can access my accounts

  Background:
    Given I open the Zinc Bank login page

  @critical
  Scenario: Successful sign-in with valid credentials
    When I sign in with email "user@example.com" and password "secret"
    Then I am signed in to the account dashboard

  @sanity
  Scenario: Sign-in with an invalid password shows an error
    When I sign in with email "user@example.com" and password "wrong"
    Then a sign-in error is displayed
```

A Page Object that follows the existing `LoginPage` pattern — using the real Zinc Bank
locators the planner confirmed:

```ts
import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ZincBankLoginPage extends BasePage {
  public readonly emailInput: Locator = this.page.getByLabel('Email');
  public readonly passwordInput: Locator = this.page.getByLabel('Password');
  public readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign in' });
  public readonly openAccountLink: Locator = this.page.getByRole('link', { name: 'Open an account' });

  public async open(): Promise<void> {
    await this.goto('/login');
    await this.waitForReady();
  }

  public async signIn(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

And thin steps that delegate to the Page Object (mirroring `src/steps/login.steps.ts`).

> The Test Generator **runs** what it generates before finishing — it will not tell you
> it works unless it actually observed a pass.

---

## 7. The Healer Agent

**Job:** Diagnose and fix a failing Cucumber scenario using evidence (screenshots,
traces, errors). It is strictly limited to **3 healing attempts**, then it stops and
asks you for help.

**Rules to remember:** never disable assertions, delete/skip tests, add arbitrary
waits, hide failures, or change requirements.

### Example prompt

```
Use the Healer agent.

The Zinc Bank "Successful sign-in" scenario is failing.
Reproduce it, read the failure artifacts in reports/artifacts/, identify the
root cause, and apply a targeted fix. Re-run to confirm. Max 3 attempts.
```

### What the healer does (its diagnosis loop)

```text
Failure → Analyze (artifacts + feature + steps + Page Object)
        → Attempt #1 → run test → still failing?
        → Attempt #2 → run test → still failing?
        → Attempt #3 → run test → still failing? → ASK USER FOR HELP
```

Common root causes it looks for:

- **Locator drift** — the UI text/attribute changed (e.g. the Zinc Bank button label
  changed from "Sign in" to "Login").
- **Timing/race** — fixed with auto-waiting/assertions, **never** `waitForTimeout`.
- **Environment/data mismatch** — wrong `ENV`, missing credentials, bad test data.
- **Assertion mismatch** — the expected value doesn't match the real UI copy.

### After healing

The healer validates with the affected test and then the full gate:

```bash
npx cucumber-js --tags "@critical"   # re-run the fixed scenario
npm run verify                        # lint + format + typecheck
```

If it still fails after 3 attempts, the healer **stops** — it will not keep changing
code. That is your signal to jump in (the change may be an environment issue, a real
product bug, or a requirement change).


---

## 8. The Git Agents

Four small agents wrap the code you produce safely: **branch → commit → push → PR**.

**Rule to remember:** never commit `.env`/secrets, never commit blindly, and never push
or open a PR without your explicit approval.

### 8.1 Branch Agent

**Example prompt:**

```
Use the Branch agent. Create a branch for the Zinc Bank login tests.
```

It follows the naming convention:

| Type | Prefix | Example |
| --- | --- | --- |
| Feature | `feature/` | `feature/zincbank-login-tests` |
| Bug fix | `bugfix/` | `bugfix/zincbank-signin-selector` |
| Test | `test/` | `test/add-zincbank-transfer-scenarios` |
| Chore | `chore/` | `chore/update-playwright` |

It ensures you're not working directly on `main` and that the branch doesn't already
exist.

### 8.2 Commit Agent

**Example prompt:**

```
Use the Commit agent. Commit the Zinc Bank login feature file and Page Object.
```

It inspects `git status` + `git diff`, blocks anything unsafe (secrets, `.env`,
`node_modules/`, `reports/`, `screenshots/`, etc.), stages only the intended files, and
writes a Conventional Commit:

```text
test: add Zinc Bank login scenarios
```

Allowed prefixes (in order of likelihood): `feat:`, `test:`, `fix:`, `refactor:`,
`chore:`, `docs:`.

### 8.3 Push Agent

**Example prompt:**

```
Use the Push agent. Push the current branch to origin.
```

It verifies there are committed changes and a configured remote, then pushes
`git push -u origin <branch>`. It **requires your approval** before pushing and never
force-pushes unless you explicitly ask.

### 8.4 PR Agent

**Example prompt:**

```
Use the PR agent. Open a PR for the Zinc Bank login tests into main.
```

It gathers the change summary and real test results, and drafts a PR body with:

- a **summary** of what changed and why;
- **test results** (exact scenario/step pass/fail counts from `npm run report:cucumber`);
- **report links** (Cucumber HTML/JSON and Allure);
- a **checklist** (`npm run verify`, `npm run verify:secrets`, CI status).

It **will not open** the PR without your approval, and never claims tests pass unless it
actually ran them.

---

## 9. The Jira Import Agent

**Job:** Convert BDD feature files/scenarios into Jira test issues, **after checking
for duplicates**. It never creates duplicate issues blindly.

**Rule to remember:** always preview with `jira:import:dry-run` before any real
creation; never fabricate Jira keys.

### Prerequisites

`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT` configured (in `.env`
or CI secrets).

### Example prompt

```
Use the Jira Import agent.

Import the Zinc Bank login scenarios from features/login/login.feature into
Jira project QA as test issues. Preserve feature, scenario, preconditions,
steps, expected results, tags, and priority. Search for duplicates first.
```

### What it does

1. Reads `features/**/*.feature`.
2. Converts scenarios into Jira-compatible test cases.
3. **Searches for duplicates** by summary before creating anything.
4. Creates issues **only when you approve**.

```bash
npm run jira:import:dry-run    # preview what would be imported (mandatory)
npm run jira:import            # create/update bug issues
```

If an equivalent test already exists, it reports the existing Jira key instead of
creating a duplicate.

---

## 10. The Jira Status Update Agent

**Job:** Sync Jira issue statuses/execution results from the **latest** automation
report.

**Rules to remember:** never mark a test PASS when the latest result is FAIL; always
base updates on the latest report; never expose credentials.

### Example prompt

```
Use the Jira Status Update agent.

Update Jira execution results from the latest Zinc Bank login test run.
Mark passing scenarios accordingly and add failure details for any that failed.
```

### What it does

1. Reads `reports/cucumber-report/cucumber-report.json` (the latest run).
2. Identifies passed / failed / skipped scenarios.
3. Maps scenarios to Jira issues (by summary/title).
4. Transitions statuses via `scripts/jira/update-status.mjs`.
5. Adds execution info and failure detail where applicable.

```bash
npm run jira:status -- QA-123 "In Progress"
```


---

## 11. The Orchestrator Agent

**Job:** Run an entire automation request end-to-end by **delegating every stage** to
the right specialist — Planner, Branch, Test Generator, Healer, Commit, Push, and
(optionally) PR — while enforcing an **approval gate between each stage** and tracking
progress in `.cline/state/orchestrator.json`.

**Rules to remember:** the Orchestrator **never** does specialist work itself. It does
not write scenarios, code, or Page Objects; it does not create branches, commits,
pushes, or PRs; it does not touch Jira. It only picks the next agent, hands context
forward, and asks for your approval at each gate.

### The pipeline it coordinates

```text
User Request
    ↓
Planner Agent          →  BDD test plan (no code)
    ↓  ASK USER
Branch Agent           →  create the working branch
    ↓  ASK USER
Test Generator Agent   →  feature file + steps + Page Objects
    ↓
Validate / run tests
    ├── pass ────────────────────┐
    └── fail ──→ Healer (max 3) ─┴─→ re-run → must pass
    ↓  ASK USER
Commit Agent           →  review the diff + commit
    ↓  ASK USER
Push Agent             →  push the branch
    ↓  ASK USER
PR Agent (optional)    →  open a pull request
```

Branch creation always happens **before** the Test Generator touches the framework,
so generated code is never written directly on `main`.

### Example prompt — orchestrate a Zinc Bank login feature

```
Run the orchestrate workflow.

Add BDD coverage for the Zinc Bank login flow: plan it, create the branch,
generate the tests, validate them, and if all green, commit, push, and open a PR.
```

### What you can expect back

The Orchestrator moves through the stages one at a time. After each stage it shows a
status checklist and asks for your approval before continuing:

```text
WORKFLOW STATUS

[✓] Planner
[✓] Branch
[✓] Test Generator
[ ] Validation
[ ] Commit
[ ] Push

Current State: TESTS_READY
Next Target:   Run the validation gate
```

When the pipeline finishes it prints a **WORKFLOW SUMMARY** with real results:

```text
WORKFLOW SUMMARY

Planner:       Completed
Branch:        Created (test/zincbank-login-coverage)
Validation:    Passed
Healer:        Not Required
Commit:        Created (abc1234)
Push:          Completed
Pull Request:  Created (#12)

Tests Passed: 4   Tests Failed: 0
Files Created: features/login/login.feature,
               src/steps/login.steps.ts,
               src/pages/ZincBankLoginPage.ts
Final State: COMPLETED
```

### State, resume & recovery

Progress is saved to `.cline/state/orchestrator.json` (git-ignored, same semantics as
`.env`). If the pipeline is interrupted — you stop at an approval gate or a run
crashes — re-invoke the Orchestrator and it **resumes** from the last completed stage
instead of starting over. Terminal (finished) runs are retained for audit.

---

## 12. End-to-End Workflow Examples

Workflows are pre-built recipes that chain agents together. There are five:

| Workflow | File | Flow |
| --- | --- | --- |
| `create-test` | `.cline/workflows/create-test.md` | plan → generate → run → verify |
| `heal-test` | `.cline/workflows/heal-test.md` | reproduce → analyze → fix (max 3) → validate |
| `orchestrate` | `.cline/workflows/orchestrate.md` | full pipeline: plan → branch → generate → validate/heal → commit → push → PR |
| `jira-import` | `.cline/workflows/jira-import.md` | dry-run first, then import |
| `jira-status-update` | `.cline/workflows/jira-status-update.md` | update statuses from latest report |

### 12.1 Create a new test — Zinc Bank account summary

```
Run the create-test workflow.

Requirement: As a signed-in Zinc Bank customer I want to see my account
summary (Checking ••4291 $12,480.55, Savings ••7782 $48,200.00) and a
"ZincBank Card · available $4,150.00" balance on the dashboard.
```

The workflow will:

1. **Plan** — the Planner opens the app, signs in, and confirms the real balance
   labels before writing the plan.
2. **Generate** — the Test Generator writes `features/dashboard/account-summary.feature`,
   steps, and a Page Object (reusing existing login helpers where possible).
3. **Run & verify** — `npx cucumber-js --tags "@<tag>"`, then `npm run verify`.
4. **Report** — it summarizes pass/fail counts and asks before committing/pushing.

### 12.2 Heal a failing test — Zinc Bank sign-in

```
Run the heal-test workflow.

The Zinc Bank "Successful sign-in" scenario is failing after the last deploy.
```

The workflow will reproduce the failure, analyze the artifacts, apply up to 3 targeted
fixes, and validate with `npm run verify` — then stop and ask you if it still fails.

### 12.3 Sync results to Jira after a Zinc Bank run

```
Run the jira-status-update workflow.

Use the latest Zinc Bank test report to update Jira execution results.
```

It ensures a fresh report exists, then the Jira Status Agent maps scenarios to issues
and transitions statuses — never marking a PASS when the latest result is FAIL.

### 12.4 Orchestrate the whole pipeline — Zinc Bank login

```
Run the orchestrate workflow.

Add BDD coverage for the Zinc Bank login flow: plan it, create the branch,
generate the tests, validate them, and if all green, commit, push, and open a PR.
```

The Orchestrator (Section 11) drives each stage through the right specialist, pausing
for your approval between them, and finishes with a WORKFLOW SUMMARY.

---

## 13. Skills

Agents call **skills** to apply reusable, framework-specific knowledge without
repeating large instruction blocks. You rarely invoke a skill directly — the agent does
it for you. The available skills:

| Skill | Purpose |
| --- | --- |
| `playwright` | Auto-waiting, recommended locators, `data-test` attribute, headed/debug runs |
| `cucumber` | Correct Gherkin, tags, step definitions, the custom `World`, dry-run |
| `page-object-model` | Page Object conventions, composition, `waitForReady()`/`waitForPage()` |
| `test-design` | Positive/negative/boundary coverage, isolated scenarios, tagging |
| `test-healing` | Evidence-first diagnosis, max 3 attempts, common root causes |
| `git` | Branch naming, Conventional Commits, secret blocking, approval gates |
| `jira` | Import + status scripts, de-duplication, dry-run first |
| `reporting` | Generate/inspect Cucumber + Allure reports, failure artifacts |
| `environment-management` | Multi-env config (`dev`/`qa`/`stage`/`prod`), `.env`, browser selection |

Example of a skill-driven prompt (the agent will use the relevant skills internally):

```
Add Zinc Bank coverage. Reuse existing page objects and steps where possible,
follow the locator rules, and validate with npm run verify.
```

---

## 14. Rules, Boundaries & Approval

The agents obey a shared rule set in `.clinerules/`. The most important for you as a
user:

### Always be asked for approval before

- Creating, modifying, or **deleting any file outside the task scope**.
- **Creating a file under the `specs/` folder** (the agent drafts the spec and only writes it after your explicit approval).
- **Deleting** files/directories (tests, reports, scripts).
- **Committing, pushing, force-pushing, or opening a PR**.
- **Creating Jira issues or changing Jira statuses** (dry-run first).
- **Disabling, skipping, deleting, or significantly altering an existing test**.
- Running **destructive commands** (`git reset --hard`, `git clean`, `rm -rf`, uninstalls).
- **Switching environments with real credentials** or pointing tests at `prod`.

### No approval needed for

- Reading files, searching the codebase, running the suite locally, generating reports.
- Fixing lint/format/type errors, updating locators, adding step definitions for a
  requested feature.
- Running the healing workflow within its 3-attempt limit.

### Security

- Credentials never appear in source, feature files, reports, logs, or chat.
- Real secrets live only in `.env` / CI secret stores; `.env.example` has placeholders.
- Run `npm run verify:secrets` before committing.
- If a secret leaks, tell the user immediately (rotate + scrub history).

### Agent-specific boundaries

| Agent | Hard boundary |
| --- | --- |
| Healer | max **3** healing attempts, then ask the user |
| Jira Import | search for duplicates first; never create duplicates |
| Jira Status | never mark PASS when the latest result is FAIL |
| Planner | inspect the live UI; produce a plan, **not code** |
| Test Generator | reuse existing Page Objects/steps; **run** the test before finishing |
| Orchestrator | delegate only — never do specialist work itself; stop at every approval gate |
| Git agents | never commit secrets, never push/PR without approval, never commit blindly |


---

## 15. Command Cheat Sheet

| Task | Command |
| --- | --- |
| Full suite | `npm test` |
| Smoke suite | `npm run test:smoke` |
| Sanity suite | `npm run test:sanity` |
| Critical suite | `npm run test:critical` |
| Regression suite | `npm run test:regression` |
| WIP suite | `npm run test:wip` |
| Headed run | `npm run test:headed` |
| Debug (Playwright API log) | `npm run test:debug` |
| Validate steps only | `npm run test:dry-run` |
| Browser-specific | `npm run test:chromium` / `test:firefox` / `test:webkit` |
| Choose environment | `ENV=qa npm test` |
| Cucumber HTML/JSON + summary | `npm run report:cucumber` |
| Generate Allure report | `npm run report:allure` |
| Open Allure report | `npm run report:allure:open` |
| Quality gate | `npm run verify` |
| Secret scan | `npm run verify:secrets` |
| Jira import (dry-run) | `npm run jira:import:dry-run` |
| Jira import | `npm run jira:import` |
| Jira status update | `npm run jira:status -- <KEY> <STATUS>` |
| Install browsers | `npm run install:browsers` |

---

## 16. Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| Agent created a plan but no code | Expected — the **Planner never writes code**. Ask the **Test Generator** next. |
| Healer keeps failing after many tries | It is capped at 3 attempts; once it stops, investigate env/data or raise with the team. |
| `getByTestId` can't find elements | Zinc Bank uses `data-test` (registered globally). Use `data-test` attributes. |
| Tests fail only in CI | Credentials missing — add GitHub Secrets / Jenkins Credentials and run `prepare-env`. |
| `npx playwright install` needed | Install the browser for the machine: `npx playwright install chromium`. |
| Parallel flakiness | Lower `WORKERS`; ensure scenarios are isolated (fresh context per scenario). |
| Step ambiguous | Two step definitions match the same text — consolidate with parameterized steps. |
| Secrets flagged by `verify:secrets` | Remove the real value or add a precise ignore in `scripts/verify-secrets.js`. |
| Jira import would create duplicates | The agent de-dupes first; check the dry-run output and report existing keys. |
| Orchestrator stops between stages | Expected — it pauses for approval at each gate. Answer and it resumes from `.cline/state/orchestrator.json`. |

---

## Appendix — Zinc Bank reference

The examples in this guide reference the real Zinc Bank UI (confirmed at
`https://zincbank.cydeo.io`):

- **Login page (`/login`)** — heading "Welcome back / Sign in to ZincBank";
  fields **Email**, **Password**; button **Sign in**; link **"New to ZincBank? Open an account"**.
- **Homepage (`/`)** — nav links **Personal, Business, Cards, Company**, **Log in**, **Open account**;
  hero **"Banking, quietly exceptional"**; account preview **Checking ••4291 $12,480.55**,
  **Savings ••7782 $48,200.00**, **ZincBank Card · available $4,150.00**;
  sections **Checking & Savings**, **Move money**, **ZincBank Card**, **Statements & history**.

Use these exact labels when you prompt the Planner so it confirms them against the
live app, and so the Test Generator picks stable, user-visible locators.


