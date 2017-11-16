import { Meteor } from 'meteor/meteor';
import { Connection } from '/server/imports/core';

Meteor.methods({
  save(connection) {
    Connection.save(connection);
  },

  checkAndSaveConnection(connection) {
    Connection.checkAndClear(connection);
    connection.databaseName = connection.databaseName || 'admin';

    Connection.save(connection);
  },

  parseUrl(connection) {
    return Connection.parseUrl(connection);
  },

  removeConnection(connectionId) {
    Connection.remove(connectionId);
  },
});
