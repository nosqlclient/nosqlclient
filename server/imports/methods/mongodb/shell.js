import { Meteor } from 'meteor/meteor';
import { MongoDBShell } from '/server/imports/core';

Meteor.methods({
  clearShell(sessionId) {
    MongoDBShell.clearShell({ sessionId });
  },

  executeShellCommand(command, connectionId, username, password, sessionId) {
    MongoDBShell.executeShellCommand({ command, connectionId, username, password, sessionId });
  },

  connectToShell(connectionId, username, password, sessionId) {
    MongoDBShell.connectToShell({ connectionId, username, password, sessionId });
  }
});
