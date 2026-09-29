# Playwright + TypeScript + Cucumber BDD Framework

A **production-ready, enterprise-grade UI test automation framework** built with **Playwright**, **TypeScript**, and **Cucumber BDD**, featuring Allure + Cucumber reporting, Page Object Model, multi-environment configuration, CI/CD (GitHub Actions + Jenkins), and an AI-agent toolchain for Cline.

The reference application is [Swag Labs (Saucedemo)](https://www.saucedemo.com) — a standard demo store used to validate the framework end-to-end.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Tags & Suites](#test-tags--suites)
- [Reporting](#reporting)
- [Failure Artifacts](#failure-artifacts)
- [CI/CD](#cicd)
- [Jira Integration](#jira-integration)
- [Cline AI Agents, Skills & Rules](#cline-ai-agents-skills--rules)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Features

- **BDD with Cucumber** — human-readable Gherkin features that describe business behavior.
- **Page Object Model** — one page/component per class; locators and actions encapsulated, composition over inheritance.
- **Multi-environment** — `dev`, `qa`, `stage`, `prod` configs; switch with `ENV=qa npm test`.
- **Secure credentials** — secrets live in git-ignored `.env`; CI injects them from GitHub Secrets / Jenkins Credentials.
- **Allure reporting** — per-scenario steps, status, duration, environment info, and attached failure artifacts.
- **Cucumber reporting** — HTML + JSON report plus a console summary script.
- **Failure artifacts** — screenshot, Playwright trace, error message, and console errors captured automatically on failure.
- **Parallel execution** — Cucumber `parallel` workers with isolated `BrowserContext` per scenario.
- **Controlled retries** — 1 retry on CI, 0 locally (configurable via `RETRIES`/CI).
- **Quality gates** — ESLint, Prettier, and strict TypeScript bundled into `npm run verify`.
- **CI/CD** — GitHub Actions workflows (test, smoke, regression) and a declarative Jenkinsfile.
- **AI-agent toolchain** — Cline agents (planner, test generator, healer, git, Jira), skills, workflows, and rules.
- **Jira integration** — import failed scenarios as bugs and update issue statuses via helper scripts.

## Tech Stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Test runner  | Cucumber (`@cucumber/cucumber` 13.x, library API)     |
| Automation   | Playwright (`@playwright/test` 1.63.x)                |
| Language     | TypeScript 5.x (strict)                               |
| Reporting    | Allure (`allure-cucumberjs` 3.x) + Cucumber HTML/JSON |
| Config       | `dotenv` + `src/config/config.ts`                     |
| Code quality | ESLint 10, Prettier 3                                 |
| CI/CD        | GitHub Actions, Jenkins                               |
| AI tooling   | Cline agents/skills/workflows/rules                   |
| Runtime      | Node.js >= 20                                         |

---

## Architecture

```text
project-root/
│
├── .cline/                      # Cline AI-agent toolchain
│   ├── agents/                  # git/, planner/, test-generator/, healer/, jira-import/, jira-status/
│   ├── skills/                  # playwright, cucumber, page-object-model, test-design, test-healing, git, jira, reporting, environment-management
│   └── workflows/               # create-test, heal-test, jira-import, jira-status-update
├── .clinerules/                 # architecture, coding-standards, playwright, cucumber, locator, environment, git, agent, security, approval rules
├── specs/                       # BDD specs from the Planner Agent (written only after user approval)
├── .github/workflows/           # test.yml, smoke.yml, regression.yml
├── features/                    # Gherkin features, grouped by area
│   └── login/login.feature
├── scripts/
│   ├── ci/                      # prepare-env.sh, run-tests.sh (shared by CI/CD)
│   ├── jira/                    # import-results.mjs, update-status.mjs
│   ├── clean-reports.js
│   ├── summarize-cucumber-report.js
│   └── verify-secrets.js
├── src/
│   ├── pages/                   # Page Object Model
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   └── components/Header.ts
│   ├── steps/                   # Cucumber step definitions
│   ├── hooks/                   # BeforeAll/Before/After hooks + browser lifecycle
│   ├── support/                 # CustomWorld
│   ├── config/                  # config.ts + environments/{dev,qa,stage,prod}.ts
│   ├── data/                    # test data builders (Faker)
│   ├── types/                   # shared types
│   └── utils/                   # logger, artifact-manager, etc.
├── reports/                     # generated reports (git-ignored)
├── .env.example                 # committed template with placeholders
├── cucumber.js                  # Cucumber configuration
├── playwright.config.ts         # Playwright options (referenced by the library API)
├── package.json
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── Jenkinsfile
└── README.md
```

> The flow is always: **Feature file → Step definitions → Page Object → Playwright → Assertion → Report**.

## Prerequisites

- **Node.js >= 20** (recommend 20 LTS or newer)
- **npm**
- Git

## Quick Start

```bash
# 1. Install dependencies
npm ci

# 2. Install the Playwright browser (Chromium is the default)
npx playwright install chromium

# 3. Create your local environment file from the template
cp .env.example .env
# ...then fill in USERNAME/PASSWORD (and any overrides) in .env

# 4. Run the full suite
npm test

# 5. Generate reports
npm run report:cucumber
npm run report:allure
```

> Saucedemo's demo accounts are `standard_user` / `secret_sauce` (password for all demo users). Store them in `.env`, never in code.

---

## Configuration

All runtime behavior is driven by environment variables read through `src/config/config.ts` (values can also come from `.env`). The table below lists the most important variables — see `.env.example` for the full set with comments.

| Variable                | Default           | Description                                               |
| ----------------------- | ----------------- | --------------------------------------------------------- |
| `ENV`                   | `qa`              | Target environment: `dev` \| `qa` \| `stage` \| `prod`    |
| `BASE_URL`              | per-env           | Optional override of the environment base URL             |
| `BROWSER`               | `chromium`        | `chromium` \| `firefox` \| `webkit`                       |
| `HEADLESS`              | `true`            | Headless mode                                             |
| `TIMEOUT`               | `30000`           | Playwright action timeout (ms)                            |
| `WORKERS`               | `1`               | Cucumber parallel workers (1 = sequential)                |
| `RETRIES`               | CI=1 / local=0    | Scenario retry count                                      |
| `TRACE`                 | `on-first-retry`  | Playwright trace mode                                     |
| `SCREENSHOT`            | `only-on-failure` | Screenshot mode                                           |
| `VIDEO`                 | `off`             | Video mode                                                |
| `LOG_LEVEL`             | `info`            | Logger verbosity (`debug` \| `info` \| `warn` \| `error`) |
| `USERNAME` / `PASSWORD` | —                 | Application credentials (never hardcoded)                 |

Example:

```bash
ENV=qa BROWSER=chromium WORKERS=4 npm test
ENV=stage HEADLESS=false npm run test:headed
```

Per-environment base URLs and metadata live in `src/config/environments/<env>.ts`.

## Running Tests

| Command                                                  | Description                                   |
| -------------------------------------------------------- | --------------------------------------------- |
| `npm test`                                               | Full suite                                    |
| `npm run test:smoke`                                     | `--tags "@smoke"`                             |
| `npm run test:sanity`                                    | `--tags "@sanity"`                            |
| `npm run test:critical`                                  | `--tags "@critical"`                          |
| `npm run test:regression`                                | `--tags "@regression"`                        |
| `npm run test:wip`                                       | `--tags "@wip"`                               |
| `npm run test:headed`                                    | Headed Chromium (`HEADLESS=false`)            |
| `npm run test:debug`                                     | Playwright API debug logging (`DEBUG=pw:api`) |
| `npm run test:dry-run`                                   | Validate step definitions only (no execution) |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | Browser-specific runs                         |

## Test Tags & Suites

Features use Cucumber tags so one feature file serves multiple suites — no duplicated files:

| Tag           | Purpose                       |
| ------------- | ----------------------------- |
| `@smoke`      | Fast, critical happy paths    |
| `@sanity`     | Broad sanity after a deploy   |
| `@critical`   | High-priority flows           |
| `@regression` | Deep, slower coverage         |
| `@wip`        | Work in progress (may change) |

Run a custom tag directly:

```bash
npx cucumber-js --tags "@smoke and @critical"
```

---

## Reporting

### Cucumber report

`npm run report:cucumber` produces:

- `reports/cucumber-report/cucumber-report.html` — browsable HTML report
- `reports/cucumber-report/cucumber-report.json` — machine-readable JSON
- Console summary (scenario/step pass-fail counts) via `scripts/summarize-cucumber-report.js`

### Allure report

```bash
npm run report:allure           # generate reports/allure-report/
npm run report:allure:open      # open it in a browser
```

Allure captures per scenario: steps, status, duration, environment info, and failure artifacts.

> Note: Allure results are generated live during the run by `allure-cucumberjs/reporter` into `reports/allure-results/`; generation itself just renders the static report.

### Cleaning

```bash
npm run report:clean            # wipe reports/ (allure + cucumber + artifacts)
```

## Failure Artifacts

When a scenario fails, `src/utils/artifact-manager.ts` automatically captures and attaches:

- **Screenshot** — `reports/artifacts/<scenario>.png`
- **Trace** — `reports/artifacts/<scenario>.zip` (when `TRACE` is enabled)
- **Error message** — `reports/artifacts/error-message.txt`
- **Console errors** — `reports/artifacts/console-errors.txt`

Artifacts are attached to the report via `World#attach`, so the Allure report includes them automatically.

## CI/CD

### GitHub Actions

| Workflow   | File                               | Triggers                             |
| ---------- | ---------------------------------- | ------------------------------------ |
| Test Suite | `.github/workflows/test.yml`       | push/PR to `main`, manual dispatch   |
| Smoke      | `.github/workflows/smoke.yml`      | push/PR to `main`, manual dispatch   |
| Regression | `.github/workflows/regression.yml` | manual dispatch, nightly (02:00 UTC) |

Required repository secrets: `ENV`, `BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD` (optional repository variables: `WORKERS`, `BROWSER`, `TRACE`).

The `test` workflow also runs a `quality` job (`npm run verify`). Reports are uploaded as build artifacts (`cucumber-report`, `allure-report`).

### Jenkins

`Jenkinsfile` is a declarative pipeline with parameters:

- `TEST_TAG` — `all`, `smoke`, `sanity`, `critical`, `regression`
- `ENV` — `qa`, `dev`, `stage`, `prod`
- `WORKERS`

Requirements: NodeJS plugin (tool `node20`) and a Jenkins credential `saucedemo` (username/password) with the application credentials. The optional Allure plugin is detected at runtime — if absent, the pipeline archives the report instead of failing.

Both CI systems share `scripts/ci/prepare-env.sh` and `scripts/ci/run-tests.sh` so behaviour is identical everywhere.

## Jira Integration

Two helper scripts (Node 18+, no dependencies) back the Jira agents:

```bash
# Import failed scenarios from the Cucumber JSON report as Jira bugs
npm run jira:import:dry-run      # preview first (mandatory)
npm run jira:import              # create/update issues (dedupes by summary)

---

## Cline AI Agents, Skills & Rules

This repository ships a complete Cline toolchain to let AI agents plan, generate, heal, run, and report on tests safely.

### Agents (`.cline/agents/`)

| Agent                  | Responsibility                                                              |
|------------------------|-----------------------------------------------------------------------------|
| `planner/planner-agent`      | Converts requirements into structured BDD test plans; inspects the live UI first |
| `test-generator/test-generator-agent` | Turns plans into feature files, step definitions, and Page Objects (reusing existing ones) |
| `healer/healer-agent`        | Diagnoses and fixes failing tests — max 3 attempts, then escalates        |
| `git/commit-agent`           | Reviews diffs, blocks secrets, creates Conventional Commits                |
| `git/branch-agent`           | Creates correctly named branches; never works on `main` unapproved         |
| `git/push-agent`             | Pushes only with explicit approval                                         |
| `git/pr-agent`               | Drafts pull requests with real test results and report links               |
| `jira-import/jira-import-agent` | Imports BDD scenarios into Jira after de-duplication                     |
| `jira-status/jira-status-agent` | Syncs Jira statuses from the latest report (never PASS on FAIL)          |

### Skills (`.cline/skills/`)

`playwright`, `cucumber`, `page-object-model`, `test-design`, `test-healing`, `git`, `jira`, `reporting`, `environment-management`.

### Workflows (`.cline/workflows/`)

- `create-test.md` — plan → generate → run → verify
- `heal-test.md` — reproduce → analyze → fix (max 3) → validate
- `jira-import.md` — dry-run first, then import
- `jira-status-update.md` — update statuses from the latest report

### Rules (`.clinerules/`)

`architecture`, `coding-standards`, `playwright-rules`, `cucumber-rules`, `locator-rules`, `environment-rules`, `git-rules`, `agent-rules`, `security-rules`, `approval-rules`.

## Best Practices

- **Locators**: role → label → placeholder → text → `data-test` → stable CSS → XPath (last resort). The framework registers `data-test` as the Playwright test-id attribute because the reference app uses `data-test`, not `data-testid`.
- **No arbitrary waits** — rely on Playwright auto-waiting and assertions.
- **Isolation** — a fresh `BrowserContext`/`Page` per scenario; scenarios never depend on each other.
- **Step definitions are thin** — business logic lives in Page Objects.
- **Secrets** — only in `.env`/CI secret stores; run `npm run verify:secrets` before committing.
- **Quality gate** — run `npm run verify` before finishing any task.

## Troubleshooting

| Symptom                                | Likely fix                                                        |
|----------------------------------------|-------------------------------------------------------------------|
| `getByTestId` can't find elements      | The app may use `data-test` (registered globally). Use `data-test` attributes. |
| Tests fail only in CI                   | Credentials missing — add GitHub Secrets / Jenkins Credentials and run `prepare-env`. |
| `npx playwright install` needed         | Install the browser for the machine: `npx playwright install chromium`. |
| Allure CLI unknown syntax error         | Use the new syntax: `allure generate ./reports/allure-results --output ./reports/allure-report` (the `report:allure` script already does). |
| Parallel flakiness                       | Lower `WORKERS`, ensure scenarios are isolated (fresh context per scenario). |
| Step ambiguous                           | Two step definitions match the same text — consolidate with parameterized steps. |
| Secrets flagged by `verify:secrets`      | Remove the real value or add a precise ignore in `scripts/verify-secrets.js`. |


# Update an issue's status via its available transitions
npm run jira:status -- QA-123 "In Progress"
```

Environment: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT`, optional `JIRA_ISSUE_TYPE` (default `Bug`).
