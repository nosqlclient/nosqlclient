import { Meteor } from 'meteor/meteor';
import { Logger, Database, Error } from '/server/imports/modules';
import MongoDBHelper from './helper';

const spawn = require('cross-spawn');

const Backup = function () {
};

const executeBinary = function (args, sessionId, binaryName) {
  const binaryPath = MongoDBHelper.getProperBinary(binaryName);
  const metadataToLog = { args, sessionId, binaryPath };
  Logger.info({ message: `${binaryName}`, metadataToLog });

  try {
    const spawned = spawn(binaryPath, args);
    spawned.stdout.on('data', Meteor.bindEnvironment((data) => {
      if (data.toString()) {
        Database.create({
          type: Database.types.Dumps,
          document: {
            date: Date.now(),
            sessionId,
            binary: binaryName,
            message: data.toString()
          }
        });
      }
    }));

    spawned.stderr.on('data', Meteor.bindEnvironment((data) => {
      if (data.toString()) {
        Database.create({
          type: Database.types.Dumps,
          document: {
            date: Date.now(),
            sessionId,
            binary: binaryName,
            message: data.toString(),
            error: true,
          }
        });
      }
    }));

    spawned.on('close', Meteor.bindEnvironment(() => {
      Database.create({
        type: Database.types.Dumps,
        document: {
          date: Date.now(),
          sessionId,
          binary: binaryName,
          message: 'CLOSED',
        }
      });
    }));

    spawned.stdin.end();
  } catch (exception) {
    Error.create({ type: Error.types.BackupError, formatters: [binaryName], externalError: exception, metadataToLog });
  }
};

Backup.prototype = {
  mongodump({ args, sessionId }) {
    executeBinary(args, sessionId, 'mongodump');
  },

  mongorestore({ args, sessionId }) {
    executeBinary(args, sessionId, 'mongorestore');
  },

  mongoexport({ args, sessionId }) {
    executeBinary(args, sessionId, 'mongoexport');
  },

  mongoimport({ args, sessionId }) {
    executeBinary(args, sessionId, 'mongoimport');
  },

  removeDumpLogs({ sessionId, binary }) {
    Logger.info({ message: 'remove-dump-logs', metadataToLog: { sessionId, binary } });
    if (!binary) Database.remove({ type: Database.types.Dumps, selector: { sessionId } });
    else Database.remove({ type: Database.types.Dumps, selector: { sessionId, binary } });
  }
};

export default new Backup();
