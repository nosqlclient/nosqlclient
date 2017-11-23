import { Meteor } from 'meteor/meteor';
import { Database, Logger, Error } from '/server/imports/modules';
import { Connection } from '/server/imports/core';
import MongoDBHelper from './helper';

const spawn = require('cross-spawn');

const MongoDBShell = function () {
  this.spawnedShellsBySessionId = {};
};

const setEventsToShell = function (connectionId, sessionId) {
  Logger.info({ message: 'shell-event-bind', metadataToLog: { connectionId, sessionId } });

  this.spawnedShellsBySessionId[sessionId].on('error', Meteor.bindEnvironment((error) => {
    Logger.error({ message: 'shell-event-bind', metadataToLog: { error, sessionId } });
    this.spawnedShellsBySessionId[sessionId] = null;
    if (error) {
      Database.create({
        type: Database.types.ShellCommands,
        document: {
          date: Date.now(),
          sessionId,
          connectionId,
          message: `unexpected error ${error.message}`,
        }
      });
    }
  }));

  this.spawnedShellsBySessionId[sessionId].stdout.on('data', Meteor.bindEnvironment((data) => {
    if (data && data.toString()) {
      Database.create({
        type: Database.types.ShellCommands,
        document: {
          date: Date.now(),
          sessionId,
          connectionId,
          message: data.toString(),
        }
      });
    }
  }));

  this.spawnedShellsBySessionId[sessionId].stderr.on('data', Meteor.bindEnvironment((data) => {
    if (data && data.toString()) {
      Database.create({
        type: Database.types.ShellCommands,
        document: {
          date: Date.now(),
          sessionId,
          connectionId,
          message: data.toString()
        }
      });
    }
  }));

  this.spawnedShellsBySessionId[sessionId].on('close', Meteor.bindEnvironment((code) => {
    // show ended message in codemirror
    Database.create({
      type: Database.types.ShellCommands,
      document: {
        date: Date.now(),
        connectionId,
        sessionId,
        message: `shell closed ${code.toString()}`
      }
    });

    this.spawnedShellsBySessionId[sessionId] = null;
    Meteor.setTimeout(() => {
      // remove all for further
      Database.remove({ type: Database.types.ShellCommands, selector: { sessionId } });
    }, 500);
  }));
};

MongoDBShell.prototype = {
  connectToShell({ connectionId, username, password, sessionId }) {
    const connection = Database.readOne({ type: Database.types.Connections, query: { _id: connectionId } });

    try {
      if (!this.spawnedShellsBySessionId[sessionId]) {
        const connectionUrl = Connection.getConnectionUrl(connection, username, password, true);
        const mongoPath = MongoDBHelper.getProperBinary('mongo');
        Logger.info({ message: 'shell', metadataToLog: { mongoPath, connectionUrl, sessionId } });
        this.spawnedShellsBySessionId[sessionId] = spawn(mongoPath, [connectionUrl]);
        setEventsToShell.call(this, connectionId, sessionId);
      }
    } catch (ex) {
      this.spawnedShellsBySessionId[sessionId] = null;
      Error.create({ type: Error.types.ShellError, externalError: ex, metadataToLog: { connectionId, username, sessionId } });
    }

    if (this.spawnedShellsBySessionId[sessionId]) {
      Logger.info({ message: 'shell', metadataToLog: { command: `use ${connection.databaseName}`, sessionId } });
      this.spawnedShellsBySessionId[sessionId].stdin.write(`use ${connection.databaseName}\n`);
      return `use ${connection.databaseName}`;
    }

    Error.create({ type: Error.types.ShellError });
  },

  clearShell({ sessionId }) {
    Logger.info({ message: 'clear-shell', metadataToLog: sessionId });
    Database.remove({ type: Database.types.ShellCommands, selector: { sessionId } });
  },

  executeShellCommand({ command, connectionId, username, password, sessionId }) {
    Logger.info({ message: 'shell-command-execution', metadataToLog: { sessionId, command, connectionId } });
    if (!this.spawnedShellsBySessionId[sessionId]) this.connectToShell({ connectionId, username, password, sessionId });
    if (this.spawnedShellsBySessionId[sessionId]) this.spawnedShellsBySessionId[sessionId].stdin.write(`${command}\n`);
  }
};

export default new MongoDBShell();
