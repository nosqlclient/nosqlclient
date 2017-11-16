import { Meteor } from 'meteor/meteor';
import { MongoDB } from '/server/imports/core';

Meteor.methods({
  listCollectionNames(dbName, sessionId) {
    const methodArray = [
      {
        db: [dbName],
        listCollections: [],
        toArray: []
      }
    ];
    return MongoDB.executeAdmin({ methodArray, sessionId });
  },

  getDatabases(sessionId) {
    const methodArray = [
      {
        listDatabases: []
      }
    ];
    const result = MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
    result.result = result.result ? result.result.databases : result.result;

    return result;
  },

  disconnect(sessionId) {
    MongoDB.disconnect({ sessionId });
  },

  connect(connectionId, username, password, sessionId) {
    MongoDB.connect({ connectionId, username, password, sessionId });
  }
});
