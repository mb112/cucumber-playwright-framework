Feature: Zinc Bank login
  As a Zinc Bank customer
  I want to sign in with my email and password
  So that I can access my account dashboard

  Background:
    Given I open the Zinc Bank login page

  @smoke
  Scenario: Successful sign-in with valid credentials
    When I sign in with my registered credentials
    Then I am signed in to the account dashboard

  @sanity
  Scenario: Empty fields show required-field error
    When I sign in with email "" and password ""
    Then the required-field validation error is displayed

  @sanity
  Scenario: Open an account link leads to the registration page
    When I click the "Open an account" link
    Then the account registration page is displayed
