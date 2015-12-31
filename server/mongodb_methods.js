/**
 * Created by RSercan on 27.12.2015.
 */
Meteor.methods({
    'connect': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        console.log('connecting to : ' + connectionUrl);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        var collectionNames = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                if (db == null || db == undefined) {
                    console.log('could not connect, db is null');
                    done(err, db);
                } else {
                    db.listCollections().toArray(function (err, collections) {
                        db.close();
                        done(err, collections);
                    });
                }
            });
        });

        return collectionNames;
    },

    'executeFindQuery': function (connection, selectedCollection, selector, cursorOptions) {
        var connectionUrl = getConnectionUrl(connection);
        console.log('executing find query on: ' + connectionUrl + '/' + selectedCollection);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        convertValidObjectIds(selector);
        convertValidDates(selector);

        var result = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                try {
                    var cursor = db.collection(selectedCollection).find(selector);

                    for (var key in cursorOptions) {
                        if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                            cursor = cursor[key](cursorOptions[key]);
                        }
                    }

                    cursor.toArray(function (err, docs) {
                        done(err, docs);
                        db.close();
                    });
                }
                catch (ex) {
                    console.error(ex);
                    done(ex, null);
                    db.close();
                }
            });
        });

        convertObjectIDsToString(result);
        convertDatesToString(result);

        return result;
    },

    'dropDB': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        var result = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                db.dropDatabase(function (err, result) {
                    db.close();
                    done(err, result);
                });
            });
        });

        return result;
    }
});