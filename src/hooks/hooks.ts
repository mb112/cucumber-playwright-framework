import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  ITestCaseHookParameter,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { Browser, chromium, firefox, selectors, webkit } from '@playwright/test';
import { config } from '../config/config';
import { CustomWorld } from '../support/world';
import { BrowserName } from '../types';
import { captureFailureArtifacts } from '../utils/artifact-manager';
import { logger } from '../utils/logger';

setDefaultTimeout(config.timeout);

const browserLaunchers: Record<BrowserName, typeof chromium> = {
  chromium,
  firefox,
  webkit,
};

let browser: Browser | undefined;

async function launchBrowser(): Promise<Browser> {
  const launcher = browserLaunchers[config.browser];
  if (!launcher) {
    throw new Error(`Unsupported browser "${config.browser}". Use one of: ${Object.keys(browserLaunchers).join(', ')}`);
  }
  logger.info('Launching browser', { browser: config.browser, headless: config.headless });
  return launcher.launch({ headless: config.headless });
}

BeforeAll(async (): Promise<void> => {
  // ZincBank marks its elements with `data-testid` (Playwright's default).
  // The framework runs under Cucumber (library API), so `playwright.config.ts`
  // options don't apply here and the attribute must be registered globally on
  // the Playwright selectors.
  selectors.setTestIdAttribute('data-testid');

  browser = await launchBrowser();
  logger.info('Environment loaded', {
    env: config.env,
    baseUrl: config.baseUrl,
    workers: config.workers,
    retries: config.retries,
  });
});

Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter): Promise<void> {
  const tags = scenario.pickle.tags.map((tag) => tag.name);
  this.scenario = { name: scenario.pickle.name, tags };
  this.consoleErrors = [];

  if (!browser) {
    throw new Error('Browser was not launched in BeforeAll');
  }

  this.context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: { width: 1280, height: 720 },
  });
  this.page = await this.context.newPage();

  if (config.trace !== 'off') {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  this.page.on('console', (message) => {
    if (message.type() === 'error') {
      this.consoleErrors.push(message.text());
    }
  });
  this.page.on('pageerror', (error) => {
    this.consoleErrors.push(`Page error: ${error.message}`);
  });

  logger.info('Scenario started', { scenario: this.scenario.name, tags });
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter): Promise<void> {
  const status = scenario.result?.status;

  if (status === Status.FAILED) {
    logger.error('Scenario failed', { scenario: this.scenario.name, error: scenario.result?.message });
    await captureFailureArtifacts(
      this,
      this.page,
      this.context,
      this.scenario.name,
      scenario.result?.message,
      this.consoleErrors,
    );
  }

  if (this.context) {
    await this.context.close().catch((error: unknown) => {
      logger.warn('Failed to close browser context', { error: String(error) });
    });
  }

  logger.info('Scenario finished', { scenario: this.scenario.name, status });
});

AfterAll(async (): Promise<void> => {
  if (browser) {
    await browser.close();
    logger.info('Browser closed');
  }
});
