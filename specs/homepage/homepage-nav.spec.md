# Zinc Bank — Homepage Primary Navigation Tabs Test Plan

## App under test

- **URL:** https://zincbank.cydeo.io/
- **Page elements (observed on the live homepage, `banner` → `navigation "Primary"`):**
  - **Personal** link → `#features`
  - **Business** link → `#features`
  - **Cards** link → `#feature-card`
  - **Company** link → `#footer`

## Feature

```text
Feature: Zinc Bank Homepage Primary Navigation
  As a site visitor
  I want to see the primary navigation tabs on the homepage
  So that I can navigate to the Personal, Business, Cards, and Company sections
```

## Scenarios

### Scenario 1 — Homepage shows all four primary navigation tabs

```text
Preconditions:
- Homepage is loaded

Steps:
  Given I open the Zinc Bank homepage
  Then the primary navigation shows "Personal", "Business", "Cards", and "Company"

Priority: High
Tag: @smoke
```

### Scenario 2 — Each primary navigation tab points to its section

```text
Preconditions:
- Homepage is loaded

Steps (data-driven):
  Given I open the Zinc Bank homepage
  When I check the "<tab>" primary navigation tab
  Then the tab points to the "<target>" section

Examples:
  | tab      | target        |
  | Personal | #features     |
  | Business | #features     |
  | Cards    | #feature-card |
  | Company  | #footer       |

Priority: High
Tag: @sanity
```

## Reuse & conventions for the Test Generator Agent

- Add a `ZincBankHomePage` Page Object (extends `BasePage`) exposing `waitForReady()`.
- Scope the tab locators to the `navigation` with accessible name **"Primary"** and
  resolve links via `getByRole('link', { name: ... })`.
- Feature file at `features/homepage/homepage-nav.feature`, tagged `@smoke` / `@sanity`.
- Locator priority: role > label > placeholder > text > `data-test` > CSS > XPath.
- No hardcoded URLs — use `config.baseUrl` + `/`; no arbitrary `waitForTimeout`.
- Scenarios are independent and isolated; no ordering or shared state.
