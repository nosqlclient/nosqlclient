/**
 * Created by RSercan on 10.1.2016.
 */
/* global Async */
import { Meteor } from 'meteor/meteor';
import LOGGER from '../internal/logger';
import Helper from './helper';
import { databasesBySessionId } from './methods_common';

function proceedExecutionStepByStep(entry, last, done, execution) {
  Object.keys(entry).forEach((key) => {
    if (last && key === Object.keys(entry)[Object.keys(entry).length - 1]) {
      entry[key].push((err, docs) => {
        done(err, docs);
      });
      execution[key](...entry[key]);
    } else {
      execution = execution[key](...entry[key]);
    }
  });

  return execution;
}

const proceedQueryExecution = (methodArray, runOnAdminDB, sessionId) => {
  LOGGER.info(JSON.stringify(methodArray), runOnAdminDB, sessionId);

  const result = Async.runSync((done) => {
    try {
      let execution = runOnAdminDB ? databasesBySessionId[sessionId].admin() : databasesBySessionId[sessionId];
      for (let i = 0; i < methodArray.length; i += 1) {
        const last = (i === (methodArray.length - 1));
        const entry = Helper.convertJSONtoBSON(methodArray[i]);
        execution = proceedExecutionStepByStep(entry, last, done, execution);
      }
    } catch (ex) {
      LOGGER.error(methodArray, sessionId, ex);
      done(new Meteor.Error(ex.message), null);
    }
  });

  return Helper.convertBSONtoJSON(result);
};

Meteor.methods({
  top(sessionId) {
    LOGGER.info('[top]', sessionId);

    const result = Async.runSync((done) => {
      try {
        databasesBySessionId[sessionId].executeDbAdminCommand({ top: 1 }, {}, (err, res) => {
          done(err, res);
        });
      } catch (ex) {
        LOGGER.error('[top]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });

    return Helper.convertBSONtoJSON(result);
  },

  dbStats(sessionId) {
    LOGGER.info('[stats]', sessionId);

    const result = Async.runSync((done) => {
      try {
        databasesBySessionId[sessionId].stats((err, docs) => {
          done(err, docs);
        });
      } catch (ex) {
        LOGGER.error('[stats]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });

    return Helper.convertBSONtoJSON(result);
  },

  validateCollection(collectionName, options, sessionId) {
    const methodArray = [
      {
        validateCollection: [collectionName, options],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  setProfilingLevel(level, sessionId) {
    const methodArray = [
      {
        setProfilingLevel: [level],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  serverStatus(sessionId) {
    const methodArray = [
      {
        serverStatus: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  serverInfo(sessionId) {
    const methodArray = [
      {
        serverInfo: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  replSetGetStatus(sessionId) {
    const methodArray = [
      {
        replSetGetStatus: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  removeUser(username, runOnAdminDB, sessionId) {
    const methodArray = [
      {
        removeUser: [username],
      },
    ];
    return proceedQueryExecution(methodArray, runOnAdminDB, sessionId);
  },

  profilingInfo(sessionId) {
    const methodArray = [
      {
        profilingInfo: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  ping(sessionId) {
    const methodArray = [
      {
        ping: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  listDatabases(sessionId) {
    const methodArray = [
      {
        listDatabases: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },

  command(command, runOnAdminDB, options, sessionId) {
    const methodArray = [
      {
        command: [command, options],
      },
    ];
    return proceedQueryExecution(methodArray, runOnAdminDB, sessionId);
  },

  addUser(username, password, options, runOnAdminDB, sessionId) {
    const methodArray = [
      {
        addUser: [username, password, options],
      },
    ];
    return proceedQueryExecution(methodArray, runOnAdminDB, sessionId);
  },

  buildInfo(sessionId) {
    const methodArray = [
      {
        buildInfo: [],
      },
    ];
    return proceedQueryExecution(methodArray, true, sessionId);
  },
});
