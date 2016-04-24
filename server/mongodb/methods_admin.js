/**
 * Created by RSercan on 10.1.2016.
 */
Meteor.methods({
    'dbStats': function (connection) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();

        var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;
        LOGGER.info('[stats]', connectionUrl, connectionOptions);

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
                    db.stats(function (err, docs) {
                        done(err, docs);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    LOGGER.error('[stats]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    },

    'validateCollection': function (connection, collectionName, options, convertIds, convertDates) {
        var methodArray = [
            {
                "validateCollection": [collectionName, options]
            }
        ];
        return proceedQueryExecution(connection, methodArray, convertIds, convertDates, true);
    },

    'setProfilingLevel': function (connection, level) {
        var methodArray = [
            {
                "setProfilingLevel": [level]
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'serverStatus': function (connection) {
        var methodArray = [
            {
                "serverStatus": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'serverInfo': function (connection) {
        var methodArray = [
            {
                "serverInfo": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'replSetGetStatus': function (connection) {
        var methodArray = [
            {
                "replSetGetStatus": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'removeUser': function (connection, username, runOnAdminDB) {
        var methodArray = [
            {
                "removeUser": [username]
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, runOnAdminDB);
    },

    'profilingInfo': function (connection) {
        var methodArray = [
            {
                "profilingInfo": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'ping': function (connection) {
        var methodArray = [
            {
                "ping": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'listDatabases': function (connection) {
        var methodArray = [
            {
                "listDatabases": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    },

    'command': function (connection, command, convertIds, convertDates, runOnAdminDB) {
        var methodArray = [
            {
                "command": [command]
            }
        ];
        return proceedQueryExecution(connection, methodArray, convertIds, convertDates, runOnAdminDB);
    },

    'addUser': function (connection, username, password, options, runOnAdminDB) {
        var methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, runOnAdminDB);
    },

    'buildInfo': function (connection) {
        var methodArray = [
            {
                "buildInfo": []
            }
        ];
        return proceedQueryExecution(connection, methodArray, false, false, true);
    }
});


var proceedQueryExecution = function (connection, methodArray, convertIds, convertDates, runOnAdminDB) {
    var connectionUrl = getConnectionUrl(connection);
    var connectionOptions = getConnectionOptions();

    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    LOGGER.info(methodArray, convertIds, convertDates, runOnAdminDB, connectionUrl, connectionOptions);

    var convertObjectId = true;
    var convertIsoDates = true;

    if (convertIds !== undefined && !convertIds) {
        convertObjectId = false;
    }

    if (convertDates !== undefined && !convertDates) {
        convertIsoDates = false;
    }

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
                var execution = runOnAdminDB ? db.admin() : db;
                if (connection.user && connection.password) {
                    execution.authenticate(connection.user, connection.password, function (authError) {
                        if (authError) {
                            done(authError, null);
                            if (db) {
                                db.close();
                            }
                            return;
                        }

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
                    });
                }
                else {
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