/**
 * Created by RSercan on 5.3.2016.
 */

Meteor.methods({
    'listCollectionNames': function (dbName) {
        LOGGER.info('[listCollectionNames]', dbName);

        return Async.runSync(function (done) {
            try {
                var wishedDB = database.db(dbName);
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

    'getDatabases': function () {
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

    'disconnect': function () {
        database.close();
    },

    'connect': function (connectionId) {
        var connection = Connections.findOne({_id: connectionId});
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions(connection);

        LOGGER.info('[connect]', connectionUrl, clearConnectionOptionsForLog(connectionOptions));

        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;
        return Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError || db == null || db == undefined) {
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
                    if (database) {
                        database.close();
                    }
                }
            });
        });
    },

    'dropDB': function () {
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

    'dropCollection': function (collectionName) {
        LOGGER.info('[dropCollection]', collectionName);

        return Async.runSync(function (done) {
            try {
                var collection = database.collection(collectionName);
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

    'dropAllCollections': function () {

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

    'createCollection': function (collectionName, options) {
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
