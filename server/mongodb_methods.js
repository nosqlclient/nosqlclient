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

    'updateOne': function (connection, selectedCollection, selector, setObject, options) {
        var methodArray = [
            {
                "updateOne": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'updateMany': function (connection, selectedCollection, selector, setObject, options) {
        var methodArray = [
            {
                "updateMany": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'stats': function (connection, selectedCollection, options) {
        var methodArray = [
            {
                "stats": [options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'rename': function (connection, selectedCollection, newName, options) {
        var methodArray = [
            {
                "rename": [newName, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'reIndex': function (connection, selectedCollection) {
        var methodArray = [
            {
                "reIndex": []
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'options': function (connection, selectedCollection) {
        var methodArray = [
            {
                "options": []
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'mapReduce': function (connection, selectedCollection, map, reduce, options) {
        return proceedMapReduceExecution(connection, selectedCollection, map, reduce, options);
    },

    'isCapped': function (connection, selectedCollection) {
        var methodArray = [
            {
                "isCapped": []
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'insertMany': function (connection, selectedCollection, docs) {
        var methodArray = [
            {
                "insertMany": [docs]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'indexInformation': function (connection, selectedCollection, isFull) {
        var methodArray = [
            {
                "indexInformation": [{'full': isFull}]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'geoNear': function (connection, selectedCollection, xAxis, yAxis, options) {
        var methodArray = [
            {
                "geoNear": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'geoHaystackSearch': function (connection, selectedCollection, xAxis, yAxis, options) {
        var methodArray = [
            {
                "geoHaystackSearch": [xAxis, yAxis, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'dropIndex': function (connection, selectedCollection, indexName) {
        var methodArray = [
            {
                "dropIndex": [indexName]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'distinct': function (connection, selectedCollection, selector, fieldName) {
        var methodArray = [
            {
                "distinct": [fieldName, selector]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'delete': function (connection, selectedCollection, selector) {
        var methodArray = [
            {
                "deleteMany": [selector]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'createIndex': function (connection, selectedCollection, fields, options) {
        var methodArray = [
            {
                "createIndex": [fields, options]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'findOne': function (connection, selectedCollection, selector, cursorOptions) {
        var methodArray = [
            {
                "find": [selector]
            }
        ];
        for (var key in cursorOptions) {
            if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                var obj = {};
                obj[key] = [cursorOptions[key]];
                methodArray.push(obj);
            }
        }
        methodArray.push({'limit': [1]});
        methodArray.push({'next': []});
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'find': function (connection, selectedCollection, selector, cursorOptions) {
        var methodArray = [
            {
                "find": [selector]
            }
        ];
        for (var key in cursorOptions) {
            if (cursorOptions.hasOwnProperty(key) && cursorOptions[key]) {
                var obj = {};
                obj[key] = [cursorOptions[key]];
                methodArray.push(obj);
            }
        }
        methodArray.push({'toArray': []});
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'findOneAndUpdate': function (connection, selectedCollection, selector, setObject, options) {
        var methodArray = [
            {
                "findOneAndUpdate": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'findOneAndReplace': function (connection, selectedCollection, selector, setObject, options) {
        var methodArray = [
            {
                "findOneAndReplace": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'findOneAndDelete': function (connection, selectedCollection, selector, options) {
        var methodArray = [
            {
                "findOneAndDelete": [selector, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'aggregate': function (connection, selectedCollection, pipeline) {
        var methodArray = [
            {
                "aggregate": [pipeline]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'count': function (connection, selectedCollection, selector) {
        var methodArray = [
            {
                "count": [selector]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray);
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

var proceedMapReduceExecution = function (connection, selectedCollection, map, reduce, options) {
    var connectionUrl = getConnectionUrl(connection);
    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    convertJSONtoBSON(options);

    console.log('Connection: ' + connectionUrl + '/' + selectedCollection + ', Map: ' + map + ', Reduce: ' + reduce + ',Options: ' + JSON.stringify(options));
    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, function (mainError, db) {
            if (mainError) {
                done(mainError, null);
                if (db) {
                    db.close();
                }
                return;
            }
            try {
                var collection = db.collection(selectedCollection);
                collection.mapReduce(map, reduce, options, function (err, resultCollection) {
                    if (err) {
                        done(err, null);
                        if (db) {
                            db.close();
                        }
                        return;
                    }
                    resultCollection.find().toArray(function (err, result) {
                        done(err, result);
                        if (db) {
                            db.close();
                        }
                    });
                });
            }
            catch (ex) {
                done(new Meteor.Error(ex.message), null);
                if (db) {
                    db.close();
                }
            }
        });
    });

    convertBSONtoJSON(result);
    return result;
};

var proceedQueryExecution = function (connection, selectedCollection, methodArray) {
    var connectionUrl = getConnectionUrl(connection);
    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    console.log('[Collection Query]', 'Connection: ' + connectionUrl + '/' + selectedCollection + ', MethodArray: ' + JSON.stringify(methodArray));

    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, function (mainError, db) {
            if (mainError) {
                done(mainError, null);
                if (db) {
                    db.close();
                }
                return;
            }
            try {
                var execution = db.collection(selectedCollection);
                for (var i = 0; i < methodArray.length; i++) {
                    var last = i == (methodArray.length - 1);
                    var entry = methodArray[i];
                    convertJSONtoBSON(entry);

                    for (var key in entry) {
                        if (entry.hasOwnProperty(key)) {
                            if (last && key == Object.keys(entry)[Object.keys(entry).length - 1]) {
                                entry[key].push(function (err, docs) {
                                    done(err, docs);
                                    if (db) {
                                        db.close();
                                    }
                                });
                                execution[key].apply(execution, entry[key]);
                            }
                            else {
                                execution = execution[key].apply(execution, entry[key]);
                            }
                        }
                    }
                }
            }
            catch (ex) {
                done(new Meteor.Error(ex.message), null);
                if (db) {
                    db.close();
                }
            }
        });
    });

    convertBSONtoJSON(result);
    return result;
};