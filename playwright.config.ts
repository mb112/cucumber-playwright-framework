import { defineConfig, devices } from '@playwright/test';
import { config as frameworkConfig } from './src/config/config';

/**
 * Playwright runner configuration.
 *
 * NOTE: The framework executes tests through Cucumber (`cucumber-js`), not the
 * Playwright Test runner. This config exists so Playwright tooling works
 * (e.g. `npx playwright install`), reports are generated consistently, and any
 * standalone Playwright specs dropped under `tests/` run with the same
 * conventions as the Cucumber suite.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: frameworkConfig.timeout,
  retries: frameworkConfig.retries,
  workers: frameworkConfig.workers,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright-report', open: 'never' }]],
  use: {
    baseURL: frameworkConfig.baseUrl,
    headless: frameworkConfig.headless,
    screenshot: frameworkConfig.screenshot,
    trace: frameworkConfig.trace,
    video: frameworkConfig.video,
    testIdAttribute: 'data-testid',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
