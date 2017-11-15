/**
 * Created by RSercan on 5.3.2016.
 */
/* global Async */
import { Meteor } from 'meteor/meteor';
import { Settings, Connections, Dumps, ShellCommands, SchemaAnalyzeResult } from '/lib/imports/collections';
import { migrateConnectionsIfExist } from '/server/imports/internal/startup';
import LOGGER from '../internal/logger';
import Helper from './helper';


const mongodbApi = require('mongodb');
const tunnelSsh = require('tunnel-ssh');
const fs = require('fs');
const spawn = require('cross-spawn');
const os = require('os');

export const databasesBySessionId = {};
const spawnedShellsBySessionId = {};
const tunnelsBySessionId = {};

const getMongoExternalsPath = () => {
  let currentDir = process.cwd().replace(/\\/g, '/');
  currentDir = `${currentDir.substring(0, currentDir.lastIndexOf('/'))}/web.browser/app/mongo/`;

  // make sure everything has correct permissions
  fs.chmodSync(currentDir, '777');
  fs.chmodSync(`${currentDir}darwin/mongo`, '777');
  fs.chmodSync(`${currentDir}win32/mongo.exe`, '777');
  fs.chmodSync(`${currentDir}linux/mongo`, '777');
  fs.chmodSync(`${currentDir}variety/variety.js_`, '777');

  return currentDir;
};


const setEventsToShell = (connectionId, sessionId) => {
  LOGGER.info('[shell]', 'binding events to shell', connectionId, sessionId);

  spawnedShellsBySessionId[sessionId].on('error', Meteor.bindEnvironment((err) => {
    LOGGER.error(`unexpected error on spawned shell: ${err}`, sessionId);
    spawnedShellsBySessionId[sessionId] = null;
    if (err) {
      ShellCommands.insert({
        date: Date.now(),
        sessionId,
        connectionId,
        message: `unexpected error ${err.message}`,
      });
    }
  }));

  spawnedShellsBySessionId[sessionId].stdout.on('data', Meteor.bindEnvironment((data) => {
    if (data && data.toString()) {
      ShellCommands.insert({
        date: Date.now(),
        sessionId,
        connectionId,
        message: data.toString(),
      });
    }
  }));

  spawnedShellsBySessionId[sessionId].stderr.on('data', Meteor.bindEnvironment((data) => {
    if (data && data.toString()) {
      ShellCommands.insert({
        date: Date.now(),
        sessionId,
        connectionId,
        message: data.toString(),
      });
    }
  }));

  spawnedShellsBySessionId[sessionId].on('close', Meteor.bindEnvironment((code) => {
    // show ended message in codemirror
    ShellCommands.insert({
      date: Date.now(),
      connectionId,
      sessionId,
      message: `shell closed ${code.toString()}`,
    });

    spawnedShellsBySessionId[sessionId] = null;
    Meteor.setTimeout(() => {
      // remove all for further
      ShellCommands.remove({ sessionId });
    }, 500);
  }));
};

export const getProperBinary = (binaryName) => {
  const settings = Settings.findOne();
  if (settings.mongoBinaryPath) {
    const dir = `${settings.mongoBinaryPath.replace(/\\/g, '/')}/`;
    LOGGER.info(`[${binaryName}]`, `checking dir ${dir} for binary ${binaryName}`);
    const errorMessage = `Binary ${binaryName} not found in ${dir + binaryName}, please set mongo binary path from settings`;

    switch (os.platform()) {
      case 'win32':
        if (!fs.existsSync(`${dir + binaryName}.exe`)) throw new Meteor.Error(errorMessage);
        return `${dir + binaryName}.exe`;
      default:
        if (!fs.existsSync(dir + binaryName)) throw new Meteor.Error(errorMessage);
        return dir + binaryName;
    }
  } else if (!settings.mongoBinaryPath && binaryName === 'mongo') {
    const dir = getMongoExternalsPath();
    switch (os.platform()) {
      case 'darwin':
        return `${dir}darwin/mongo`;
      case 'win32':
        return `${dir}win32/mongo.exe`;
      case 'linux':
        return `${dir}linux/mongo`;
      default:
        throw new Meteor.Error(`Not supported os: ${os.platform()}, you can set mongo binary path from settings`);
    }
  } else throw new Meteor.Error('Please set mongo binaries from settings');
};

const connectToShell = (connectionId, username, password, sessionId) => {
  const connection = Connections.findOne({ _id: connectionId });

  try {
    if (!spawnedShellsBySessionId[sessionId]) {
      const connectionUrl = Helper.getConnectionUrl(connection, false, username, password, true);
      const mongoPath = getProperBinary('mongo');
      LOGGER.info('[shell]', mongoPath, connectionUrl, sessionId);
      spawnedShellsBySessionId[sessionId] = spawn(mongoPath, [connectionUrl]);
      setEventsToShell(connectionId, sessionId);
    }
  } catch (ex) {
    spawnedShellsBySessionId[sessionId] = null;
    LOGGER.error('[shell]', sessionId, ex);
    throw new Meteor.Error(ex.message || ex);
  }

  if (spawnedShellsBySessionId[sessionId]) {
    LOGGER.info('[shell]', `executing command "use ${connection.databaseName}" on shell`, sessionId);
    spawnedShellsBySessionId[sessionId].stdin.write(`use ${connection.databaseName}\n`);
    return `use ${connection.databaseName}`;
  } throw new Meteor.Error("Couldn't spawn shell, please check logs !");
};

