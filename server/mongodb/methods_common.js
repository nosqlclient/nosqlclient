/**
 * Created by RSercan on 5.3.2016.
 */

import LOGGER from "../internal/logging/logger";
import Helper from "./helper";

const mongodbApi = require('mongodb');
const tunnelSsh = new require('tunnel-ssh');
const fs = require('fs');

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
                    done(err, dbs.databases);
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
                database.createCollection(collectionName, options, function (err, result) {
                    done(err, null);
                });
            }
            catch (ex) {
                LOGGER.error('[createCollection]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });
    }
});

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

