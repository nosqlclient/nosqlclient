/**
 * Created by RSercan on 27.12.2015.
 */
Meteor.methods({
    'updateOne': function (connection, selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "updateOne": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'updateMany': function (connection, selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "updateMany": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
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

    'insertMany': function (connection, selectedCollection, docs, convertIds, convertDates) {
        var methodArray = [
            {
                "insertMany": [docs]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
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

    'distinct': function (connection, selectedCollection, selector, fieldName, convertIds, convertDates) {
        var methodArray = [
            {
                "distinct": [fieldName, selector]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'delete': function (connection, selectedCollection, selector, convertIds, convertDates) {
        var methodArray = [
            {
                "deleteMany": [selector]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'createIndex': function (connection, selectedCollection, fields, options) {
        var methodArray = [
            {
                "createIndex": [fields, options]
            }
        ];

        return proceedQueryExecution(connection, selectedCollection, methodArray);
    },

    'findOne': function (connection, selectedCollection, selector, cursorOptions, convertIds, convertDates) {
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
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'find': function (connection, selectedCollection, selector, cursorOptions, convertIds, convertDates) {
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

        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'findOneAndUpdate': function (connection, selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "findOneAndUpdate": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'findOneAndReplace': function (connection, selectedCollection, selector, setObject, options, convertIds, convertDates) {
        var methodArray = [
            {
                "findOneAndReplace": [selector, setObject, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'findOneAndDelete': function (connection, selectedCollection, selector, options, convertIds, convertIsoDates) {
        var methodArray = [
            {
                "findOneAndDelete": [selector, options]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertIsoDates);
    },

    'aggregate': function (connection, selectedCollection, pipeline, convertIds, convertDates) {
        var methodArray = [
            {
                "aggregate": [pipeline]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    },

    'count': function (connection, selectedCollection, selector, convertIds, convertDates) {
        var methodArray = [
            {
                "count": [selector]
            }
        ];
        return proceedQueryExecution(connection, selectedCollection, methodArray, convertIds, convertDates);
    }
});

var proceedMapReduceExecution = function (connection, selectedCollection, map, reduce, options) {
    var connectionUrl = getConnectionUrl(connection);
    var connectionOptions = getConnectionOptions();
    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    convertJSONtoBSON(options);

    LOGGER.info('[mapReduce]', connectionUrl, connectionOptions, selectedCollection, map, reduce, options);

    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
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
                    if ((typeof options.out) == 'string') {
                        resultCollection.find().toArray(function (err, result) {
                            done(err, result);
                        });
                    }
                    else {
                        done(err, resultCollection);
                    }
                    if (db) {
                        db.close();
                    }
                });
            }
            catch (ex) {
                LOGGER.error('[mapReduce]', ex);
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

var proceedQueryExecution = function (connection, selectedCollection, methodArray, convertIds, convertDates) {
    var connectionUrl = getConnectionUrl(connection);
    var connectionOptions = getConnectionOptions();
    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;
    var convertObjectId = true;
    var convertIsoDates = true;

    if (convertIds !== undefined && !convertIds) {
        convertObjectId = false;
    }

    if (convertDates !== undefined && !convertDates) {
        convertIsoDates = false;
    }

    LOGGER.info(methodArray, 'convertIds: ' + convertObjectId, 'convertDates: ' + convertIsoDates, connectionUrl, connectionOptions, selectedCollection);

    var result = Async.runSync(function (done) {
        mongodbApi.connect(connectionUrl, connectionOptions, function (mainError, db) {
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
                    convertJSONtoBSON(entry, convertObjectId, convertIsoDates);

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
                LOGGER.error(methodArray, ex);
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