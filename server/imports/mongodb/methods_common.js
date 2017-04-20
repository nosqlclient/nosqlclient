/**
 * Created by RSercan on 5.3.2016.
 */
/*global Async*/
/*global moment*/
import {Meteor} from "meteor/meteor";
import {Settings} from "/lib/imports/collections/settings";
import {Connections} from "/lib/imports/collections/connections";
import ShellCommands from "/lib/imports/collections/shell";
import SchemaAnaylzeResult from "/lib/imports/collections/schema_analyze_result";
import LOGGER from "../internal/logger";
import Helper from "./helper";


const mongodbApi = require('mongodb');
const tunnelSsh = new require('tunnel-ssh');
const fs = require('fs');
const spawn = require('cross-spawn');
const os = require('os');

export let database;
let spawnedShell;
let tunnel;

const connectToShell = function (connectionId) {
    try {
        const connection = Connections.findOne({_id: connectionId});
        if (!spawnedShell) {
            const connectionUrl = Helper.getConnectionUrl(connection);
            const mongoPath = getProperMongo();

            LOGGER.info('[shell]', mongoPath, connectionUrl);
            spawnedShell = spawn(mongoPath, [connectionUrl]);
            setEventsToShell(connectionId);
        }

        if (spawnedShell) {
            LOGGER.info('[shell]', 'executing command "use ' + connection.databaseName + '" on shell');
            spawnedShell.stdin.write('use ' + connection.databaseName + '\n');
        }
        else {
            return {err: new Meteor.Error("Couldn't spawn shell !"), result: null};
        }
    }
    catch (ex) {
        spawnedShell = null;
        LOGGER.error('[shell]', ex);
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

const proceedConnectingMongodb = function (dbName, connectionUrl, connectionOptions, done) {
    if (!connectionOptions) {
        connectionOptions = {};
    }

    mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
        try {
            if (mainError || !db) {
                LOGGER.error(mainError, db);
                done(mainError, db);
                if (db) db.close();
                if (tunnel) {
                    tunnel.close();
                    tunnel = null;
                }
                return;
            }
            database = db.db(dbName);
            database.listCollections().toArray(function (err, collections) {
                done(err, collections);
            });
        }
        catch (ex) {
            LOGGER.error('[connect]', ex);
            done(new Meteor.Error(ex.message), null);
            if (db) db.close();
            if (tunnel) {
                tunnel.close();
                tunnel = null;
            }
        }
    });
};

const setEventsToShell = function (connectionId) {
    LOGGER.info('[shell]', 'binding events to shell');

    spawnedShell.on('error', Meteor.bindEnvironment(function (err) {
        LOGGER.error('unexpected error on spawned shell: ' + err);
        spawnedShell = null;
        if (err) {
            ShellCommands.insert({
                'date': Date.now(),
                'connectionId': connectionId,
                'message': 'unexpected error ' + err.message
            });
        }
    }));

    spawnedShell.stdout.on('data', Meteor.bindEnvironment(function (data) {
        if (data && data.toString()) {
            ShellCommands.insert({
                'date': Date.now(),
                'connectionId': connectionId,
                'message': data.toString()
            });
        }
    }));

    spawnedShell.stderr.on('data', Meteor.bindEnvironment(function (data) {
        if (data && data.toString()) {
            ShellCommands.insert({
                'date': Date.now(),
                'connectionId': connectionId,
                'message': data.toString()
            });
        }
    }));

    spawnedShell.on('close', Meteor.bindEnvironment(function (code) {
        // show ended message in codemirror
        ShellCommands.insert({
            'date': Date.now(),
            'connectionId': connectionId,
            'message': 'shell closed ' + code.toString()
        });

        spawnedShell = null;
        Meteor.setTimeout(function () {
            // remove all for further
            ShellCommands.remove({});
        }, 500);
    }));
};

