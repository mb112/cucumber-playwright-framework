import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Zinc Bank homepage (https://zincbank.cydeo.io/).
 *
 * Locators confirmed against the live app:
 * - The primary navigation is a `<nav aria-label="Primary">`, resolved via
 *   `getByRole('navigation', { name: 'Primary' })`.
 * - The tabs (Personal, Business, Cards, Company) are links inside that
 *   navigation. The footer "ZincBank" navigation also contains a "Cards" link,
 *   so tab locators are scoped to the primary navigation to avoid ambiguity.
 */
export class ZincBankHomePage extends BasePage {
  public readonly primaryNavigation: Locator = this.page.getByRole('navigation', {
    name: 'Primary',
  });

  public override async waitForReady(): Promise<void> {
    await this.primaryNavigation.waitFor({ state: 'visible' });
  }

  /** Opens the homepage and waits until the primary navigation is ready. */
  public async open(): Promise<void> {
    await this.goto('/');
    await this.waitForReady();
  }

  /** Returns the primary navigation tab link with the given name. */
  public tab(name: string): Locator {
    return this.primaryNavigation.getByRole('link', { name, exact: true });
  }
}
