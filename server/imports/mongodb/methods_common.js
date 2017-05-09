/**
 * Created by RSercan on 5.3.2016.
 */
/*global Async*/
/*global moment*/
import {Meteor} from "meteor/meteor";
import {Settings} from "/lib/imports/collections/settings";
import {Connections} from "/lib/imports/collections/connections";
import {migrateConnectionsIfExist} from "/server/imports/internal/startup";
import ShellCommands from "/lib/imports/collections/shell";
import SchemaAnaylzeResult from "/lib/imports/collections/schema_analyze_result";
import LOGGER from "../internal/logger";
import Helper from "./helper";


const mongodbApi = require('mongodb');
const tunnelSsh = new require('tunnel-ssh');
const fs = require('fs');
const spawn = require('cross-spawn');
const os = require('os');

export let databasesBySessionId = {};
let spawnedShellsBySessionId = {};
let tunnelsBySessionId = {};

const connectToShell = function (connectionId, sessionId) {
    try {
        const connection = Connections.findOne({_id: connectionId});
        if (!spawnedShellsBySessionId[sessionId]) {
            const connectionUrl = Helper.getConnectionUrl(connection);
            const mongoPath = getProperMongo();

            LOGGER.info('[shell]', mongoPath, connectionUrl, sessionId);
            spawnedShellsBySessionId[sessionId] = spawn(mongoPath, [connectionUrl]);
            setEventsToShell(connectionId, sessionId);
        }

        if (spawnedShellsBySessionId[sessionId]) {
            LOGGER.info('[shell]', 'executing command "use ' + connection.databaseName + '" on shell', sessionId);
            spawnedShellsBySessionId[sessionId].stdin.write('use ' + connection.databaseName + '\n');
        }
        else {
            return {err: new Meteor.Error("Couldn't spawn shell, please check logs !"), result: null};
        }
    }
    catch (ex) {
        spawnedShellsBySessionId[sessionId] = null;
        LOGGER.error('[shell]', sessionId, ex);
        return {err: new Meteor.Error(ex.message), result: null};
    }
};

const keepDroppingCollections = function (collections, i, done) {
    if (collections.length === 0 || i >= collections.length) {
        done(null, {});
        return;
    }

    if (!collections[i].collectionName.startsWith('system')) {
        collections[i].drop().then(function () {
            keepDroppingCollections(collections, ++i, done);
        });
    }
    else {
        keepDroppingCollections(collections, ++i, done);
    }
};

const getMongoExternalsPath = function () {
    let currentDir = process.cwd().replace(/\\/g, '/');
    currentDir = currentDir.substring(0, currentDir.lastIndexOf("/")) + '/web.browser/app/mongo/';

    // make sure everything has correct permissions
    fs.chmodSync(currentDir, '777');
    fs.chmodSync(currentDir + "darwin/mongo", '777');
    fs.chmodSync(currentDir + "win32/mongo.exe", '777');
    fs.chmodSync(currentDir + "linux/mongo", '777');
    fs.chmodSync(currentDir + "variety/variety.js_", '777');

    return currentDir;
};

const getProperMongo = function () {
    let currentDir = getMongoExternalsPath();
    if (fs.existsSync(currentDir + "user_mongo")) {
        LOGGER.info('[userMongo]', 'found a mongo binary set by user, choosing it');
        return currentDir + "user_mongo";
    }
    switch (os.platform()) {
        case 'darwin':
            return currentDir + 'darwin/mongo';
        case 'win32':
            return currentDir + 'win32/mongo.exe';
        case 'linux':
            return currentDir + 'linux/mongo';
        default :
            throw 'Not supported os: ' + os.platform();
    }
};

