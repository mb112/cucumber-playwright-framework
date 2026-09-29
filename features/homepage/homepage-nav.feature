Feature: Zinc Bank homepage primary navigation
  As a site visitor
  I want to see the primary navigation tabs on the homepage
  So that I can navigate to the Personal, Business, Cards, and Company sections

  @smoke
  Scenario: Homepage shows all four primary navigation tabs
    Given I open the Zinc Bank homepage
    Then the primary navigation shows "Personal", "Business", "Cards", and "Company"

  @sanity
  Scenario Outline: Each primary navigation tab points to its section
    Given I open the Zinc Bank homepage
    When I check the "<tab>" primary navigation tab
    Then the tab points to the "<target>" section

    Examples:
      | tab      | target        |
      | Personal | #features     |
      | Business | #features     |
      | Cards    | #feature-card |
      | Company  | #footer       |
