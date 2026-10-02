import { Meteor } from 'meteor/meteor';
import { MongoDB } from '/server/imports/core';

// Read-only methods call this.unblock() so a slow read doesn't queue this client's later calls behind it;
// write methods stay blocking, so a read issued after a write still sees it. A blocking call issued after a read
// (e.g. disconnect) may run while that read is still in flight; the read then fails with a connection error.
Meteor.methods({
  listCollectionNames({ dbName, sessionId }) {
    this.unblock();
    const methodArray = [
      {
        listCollections: [],
        toArray: []
      }
    ];
    return MongoDB.executeClientMethod({ dbName, methodArray, sessionId });
  },

  getDatabases({ sessionId }) {
    this.unblock();
    const methodArray = [
      {
        listDatabases: []
      }
    ];
    const result = MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
    result.result = result.result ? result.result.databases : result.result;

    return result;
  },

  disconnect({ sessionId }) {
    MongoDB.disconnect({ sessionId });
  },

  connect({ connectionId, username, password, sessionId }) {
    return MongoDB.connect({ connectionId, username, password, sessionId });
  }
});
