import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { config } from '../config/config';
import { ZincBankLoginPage } from '../pages/ZincBankLoginPage';
import { CustomWorld } from '../support/world';

Given('I open the Zinc Bank login page', async function (this: CustomWorld): Promise<void> {
  await new ZincBankLoginPage(this.page).open();
});

When('I sign in with my registered credentials', async function (this: CustomWorld): Promise<void> {
  await new ZincBankLoginPage(this.page).signIn(config.username, config.password);
});

When(
  'I sign in with email {string} and password {string}',
  async function (this: CustomWorld, email: string, password: string): Promise<void> {
    const loginPage = new ZincBankLoginPage(this.page);
    // Always fill the fields (which clears any existing content first).
    // Using fill() is safer than separate clear() + fill() as it handles both in one action.
    await loginPage.emailInput.fill(email);
    await loginPage.passwordInput.fill(password);
    // Submit the form.
    await loginPage.signInButton.click();
  },
);

When('I click the "Open an account" link', async function (this: CustomWorld): Promise<void> {
  await new ZincBankLoginPage(this.page).goToOpenAccount();
});

Then('I am signed in to the account dashboard', async function (this: CustomWorld): Promise<void> {
  // Wait for the dashboard URL (backend auth can be slow on the demo app).
  await expect(this.page).toHaveURL(/\/dashboard$/, { timeout: 10000 });
  await expect(this.page.getByRole('heading', { name: /^Welcome/ })).toBeVisible();
});

Then('the required-field validation error is displayed', async function (this: CustomWorld): Promise<void> {
  const loginPage = new ZincBankLoginPage(this.page);
  // Validation error should appear when form submission happens with empty fields.
  // The demo app can have latency, so use a reasonable timeout.
  await loginPage.errorNote.waitFor({ state: 'visible', timeout: 10000 });
  await expect(loginPage.errorNote).toContainText(loginPage.requiredFieldsMessage);
});

Then('the account registration page is displayed', async function (this: CustomWorld): Promise<void> {
  await expect(this.page).toHaveURL(/\/apply$/);
  await expect(this.page.getByRole('heading', { name: 'Open your ZincBank account' })).toBeVisible();
});
