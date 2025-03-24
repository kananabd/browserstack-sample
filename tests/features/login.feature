@login
Feature: User Authentication Tests

Background:
    Given User navigates to the application

Scenario: Login should be success
    And User enters the username from the environment
    And User enters the password from the environment
    When User click on the login button
    Then User should be able to see the Home Page