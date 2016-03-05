/**
 * Created by RSercan on 5.3.2016.
 */
Meteor.methods({
    'connect': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();

        LOGGER.info('[connect]', connectionUrl, connectionOptions);

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
                    db.listCollections().toArray(function (err, collections) {
                        db.close();
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
        });
    },

    'dropDB': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        LOGGER.info('[dropDatabase]', connectionUrl, connectionOptions);

        return Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    db.dropDatabase(function (err, result) {
                        db.close();
                        done(err, result);
                    });
                }
                catch (ex) {
                    LOGGER.error('[dropDatabase]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });
    },

    'dropCollection': function (connection, collectionName) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        LOGGER.info('[dropCollection]', connectionUrl, connectionOptions, collectionName);

        return Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var collection = db.collection(collectionName);
                    collection.drop(function (dropError) {
                        done(dropError, null);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    LOGGER.error('[dropCollection]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });
    },

    'dropAllCollections': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        LOGGER.info('[dropAllCollections]', connectionUrl, connectionOptions);

        return Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    db.collections(function (err, collections) {
                        collections.forEach(function (collection) {
                            if (!collection.collectionName.startsWith('system')) {
                                collection.drop(function (dropError) {
                                });
                            }
                        });

                        // TODO drop takes some time it should be synced
                        //if (db) {
                        //    db.close();
                        //}
                        done(err, {});
                    });
                }
                catch (ex) {
                    LOGGER.error('[dropAllCollections]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });
    },

    'createCollection': function (connection, collectionName, options) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        LOGGER.info('[createCollection]', connectionUrl, connectionOptions, collectionName, options);
        return Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    db.createCollection(collectionName, options, function (err, result) {
                        done(err, result);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    LOGGER.error('[createCollection]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });
    }
});