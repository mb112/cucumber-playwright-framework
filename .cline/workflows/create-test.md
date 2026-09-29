---
name: create-test
description: End-to-end BDD creation flow - plan a feature with the Planner Agent, generate the feature file/step definitions/Page Objects with the Test Generator Agent, then run and verify.
mode: plan
agents:
  - planner-agent
  - test-generator-agent
---

# Create Test Workflow

Follow this workflow when a user asks to add coverage for a new feature or requirement.

## Step 1 - Plan

Invoke the **Planner Agent** with the requirement.

- Inspect the live application via the browser to confirm real labels and flows.
- Produce a structured spec (features, scenarios, preconditions, tags, priority).
- Draft the spec, get explicit user approval, then save it to `specs/<area>/<name>.spec.md`.
- Do NOT write implementation code at this stage.

## Step 2 - Generate

Hand the plan to the **Test Generator Agent**.

- Reuse existing Page Objects and step definitions wherever possible.
- Create `features/<area>/<name>.feature` + `src/steps/<name>.steps.ts` + page objects only when needed.
- Follow the locator rules and step-definition conventions.

## Step 3 - Run and verify

```bash
npx cucumber-js --tags "@<new-tag-or-feature>"   # run the new coverage
npm run verify                                    # lint + format + typecheck
npm run report:cucumber
```

## Step 4 - Report

- Summarize pass/fail counts and any issues found.
- Do not commit/push unless explicitly asked.
