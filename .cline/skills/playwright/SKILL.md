---
name: playwright
description: Use Playwright best practices in this framework - auto-waiting, recommended locators, screenshots/traces, and never arbitrary waits.
---

# Playwright Skill

## Core rules

- Use Playwright's automatic waiting and built-in assertions (`expect(...).toBeVisible()`, `toBeEnabled()`, `toHaveText()`).
- NEVER use `page.waitForTimeout(...)` for arbitrary waits.
- Prefer locators over raw selectors (see the locator-rules).
- This framework uses Cucumber's library API: Playwright config is loaded inside `BeforeAll` in `src/hooks/hooks.ts` via `chromium.launch()`, not `@playwright/test` runners.

## Framework specifics

- `testIdAttribute` is registered globally as `data-testid` via `selectors.setTestIdAttribute('data-testid')` in `BeforeAll` — ZincBank uses `data-testid` (Playwright's default).
- Each scenario gets a fresh `BrowserContext` + `Page` (see `src/support/world.ts` and `src/hooks/hooks.ts`).
- Page Objects expose `waitForReady()` and `waitForPage()` (on base page) for navigation assertions.

## Commands

```bash
npm run test:headed     # headed chromium run
BROWSER=firefox npx cucumber-js   # other browsers
npm run install:browsers          # install all Playwright browsers
```

## Debugging

- `npm run test:debug` runs with `DEBUG=pw:api` to trace Playwright calls.
- Failure artifacts (screenshot, trace, error) are written to `reports/artifacts/` and attached to the report.
