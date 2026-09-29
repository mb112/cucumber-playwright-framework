# Playwright Rules

- Use Playwright's recommended locators and auto-waiting; NEVER arbitrary `waitForTimeout`.
- Prefer assertions over sleeps: `expect(locator).toBeVisible()`, `toHaveText()`, `toBeEnabled()`.
- This framework runs via Cucumber library API — the Playwright config is applied in `BeforeAll` (browser launch), not via `playwright.config.ts` run by the test runner.
- Register `data-testid` as the test id attribute: `selectors.setTestIdAttribute('data-testid')` in `BeforeAll` (ZincBank uses `data-testid`, Playwright's default).
- Create a fresh `BrowserContext` + `Page` per scenario for isolation; close them in `After`.
- Capture failure artifacts (screenshot, trace, error, console) only on failure — do not generate huge artifacts for passing tests.
- Traces/screenshots/videos follow `config` settings (`trace`, `screenshot`, `video`).
- Use `context.tracing` for traces and `page.screenshot({ fullPage: true })` for screenshots.
- Keep Playwright usage inside Page Objects and steps; assertions belong in steps (soft expectations allowed there), not inside Page Objects.
