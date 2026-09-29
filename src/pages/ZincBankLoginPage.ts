import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Zinc Bank login page (https://zincbank.cydeo.io/login).
 *
 * Locators confirmed against the live app:
 * - Email / Password inputs are labelled fields, so `getByLabel` resolves them.
 * - "Sign in" is a real `<button type="submit">`, resolved via `getByRole`.
 * - Errors and validation notes share a single note element marked with
 *   `data-testid="login-error"` (ZincBank marks elements with `data-testid`).
 */
export class ZincBankLoginPage extends BasePage {
  public readonly emailInput: Locator = this.page.getByLabel('Email');
  public readonly passwordInput: Locator = this.page.getByLabel('Password');
  public readonly signInButton: Locator = this.page.getByRole('button', { name: 'Sign in' });
  public readonly openAccountLink: Locator = this.page.getByRole('link', { name: 'Open an account' });
  public readonly errorNote: Locator = this.page.getByTestId('login-error');

  /** Shown when the email and/or password fields are empty on submit. */
  public readonly requiredFieldsMessage = 'Enter your email and password.';

  public override async waitForReady(): Promise<void> {
    await this.signInButton.waitFor({ state: 'visible' });
  }

  /** Opens the login page and waits until it is ready. */
  public async open(): Promise<void> {
    await this.goto('/login');
    await this.waitForReady();
  }

  /** Fills the credentials and submits the sign-in form. */
  public async signIn(email: string, password: string): Promise<void> {
    // Always fill (which clears first). For truly empty fields, ensure they are cleared.
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    // Wait briefly for the response (either success nav or error note).
    // Playwright auto-waits for network idle by default on click.
  }

  /** Navigates to the account registration flow. */
  public async goToOpenAccount(): Promise<void> {
    await this.openAccountLink.click();
  }
}