const keepDroppingCollections = (collections, i, done) => {
  if (collections.length === 0 || i >= collections.length) {
    done(null, {});
    return;
  }

  if (!collections[i].collectionName.startsWith('system')) {
    collections[i].drop().then(() => {
      keepDroppingCollections(collections, i += 1, done);
    });
  } else {
    keepDroppingCollections(collections, i += 1, done);
  }
};

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
      databasesBySessionId[sessionId] = db.db(dbName);
      databasesBySessionId[sessionId].listCollections().toArray((err, collections) => {
        done(err, collections);
      });

      LOGGER.info('[connect]', `current sesssion length: ${Object.keys(databasesBySessionId).length}`);
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
  importMongoclient(file) {
    LOGGER.info('[importNosqlclient]', file);

    try {
      const mongoclientData = JSON.parse(file);
      if (mongoclientData.settings) {
        Settings.remove({});
        delete mongoclientData.settings._id;
        Settings.insert(mongoclientData.settings);
      }

      if (mongoclientData.connections) {
        for (let i = 0; i < mongoclientData.connections.length; i += 1) {
          delete mongoclientData.connections[i]._id;
          Connections._collection.insert(mongoclientData.connections[i]);
        }
        migrateConnectionsIfExist();
      }
    } catch (ex) {
      LOGGER.error('[importNosqlclient]', 'unexpected error during import', ex);
      throw new Meteor.Error(ex.message);
    }
  },

  listCollectionNames(dbName, sessionId) {
    LOGGER.info('[listCollectionNames]', dbName, sessionId);

    return Async.runSync((done) => {
      try {
        const wishedDB = databasesBySessionId[sessionId].db(dbName);
        wishedDB.listCollections().toArray((err, collections) => {
          done(err, collections);
        });
      } catch (ex) {
        LOGGER.error('[listCollectionNames]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  getDatabases(sessionId) {
    LOGGER.info('[getDatabases]', sessionId);

    return Async.runSync((done) => {
      try {
        databasesBySessionId[sessionId].admin().listDatabases((err, dbs) => {
          if (dbs) {
            done(err, dbs.databases);
          } else {
            done(err, {});
          }
        });
      } catch (ex) {
        LOGGER.error('[getDatabases]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  disconnect(sessionId) {
    LOGGER.info('[disconnect]', sessionId);

    if (databasesBySessionId[sessionId]) {
      databasesBySessionId[sessionId].close();
    }
    if (spawnedShellsBySessionId[sessionId]) {
      spawnedShellsBySessionId[sessionId].stdin.end();
      spawnedShellsBySessionId[sessionId] = null;
    }
    ShellCommands.remove({ sessionId });
    SchemaAnalyzeResult.remove({ sessionId });
    Dumps.remove({ sessionId });
  },

  connect(connectionId, username, password, sessionId) {
    const connection = Connections.findOne({ _id: connectionId });
    const connectionUrl = Helper.getConnectionUrl(connection, false, username, password);
    const connectionOptions = Helper.getConnectionOptions(connection);

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

  dropDB(sessionId) {
    LOGGER.info('[dropDatabase]', sessionId);

    return Async.runSync((done) => {
      try {
        databasesBySessionId[sessionId].dropDatabase((err, result) => {
          done(err, result);
        });
      } catch (ex) {
        LOGGER.error('[dropDatabase]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  dropCollection(collectionName, sessionId) {
    LOGGER.info('[dropCollection]', sessionId, collectionName);

    return Async.runSync((done) => {
      try {
        const collection = databasesBySessionId[sessionId].collection(collectionName);
        collection.drop((dropError) => {
          done(dropError, null);
        });
      } catch (ex) {
        LOGGER.error('[dropCollection]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  dropAllCollections(sessionId) {
    LOGGER.info('[dropAllCollections]', sessionId);
    return Async.runSync((done) => {
      try {
        databasesBySessionId[sessionId].collections((err, collections) => {
          keepDroppingCollections(collections, 0, done);
        });
      } catch (ex) {
        LOGGER.error('[dropAllCollections]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  createCollection(collectionName, options, sessionId) {
    LOGGER.info('[createCollection]', collectionName, sessionId, JSON.stringify(options));

    return Async.runSync((done) => {
      try {
        databasesBySessionId[sessionId].createCollection(collectionName, options, (err) => {
          done(err, null);
        });
      } catch (ex) {
        LOGGER.error('[createCollection]', sessionId, ex);
        done(new Meteor.Error(ex.message), null);
      }
    });
  },

  clearShell(sessionId) {
    LOGGER.info('[clearShell]', sessionId);
    ShellCommands.remove({ sessionId });
  },

  executeShellCommand(command, connectionId, username, password, sessionId) {
    LOGGER.info('[shellCommand]', sessionId, command, connectionId);
    if (!spawnedShellsBySessionId[sessionId]) connectToShell(connectionId, username, password, sessionId);
    if (spawnedShellsBySessionId[sessionId]) spawnedShellsBySessionId[sessionId].stdin.write(`${command}\n`);
  },

  connectToShell(connectionId, username, password, sessionId) {
    return connectToShell(connectionId, username, password, sessionId);
  },

  analyzeSchema(connectionId, username, password, collection, sessionId) {
    const connectionUrl = Helper.getConnectionUrl(Connections.findOne({ _id: connectionId }), true, username, password, true);
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
