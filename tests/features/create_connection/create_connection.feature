/**
 * Created by sercan on 01.03.2016.
 */
Feature: Create a Connection

As a visitor to the mongoclient.com, I can manage connections.
I want to create, update, delete connections on the home page of mongoclient.

Background:
  Given I am on the site

Scenario: Visitor creates a connection
  When I name a widget "myConnection"
  And submit the form
  Then I should see a list of connections names containing "myConnection"