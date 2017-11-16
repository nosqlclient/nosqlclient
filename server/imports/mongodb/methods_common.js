/**
 * Created by RSercan on 5.3.2016.
 */
/* global Async */
import { Meteor } from 'meteor/meteor';
import { Settings, Connections, Dumps, ShellCommands, SchemaAnalyzeResult } from '/lib/imports/collections';
import { Connection } from '/server/imports/core';

const mongodbApi = require('mongodb');
const tunnelSsh = require('tunnel-ssh');

export const databasesBySessionId = {};
const spawnedShellsBySessionId = {};
const tunnelsBySessionId = {};

const proceedConnectingMongodb = (dbName, sessionId, connectionUrl, connectionOptions, done) => {
  if (!connectionOptions) {
    connectionOptions = {};
  }

  mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, (mainError, db) => {
    try {
      if (mainError || !db) {
        LOGGER.error(mainError, sessionId, db);
        done(mainError, db);
        if (db) db.close();
        if (tunnelsBySessionId[sessionId]) {
          tunnelsBySessionId[sessionId].close();
          tunnelsBySessionId[sessionId] = null;
        }
        return;
      }
      dbObjectsBySessionId[sessionId] = db.db(dbName);
      dbObjectsBySessionId[sessionId].listCollections().toArray((err, collections) => {
        done(err, collections);
      });

      LOGGER.info('[connect]', `current sesssion length: ${Object.keys(dbObjectsBySessionId).length}`);
    } catch (ex) {
      LOGGER.error('[connect]', sessionId, ex);
      done(new Meteor.Error(ex.message), null);
      if (db) db.close();
      if (tunnelsBySessionId[sessionId]) {
        tunnelsBySessionId[sessionId].close();
        tunnelsBySessionId[sessionId] = null;
      }
    }
  });
};

Meteor.methods({
  connect(connectionId, username, password, sessionId) {
    const connection = Connections.findOne({ _id: connectionId });
    const connectionUrl = Connection.getConnectionUrl(connection, false, username, password);
    const connectionOptions = Connection.getConnectionOptions(connection);

    LOGGER.info('[connect]', connectionUrl, Helper.clearConnectionOptionsForLog(connectionOptions), sessionId);

    return Async.runSync((done) => {
      try {
        if (connection.ssh && connection.ssh.enabled) {
          const config = {
            dstPort: connection.ssh.destinationPort,
            localPort: connection.ssh.localPort ? connection.ssh.localPort : connection.servers[0].port,
            host: connection.ssh.host,
            port: connection.ssh.port,
            readyTimeout: 99999,
            username: connection.ssh.username,
          };

          if (connection.ssh.certificateFile) config.privateKey = Buffer.from(connection.ssh.certificateFile);
          if (connection.ssh.passPhrase) config.passphrase = connection.ssh.passPhrase;
          if (connection.ssh.password) config.password = connection.ssh.password;

          LOGGER.info('[connect]', '[ssh]', sessionId, `ssh is enabled, config is ${JSON.stringify(config)}`);
          tunnelsBySessionId[sessionId] = tunnelSsh(config, Meteor.bindEnvironment((error) => {
            if (error) {
              done(new Meteor.Error(error.message), null);
              return;
            }
            proceedConnectingMongodb(connection.databaseName, sessionId, connectionUrl, connectionOptions, done);

            const mongoPath = getProperBinary('mongo');
            spawnedShellsBySessionId[sessionId] = spawn(mongoPath, [connectionUrl]);
            setEventsToShell(connectionId, sessionId);
          }));

          tunnelsBySessionId[sessionId].on('error', (err) => {
            if (err) done(new Meteor.Error(err.message), null);
            if (tunnelsBySessionId[sessionId]) {
              tunnelsBySessionId[sessionId].close();
              tunnelsBySessionId[sessionId] = null;
            }
          });
        } else {
          proceedConnectingMongodb(connection.databaseName, sessionId, connectionUrl, connectionOptions, done);
        }
      } catch (ex) {
        LOGGER.error('[connect]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  analyzeSchema(connectionId, username, password, collection, sessionId) {
    const connectionUrl = Connection.getConnectionUrl(Connections.findOne({ _id: connectionId }), true, username, password, true);
    const mongoPath = getProperBinary('mongo');

    const args = [connectionUrl, '--quiet', '--eval', `var collection =\"${collection}\", outputFormat=\"json\"`, `${getMongoExternalsPath()}/variety/variety.js_`];
    LOGGER.info('[analyzeSchema]', sessionId, args, collection);
    try {
      const spawned = spawn(mongoPath, args);
      let message = '';
      spawned.stdout.on('data', Meteor.bindEnvironment((data) => {
        if (data.toString()) {
          message += data.toString();
        }
      }));

      spawned.stderr.on('data', Meteor.bindEnvironment((data) => {
        if (data.toString()) {
          SchemaAnalyzeResult.insert({
            date: Date.now(),
            sessionId,
            connectionId,
            message: data.toString(),
          });
        }
      }));

      spawned.on('close', Meteor.bindEnvironment(() => {
        SchemaAnalyzeResult.insert({
          date: Date.now(),
          sessionId,
          connectionId,
          message,
        });
      }));

      spawned.stdin.end();
    } catch (ex) {
      LOGGER.error('[analyzeSchema]', sessionId, ex);
      throw new Meteor.Error(ex.message);
    }
  },
});
