Feature: Create a Connection

As a visitor to the mongoclient.com, I can manage connections.
I want to create, update, delete connections on the home page of mongoclient.

Background:
  Given I am on the site

Scenario: Visitor creates a connection
  When I name a connection "myConnection"
  And submit the form
  Then I should see a list of connections names containing "myConnection"