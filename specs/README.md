# Specs

This folder holds the BDD specs produced by the **Planner Agent**.

## Convention

- One markdown file per feature: `specs/<area>/<name>.spec.md` (e.g. `specs/login/login.spec.md`).
- Follow the Planner output format (Feature, scenarios, preconditions, steps, tags, priority).
- The **Test Generator Agent** reads the spec from here to produce
  `features/<area>/<name>.feature` + `src/steps/` + Page Objects.

## Approval rule

- The agent **drafts the spec, presents it, and writes the file only after the user gives explicit approval**.
- Do not put implementation code (feature files, step definitions, Page Objects) in this folder — specs only.
