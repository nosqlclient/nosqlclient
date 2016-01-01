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

    'findOne': function (connection, selectedCollection, selector, cursorOptions) {
        return proceedFindQuery(connection, selectedCollection, selector, cursorOptions, true);
    },

    'find': function (connection, selectedCollection, selector, cursorOptions) {
        return proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
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

var proceedFindQuery = function (connection, selectedCollection, selector, cursorOptions, one) {
    var connectionUrl = getConnectionUrl(connection);
    console.log('executing find ' + (one ? 'One' : '') + ' query ' + JSON.stringify(selector) + ' with cursor options: '
        + JSON.stringify(cursorOptions) + ' on: ' + connectionUrl + '/' + selectedCollection);

    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    convertJSONtoBSON(selector);
    convertJSONtoBSON(cursorOptions);

    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, function (err, db) {
            try {
                var cursor = db.collection(selectedCollection).find(selector);

                for (var key in cursorOptions) {
                    if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                        cursor = cursor[key](cursorOptions[key]);
                    }
                }
                if (one) {
                    cursor.limit(1).next(function (err, doc) {
                        done(err, doc);
                        db.close();
                    });
                } else {
                    cursor.toArray(function (err, docs) {
                        done(err, docs);
                        db.close();
                    });
                }
            }
            catch (ex) {
                console.error(ex);
                done(ex, null);
                db.close();
            }
        });
    });

    convertBSONtoJSON(result);
    return result;
}