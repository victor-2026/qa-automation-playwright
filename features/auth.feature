Feature: Buzzhive Authentication

  Scenario: User can login with valid credentials
    Given I am on the login page
    When I enter "alice@buzzhive.com" as email
    And I enter "alice123" as password
    And I click the login button
    Then I should be logged in

  Scenario: User cannot login with wrong password
    Given I am on the login page
    When I enter "alice@buzzhive.com" as email
    And I enter "wrongpassword" as password
    And I click the login button
    Then I should see an error message