Meteor.methods({
    importMongoclient(file)  {
        LOGGER.info('[importMongoclient]', file);

        let result = Async.runSync(function (done) {
            try {
                fs.readFile(file, 'utf8', function (err, data) {
                    done(err, data);
                });
            } catch (ex) {
                LOGGER.error('[importMongoclient]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        if (result.err) {
            return result;
        }

        let mongoclientData = JSON.parse(result.result);
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

    listCollectionNames(dbName) {
        LOGGER.info('[listCollectionNames]', dbName);

        return Async.runSync(function (done) {
            try {
                const wishedDB = database.db(dbName);
                wishedDB.listCollections().toArray(function (err, collections) {
                    done(err, collections);
                });
            }
            catch (ex) {
                LOGGER.error('[listCollectionNames]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

    },

    getDatabases() {
        LOGGER.info('[getDatabases]');

        return Async.runSync(function (done) {
            try {
                database.admin().listDatabases(function (err, dbs) {
                    if (dbs) {
                        done(err, dbs.databases);
                    }
                    else {
                        done(err, {});
                    }
                });
            }
            catch (ex) {
                LOGGER.error('[getDatabases]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    disconnect() {
        if (database) {
            database.close();
        }
        if (spawnedShell) {
            spawnedShell.stdin.end();
            spawnedShell = null;
        }
        ShellCommands.remove({});
        SchemaAnaylzeResult.remove({});
    },

    connect(connectionId) {
        const connection = Connections.findOne({_id: connectionId});
        const connectionUrl = Helper.getConnectionUrl(connection);
        const connectionOptions = Helper.getConnectionOptions(connection);

        LOGGER.info('[connect]', connectionUrl, Helper.clearConnectionOptionsForLog(connectionOptions));

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

                    LOGGER.info('[connect]', '[ssh]', 'ssh is enabled, config is ' + JSON.stringify(config));
                    tunnel = tunnelSsh(config, Meteor.bindEnvironment(function (error) {
                        if (error) {
                            done(new Meteor.Error(error.message), null);
                            return;
                        }
                        proceedConnectingMongodb(connection.databaseName, connectionUrl, connectionOptions, done);
                        spawnedShell = spawn(getProperMongo(), [connectionUrl]);
                        setEventsToShell(connectionId);
                    }));

                    tunnel.on('error', function (err) {
                        if (err) done(new Meteor.Error(err.message), null);
                        if (tunnel) {
                            tunnel.close();
                            tunnel = null;
                        }
                    });
                }
                else {
                    proceedConnectingMongodb(connection.databaseName, connectionUrl, connectionOptions, done);
                }
            }
            catch (ex) {
                LOGGER.error('[connect]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    dropDB() {
        LOGGER.info('[dropDatabase]');

        return Async.runSync(function (done) {
            try {
                database.dropDatabase(function (err, result) {
                    done(err, result);
                });
            }
            catch (ex) {
                LOGGER.error('[dropDatabase]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    dropCollection(collectionName) {
        LOGGER.info('[dropCollection]', collectionName);

        return Async.runSync(function (done) {
            try {
                const collection = database.collection(collectionName);
                collection.drop(function (dropError) {
                    done(dropError, null);
                });
            }
            catch (ex) {
                LOGGER.error('[dropCollection]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    dropAllCollections() {
        return Async.runSync(function (done) {
            try {
                database.collections(function (err, collections) {
                    keepDroppingCollections(collections, 0, done);
                });
            }
            catch (ex) {
                LOGGER.error('[dropAllCollections]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    createCollection(collectionName, options) {
        LOGGER.info('[createCollection]', collectionName, JSON.stringify(options));

        return Async.runSync(function (done) {
            try {
                database.createCollection(collectionName, options, function (err) {
                    done(err, null);
                });
            }
            catch (ex) {
                LOGGER.error('[createCollection]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    clearShell(){
        LOGGER.info('[clearShell]');
        ShellCommands.remove({});
    },

    executeShellCommand(command, connectionId){
        LOGGER.info('[shellCommand]', command, connectionId);
        if (!spawnedShell) connectToShell(connectionId);
        if (spawnedShell) spawnedShell.stdin.write(command + '\n');
    },

    connectToShell(connectionId){
        connectToShell(connectionId);
    },

    analyzeSchema(connectionId, collection){
        const connectionUrl = Helper.getConnectionUrl(Connections.findOne({_id: connectionId}), true);
        const mongoPath = getProperMongo();

        let args = [connectionUrl, '--quiet', '--eval', 'var collection =\"' + collection + '\", outputFormat=\"json\"', getMongoExternalsPath() + '/variety/variety.js_'];

        LOGGER.info('[analyzeSchema]', args, collection);
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
                        'connectionId': connectionId,
                        'message': data.toString()
                    });
                }
            }));

            spawned.on('close', Meteor.bindEnvironment(function () {
                SchemaAnaylzeResult.insert({
                    'date': Date.now(),
                    'connectionId': connectionId,
                    'message': message
                });
            }));

            spawned.stdin.end();
        }
        catch (ex) {
            LOGGER.error('[analyzeSchema]', ex);
            return {err: new Meteor.Error(ex.message), result: null};
        }

    }
});