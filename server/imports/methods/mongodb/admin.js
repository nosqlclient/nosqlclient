import { Meteor } from 'meteor/meteor';
import { MongoDB } from '/server/imports/core';

Meteor.methods({
  top(sessionId) {
    const methodArray = [
      {
        executeDbAdminCommand: [{ top: 1 }, {}],
      }
    ];

    return MongoDB.executeAdmin({ methodArray, sessionId });
  },

  dbStats(sessionId) {
    const methodArray = [
      {
        stats: [],
      }
    ];

    return MongoDB.executeAdmin({ methodArray, sessionId });
  },

  validateCollection(collectionName, options, sessionId) {
    const methodArray = [
      {
        validateCollection: [collectionName, options],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  setProfilingLevel(level, sessionId) {
    const methodArray = [
      {
        setProfilingLevel: [level],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  serverStatus(sessionId) {
    const methodArray = [
      {
        serverStatus: [],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  serverInfo(sessionId) {
    const methodArray = [
      {
        serverInfo: [],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  replSetGetStatus(sessionId) {
    const methodArray = [
      {
        replSetGetStatus: [],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  removeUser(username, runOnAdminDB, sessionId) {
    const methodArray = [
      {
        removeUser: [username],
      },
    ];

    return MongoDB.executeAdmin({ methodArray, runOnAdminDB, sessionId });
  },

  profilingInfo(sessionId) {
    const methodArray = [
      {
        profilingInfo: [],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  ping(sessionId) {
    const methodArray = [
      {
        ping: []
      }
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  listDatabases(sessionId) {
    const methodArray = [
      {
        listDatabases: []
      }
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  command(command, runOnAdminDB, options, sessionId) {
    const methodArray = [
      {
        command: [command, options],
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB, sessionId });
  },

  addUser(username, password, options, runOnAdminDB, sessionId) {
    const methodArray = [
      {
        addUser: [username, password, options]
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB, sessionId });
  },

  buildInfo(sessionId) {
    const methodArray = [
      {
        buildInfo: []
      },
    ];
    return MongoDB.executeAdmin({ methodArray, runOnAdminDB: true, sessionId });
  },

  dropDB(sessionId) {
    const methodArray = [
      {
        dropDatabase: []
      }
    ];
    return MongoDB.executeAdmin({ methodArray, sessionId });
  },

  dropAllCollections(sessionId) {
    return MongoDB.dropAllCollections({ sessionId });
  },

  createCollection(collectionName, options, sessionId) {
    const methodArray = [
      {
        createCollection: [collectionName, options]
      }
    ];
    return MongoDB.executeAdmin({ methodArray, sessionId, removeCollectionTopology: true });
  }
});
