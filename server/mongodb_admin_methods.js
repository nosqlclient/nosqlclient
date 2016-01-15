/**
 * Created by RSercan on 10.1.2016.
 */
Meteor.methods({
    'validateCollection': function (connection, collectionName, options) {
        var methodArray = [
            {
                "validateCollection": [collectionName, options]
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'setProfilingLevel': function (connection, level) {
        var methodArray = [
            {
                "setProfilingLevel": [level]
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'serverStatus': function (connection) {
        var methodArray = [
            {
                "serverStatus": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'serverInfo': function (connection) {
        var methodArray = [
            {
                "serverInfo": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'replSetGetStatus': function (connection) {
        var methodArray = [
            {
                "replSetGetStatus": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'removeUser': function (connection, username) {
        var methodArray = [
            {
                "removeUser": [username]
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'profilingInfo': function (connection) {
        var methodArray = [
            {
                "profilingInfo": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'ping': function (connection) {
        var methodArray = [
            {
                "ping": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'listDatabases': function (connection) {
        var methodArray = [
            {
                "listDatabases": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'command': function (connection, command) {
        var methodArray = [
            {
                "command": [command]
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'addUser': function (connection, username, password, options) {
        var methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    },

    'buildInfo': function (connection) {
        var methodArray = [
            {
                "buildInfo": []
            }
        ];
        return proceedQueryExecution(connection, methodArray);
    }
});


var proceedQueryExecution = function (connection, methodArray) {
    var connectionUrl = getConnectionUrl(connection);
    var connectionOptions = getConnectionOptions();

    var mongodbApi = Meteor.npmRequire('mongodb').MongoClient;

    console.log('[Admin Query]', 'Connection: ' + connectionUrl + ', ConnectionOptions: ' + JSON.stringify(connectionOptions) + ', MethodArray: ' + JSON.stringify(methodArray));

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
                var execution = db.admin();
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