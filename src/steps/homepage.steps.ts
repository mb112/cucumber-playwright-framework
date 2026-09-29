import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ZincBankHomePage } from '../pages/ZincBankHomePage';
import { CustomWorld } from '../support/world';

Given('I open the Zinc Bank homepage', async function (this: CustomWorld): Promise<void> {
  await new ZincBankHomePage(this.page).open();
});

Then(
  'the primary navigation shows {string}, {string}, {string}, and {string}',
  async function (
    this: CustomWorld,
    personal: string,
    business: string,
    cards: string,
    company: string,
  ): Promise<void> {
    const homePage = new ZincBankHomePage(this.page);
    for (const tab of [personal, business, cards, company]) {
      await expect(homePage.tab(tab)).toBeVisible();
    }
  },
);

When('I check the {string} primary navigation tab', async function (this: CustomWorld, tab: string): Promise<void> {
  // Remember which tab was checked so the following Then can assert its target.
  this.scenarioContext.tab = tab;
});

Then('the tab points to the {string} section', async function (this: CustomWorld, target: string): Promise<void> {
  const homePage = new ZincBankHomePage(this.page);
  const checkedTab = this.scenarioContext.tab;
  expect(checkedTab).toBeTruthy();
  await expect(homePage.tab(String(checkedTab))).toHaveAttribute('href', target);
});
