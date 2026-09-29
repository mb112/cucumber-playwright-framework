# Zinc Bank — Login Page Test Plan

## App under test

- **URL:** https://zincbank.cydeo.io/login
- **Page elements (observed on the live login page):**
  - **Email** field
  - **Password** field
  - **Sign in** button
  - **"New to ZincBank? Open an account"** link (registration path)

## Feature

```text
Feature: Zinc Bank Login
  As a Zinc Bank customer
  I want to sign in with my email and password
  So that I can access my account dashboard
```

## Scenarios

### Scenario 1 — Successful sign-in with valid credentials

```text
Preconditions:
- A registered user exists
- User is on /login

Steps:
  Given I open the Zinc Bank login page
  When I sign in with email "user@example.com" and password "secret"
  Then I am signed in to the account dashboard

Priority: Critical
Tag: @smoke
```

### Scenario 2 — Sign-in with an invalid password shows an error

```text
Preconditions:
- User is on /login

Steps:
  Given I open the Zinc Bank login page
  When I sign in with email "user@example.com" and password "wrong"
  Then a sign-in error is displayed

Priority: High
Tag: @critical
```

### Scenario 3 — Required fields are validated

```text
Preconditions:
- User is on /login

Steps (data-driven):
  When I sign in with email "<email>" and password "<password>"
  Then the required-field validation error is displayed

Examples:
  | email            | password | expected message  |
  | (empty)          | secret   | Email is required |
  | user@example.com | (empty)  | Password is required |
  | (empty)          | (empty)  | Email is required |

Priority: High
Tag: @sanity
```

### Scenario 4 — "New to ZincBank? Open an account" registration path

```text
Preconditions:
- User is on /login

Steps:
  Given I open the Zinc Bank login page
  When I click "New to ZincBank? Open an account"
  Then the account registration page is displayed

Priority: Medium
Tag: @sanity
```

## Reuse & conventions for the Test Generator Agent

- Reuse existing step definitions (`src/steps/`) and Page Objects (`src/pages/`); create new ones only when necessary.
- Add/reuse a `ZincBankLoginPage` Page Object that exposes `waitForReady()`.
- Locator priority: role > label > placeholder > text > `data-test` > CSS > XPath.
- No hardcoded credentials or URLs — use `config` and test-data builders.
- Scenarios are independent and isolated; no ordering or shared state.
