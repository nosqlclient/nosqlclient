/**
 * Created by RSercan on 5.3.2016.
 */

import {Meteor} from 'meteor/meteor';
import {Settings} from '/lib/imports/collections/settings';
import {Connections} from '/lib/imports/collections/connections';
import ShellCommands from '/lib/imports/collections/shell';
import SchemaAnaylzeResult from '/lib/imports/collections/schema_analyze_result';
import LOGGER from "../internal/logger";
import Helper from "./helper";

const mongodbApi = require('mongodb');
const tunnelSsh = new require('tunnel-ssh');
const fs = require('fs');
const spawn = require('cross-spawn');
const os = require('os');

export let database;
let spawnedShell;

const getProperMongo = function () {
    switch (os.platform()) {
        case 'darwin':
            return '../../../../../lib/mongo/darwin/mongo';
        case 'win32':
            return '../../../../../lib/mongo/win32/mongo.exe';
        case 'linux':
            return '../../../../../lib/mongo/linux/mongo';
        default :
            throw 'Not supported os: ' + os.platform();
    }
};

const proceedConnectingMongodb = function (connectionUrl, connectionOptions, done) {
    if (!connectionOptions) {
        connectionOptions = {};
    }

    connectionOptions.uri_decode_auth = true;

    mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
        if (mainError || db == null || db == undefined) {
            LOGGER.error(mainError, db);
            done(mainError, db);
            if (db) {
                db.close();
            }
            return;
        }
        try {
            database = db;
            database.listCollections().toArray(function (err, collections) {
                done(err, collections);
            });
        }
        catch (ex) {
            LOGGER.error('[connect]', ex);
            done(new Meteor.Error(ex.message), null);
            if (db) {
                db.close();
            }
        }
    });
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
            if (connection.sshAddress) {
                let config = {
                    dstPort: connection.port,
                    host: connection.sshAddress,
                    port: connection.sshPort,
                    username: connection.sshUser
                };

                if (connection.sshCertificate) {
                    config.privateKey = new Buffer(connection.sshCertificate);
                }

                if (connection.sshPassPhrase) {
                    config.passphrase = connection.sshPassPhrase;
                }

                if (connection.sshPassword) {
                    config.password = connection.sshPassword;
                }

                tunnelSsh(config, function (error) {
                    if (error) {
                        done(new Meteor.Error(error.message), null);
                        return;
                    }
                    proceedConnectingMongodb(connectionUrl, connectionOptions, done);
                });
            } else {
                proceedConnectingMongodb(connectionUrl, connectionOptions, done);
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
                    collections.forEach(function (collection) {
                        if (!collection.collectionName.startsWith('system')) {
                            collection.drop(function (dropError) {
                            });
                        }
                    });

                    done(err, {});
                });
            }
            catch (ex) {
                LOGGER.error('[dropAllCollections]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    },

    createCollection(collectionName, options) {
        LOGGER.info('[createCollection]', collectionName, options);

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

    closeShell(){
        LOGGER.info('[closeShell]');
        try {
            if (spawnedShell) {
                spawnedShell.stdin.end();
                spawnedShell = null;
            }
        }
        catch (ex) {
            LOGGER.error('[closeShell]', ex);
            return {err: new Meteor.Error(ex.message), result: null};
        }
    },

    executeShellCommand(command){
        LOGGER.info('[shellCommand]', command);
        if (!spawnedShell) {
            return {err: new Meteor.Error('Could not connect to shell !'), result: null};
        }

        spawnedShell.stdin.write(command + '\n');
    },

    connectToShell(connectionId){
        const connectionUrl = Helper.getConnectionUrl(Connections.findOne({_id: connectionId}));
        const mongoPath = getProperMongo();

        LOGGER.info('[shell]', mongoPath, connectionUrl);

        try {
            spawnedShell = spawn(mongoPath, [connectionUrl]);
            spawnedShell.stdout.on('data', Meteor.bindEnvironment(function (data) {
                if (data.toString()) {
                    ShellCommands.insert({
                        'date': Date.now(),
                        'connectionId': connectionId,
                        'message': data.toString()
                    });
                }
            }));

            spawnedShell.stderr.on('data', Meteor.bindEnvironment(function (data) {
                if (data.toString()) {
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

                // remove all for further
                ShellCommands.remove({});
            }));
        }
        catch (ex) {
            LOGGER.error('[shell]', ex);
            return {err: new Meteor.Error(ex.message), result: null};
        }
    },

    analyzeSchema(connectionId, collection){
        const connectionUrl = Helper.getConnectionUrl(Connections.findOne({_id: connectionId}));
        const mongoPath = getProperMongo();
        let args = [connectionUrl, '--quiet', '--eval', 'var collection =\"' + collection + '\", outputFormat=\"json\"', '../../../../../lib/mongo/variety/variety.js_'];

        LOGGER.info('[analyzeSchema]', args, connectionUrl, collection);
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
                    console.log(data.toString());
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
