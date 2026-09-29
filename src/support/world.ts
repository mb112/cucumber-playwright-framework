import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { ScenarioMetadata } from '../types';

/**
 * Custom Cucumber World.
 *
 * Owns the Playwright primitives (browser, context, page) and per-scenario
 * metadata. One instance is created per scenario, so there is no global mutable
 * state and scenarios stay isolated.
 *
 * Page objects are created per feature file by the step definitions that need
 * them (see src/pages/), keeping the world generic and project-agnostic.
 */
export class CustomWorld extends World {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;

  public scenario: ScenarioMetadata = { name: '', tags: [] };
  public consoleErrors: string[] = [];

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