const proceedConnectingMongodb = function (dbName, sessionId, connectionUrl, connectionOptions, done) {
    if (!connectionOptions) {
        connectionOptions = {};
    }

    mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
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
            databasesBySessionId[sessionId].listCollections().toArray(function (err, collections) {
                done(err, collections);
            });

            LOGGER.info('[connect]', 'current sesssion length: ' + Object.keys(databasesBySessionId).length);
        }
        catch (ex) {
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

const setEventsToShell = function (connectionId, sessionId) {
    LOGGER.info('[shell]', 'binding events to shell', connectionId, sessionId);

    spawnedShellsBySessionId[sessionId].on('error', Meteor.bindEnvironment(function (err) {
        LOGGER.error('unexpected error on spawned shell: ' + err, sessionId);
        spawnedShellsBySessionId[sessionId] = null;
        if (err) {
            ShellCommands.insert({
                'date': Date.now(),
                'sessionId': sessionId,
                'connectionId': connectionId,
                'message': 'unexpected error ' + err.message
            });
        }
    }));

    spawnedShellsBySessionId[sessionId].stdout.on('data', Meteor.bindEnvironment(function (data) {
        if (data && data.toString()) {
            ShellCommands.insert({
                'date': Date.now(),
                'sessionId': sessionId,
                'connectionId': connectionId,
                'message': data.toString()
            });
        }
    }));

    spawnedShellsBySessionId[sessionId].stderr.on('data', Meteor.bindEnvironment(function (data) {
        if (data && data.toString()) {
            ShellCommands.insert({
                'date': Date.now(),
                'sessionId': sessionId,
                'connectionId': connectionId,
                'message': data.toString()
            });
        }
    }));

    spawnedShellsBySessionId[sessionId].on('close', Meteor.bindEnvironment(function (code) {
        // show ended message in codemirror
        ShellCommands.insert({
            'date': Date.now(),
            'connectionId': connectionId,
            'sessionId': sessionId,
            'message': 'shell closed ' + code.toString()
        });

        spawnedShellsBySessionId[sessionId] = null;
        Meteor.setTimeout(function () {
            // remove all for further
            ShellCommands.remove({'sessionId': sessionId});
        }, 500);
    }));
};

Meteor.methods({
    importMongoclient(file)  {
        LOGGER.info('[importMongoclient]', file);

        try {
            let mongoclientData = JSON.parse(file);
            if (mongoclientData.settings) {
                Settings.remove({});
                delete mongoclientData.settings._id;
                Settings.insert(mongoclientData.settings);
            }

            if (mongoclientData.connections) {
                for (let i = 0; i < mongoclientData.connections.length; i++) {
                    delete mongoclientData.connections[i]._id;
                    Connections._collection.insert(mongoclientData.connections[i]);
                }
                migrateConnectionsIfExist();
            }
        }
        catch (ex) {
            LOGGER.error('[importMongoclient]', 'unexpected error during import', ex);
            throw new Meteor.Error(ex.message);
        }
    },

    exportMongoclient(dir) {
        let filePath = dir + "/backup_" + moment().format('DD_MM_YYYY_HH_mm_ss') + ".json";
        let fileContent = {};
        fileContent.settings = Settings.findOne();
        fileContent.connections = Connections.find().fetch();

        LOGGER.info('[exportMongoclient]', filePath);

        return Async.runSync(function (done) {
            try {
                fs.writeFile(filePath, JSON.stringify(fileContent), function (err) {
                    done(err, filePath);
                });
            } catch (ex) {
                LOGGER.error('[exportMongoclient]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    listCollectionNames(dbName, sessionId) {
        LOGGER.info('[listCollectionNames]', dbName, sessionId);

        return Async.runSync(function (done) {
            try {
                const wishedDB = databasesBySessionId[sessionId].db(dbName);
                wishedDB.listCollections().toArray(function (err, collections) {
                    done(err, collections);
                });
            }
            catch (ex) {
                LOGGER.error('[listCollectionNames]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

    },

    getDatabases(sessionId) {
        LOGGER.info('[getDatabases]', sessionId);

        return Async.runSync(function (done) {
            try {
                databasesBySessionId[sessionId].admin().listDatabases(function (err, dbs) {
                    if (dbs) {
                        done(err, dbs.databases);
                    }
                    else {
                        done(err, {});
                    }
                });
            }
            catch (ex) {
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
        ShellCommands.remove({'sessionId': sessionId});
        SchemaAnaylzeResult.remove({});
    },

    connect(connectionId, sessionId) {
        const connection = Connections.findOne({_id: connectionId});
        const connectionUrl = Helper.getConnectionUrl(connection);
        const connectionOptions = Helper.getConnectionOptions(connection);

        LOGGER.info('[connect]', connectionUrl, Helper.clearConnectionOptionsForLog(connectionOptions), sessionId);

        return Async.runSync(function (done) {
            try {
                if (connection.ssh && connection.ssh.enabled) {
                    let config = {
                        dstPort: connection.ssh.destinationPort,
                        localPort: connection.ssh.localPort ? connection.ssh.localPort : connection.servers[0].port,
                        host: connection.ssh.host,
                        port: connection.ssh.port,
                        username: connection.ssh.username
                    };

                    if (connection.ssh.certificateFile) config.privateKey = new Buffer(connection.ssh.certificateFile);
                    if (connection.ssh.passPhrase) config.passphrase = connection.ssh.passPhrase;
                    if (connection.ssh.password) config.password = connection.ssh.password;

                    LOGGER.info('[connect]', '[ssh]', sessionId, 'ssh is enabled, config is ' + JSON.stringify(config));
                    tunnelsBySessionId[sessionId] = tunnelSsh(config, Meteor.bindEnvironment(function (error) {
                        if (error) {
                            done(new Meteor.Error(error.message), null);
                            return;
                        }
                        proceedConnectingMongodb(connection.databaseName, sessionId, connectionUrl, connectionOptions, done);
                        spawnedShellsBySessionId[sessionId] = spawn(getProperMongo(), [connectionUrl]);
                        setEventsToShell(connectionId, sessionId);
                    }));

                    tunnelsBySessionId[sessionId].on('error', function (err) {
                        if (err) done(new Meteor.Error(err.message), null);
                        if (tunnelsBySessionId[sessionId]) {
                            tunnelsBySessionId[sessionId].close();
                            tunnelsBySessionId[sessionId] = null;
                        }
                    });
                }
                else {
                    proceedConnectingMongodb(connection.databaseName, sessionId, connectionUrl, connectionOptions, done);
                }
            }
            catch (ex) {
                LOGGER.error('[connect]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    dropDB(sessionId) {
        LOGGER.info('[dropDatabase]', sessionId);

        return Async.runSync(function (done) {
            try {
                databasesBySessionId[sessionId].dropDatabase(function (err, result) {
                    done(err, result);
                });
            }
            catch (ex) {
                LOGGER.error('[dropDatabase]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    dropCollection(collectionName, sessionId) {
        LOGGER.info('[dropCollection]', sessionId, collectionName);

        return Async.runSync(function (done) {
            try {
                const collection = databasesBySessionId[sessionId].collection(collectionName);
                collection.drop(function (dropError) {
                    done(dropError, null);
                });
            }
            catch (ex) {
                LOGGER.error('[dropCollection]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    dropAllCollections(sessionId) {
        LOGGER.info('[dropAllCollections]', sessionId);
        return Async.runSync(function (done) {
            try {
                databasesBySessionId[sessionId].collections(function (err, collections) {
                    keepDroppingCollections(collections, 0, done);
                });
            }
            catch (ex) {
                LOGGER.error('[dropAllCollections]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    createCollection(collectionName, options, sessionId) {
        LOGGER.info('[createCollection]', collectionName, sessionId, JSON.stringify(options));

        return Async.runSync(function (done) {
            try {
                databasesBySessionId[sessionId].createCollection(collectionName, options, function (err) {
                    done(err, null);
                });
            }
            catch (ex) {
                LOGGER.error('[createCollection]', sessionId, ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    clearShell(sessionId){
        LOGGER.info('[clearShell]', sessionId);
        ShellCommands.remove({'sessionId': sessionId});
    },

    executeShellCommand(command, connectionId, sessionId){
        LOGGER.info('[shellCommand]', sessionId, command, connectionId);
        if (!spawnedShellsBySessionId[sessionId]) connectToShell(connectionId, sessionId);
        if (spawnedShellsBySessionId[sessionId]) spawnedShellsBySessionId[sessionId].stdin.write(command + '\n');
    },

    connectToShell(connectionId, sessionId){
        connectToShell(connectionId, sessionId);
    },

    analyzeSchema(connectionId, collection, sessionId){
        const connectionUrl = Helper.getConnectionUrl(Connections.findOne({_id: connectionId}), true);
        const mongoPath = getProperMongo();

        let args = [connectionUrl, '--quiet', '--eval', 'var collection =\"' + collection + '\", outputFormat=\"json\"', getMongoExternalsPath() + '/variety/variety.js_'];

        LOGGER.info('[analyzeSchema]', sessionId, args, collection);
        try {
            let spawned = spawn(mongoPath, args);
            let message = "";
            spawned.stdout.on('data', Meteor.bindEnvironment(function (data) {
                if (data.toString()) {
                    message += data.toString();
                }
            }));

            spawned.stderr.on('data', Meteor.bindEnvironment(function (data) {
                if (data.toString()) {
                    SchemaAnaylzeResult.insert({
                        'date': Date.now(),
                        'sessionId': sessionId,
                        'connectionId': connectionId,
                        'message': data.toString()
                    });
                }
            }));

            spawned.on('close', Meteor.bindEnvironment(function () {
                SchemaAnaylzeResult.insert({
                    'date': Date.now(),
                    'sessionId': sessionId,
                    'connectionId': connectionId,
                    'message': message
                });
            }));

            spawned.stdin.end();
        }
        catch (ex) {
            LOGGER.error('[analyzeSchema]', sessionId, ex);
            return {err: new Meteor.Error(ex.message), result: null};
        }

    }
});