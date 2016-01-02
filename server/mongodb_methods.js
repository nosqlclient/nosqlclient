/**
 * Created by RSercan on 27.12.2015.
 */
Meteor.methods({
    'connect': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        console.log('connecting to : ' + connectionUrl);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        return Async.runSync(function (done) {
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
    },

    'findOne': function (connection, selectedCollection, selector, cursorOptions) {
        return proceedFindQuery(connection, selectedCollection, selector, cursorOptions, true);
    },

    'find': function (connection, selectedCollection, selector, cursorOptions) {
        return proceedFindQuery(connection, selectedCollection, selector, cursorOptions);
    },

    'findOneAndUpdate': function (connection, selectedCollection, selector, setObject, options) {
        return proceedFindOneAndModifyQuery(connection, selectedCollection, selector, setObject, options, 'Update');
    },

    'findOneAndReplace': function (connection, selectedCollection, selector, setObject, options) {
        return proceedFindOneAndModifyQuery(connection, selectedCollection, selector, setObject, options, 'Replace');
    },

    'findOneAndDelete': function (connection, selectedCollection, selector, options) {
        return proceedFindOneAndModifyQuery(connection, selectedCollection, selector, null, options, 'Delete');
    },

    'count': function (connection, selectedCollection, selector) {
        var connectionUrl = getConnectionUrl(connection);
        console.log('executing count query ' + JSON.stringify(selector) + ' on: ' + connectionUrl + '/' + selectedCollection);

        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        convertJSONtoBSON(selector);

        var result = Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                try {
                    db.collection(selectedCollection).count(selector, function (err, count) {
                        done(err, count);
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

        convertBSONtoJSON(result);
        return result;
    },

    'dropDB': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

        return Async.runSync(function (done) {
            mongodbApi.connect(connectionUrl, function (err, db) {
                db.dropDatabase(function (err, result) {
                    db.close();
                    done(err, result);
                });
            });
        });
    }
});

var proceedFindOneAndModifyQuery = function (connection, selectedCollection, selector, setObject, options, methodNameExtension) {
    var connectionUrl = getConnectionUrl(connection);
    console.log('executing findOneAnd' + methodNameExtension + ' query ' + JSON.stringify(selector) + ' with set: ' + JSON.stringify(setObject) + ' with options: '
        + JSON.stringify(options) + ' on: ' + connectionUrl + '/' + selectedCollection);

    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    convertJSONtoBSON(selector);
    convertJSONtoBSON(setObject);
    convertJSONtoBSON(options);

    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, function (err, db) {
            try {
                if (methodNameExtension == 'Delete') {
                    db.collection(selectedCollection)['findOneAndDelete'](selector, options, function (err, doc) {
                        done(err, doc);
                        db.close();
                    });
                }
                else {
                    db.collection(selectedCollection)['findOneAnd' + methodNameExtension](selector, setObject, options, function (err, doc) {
                        done(err, doc);
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
};

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
};