/**
 * Created by RSercan on 10.1.2016.
 */
Meteor.methods({
    'dbStats': function () {
        LOGGER.info('[stats]');

        var result = Async.runSync(function (done) {
            try {
                database.stats(function (err, docs) {
                    done(err, docs);
                });
            }
            catch (ex) {
                LOGGER.error('[stats]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        convertBSONtoJSON(result);
        return result;
    },

    'validateCollection': function (collectionName, options, convertIds, convertDates) {
        var methodArray = [
            {
                "validateCollection": [collectionName, options]
            }
        ];
        return proceedQueryExecution(methodArray, convertIds, convertDates, true);
    },

    'setProfilingLevel': function (level) {
        var methodArray = [
            {
                "setProfilingLevel": [level]
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'serverStatus': function () {
        var methodArray = [
            {
                "serverStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'serverInfo': function () {
        var methodArray = [
            {
                "serverInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'replSetGetStatus': function () {
        var methodArray = [
            {
                "replSetGetStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'removeUser': function (username, runOnAdminDB) {
        var methodArray = [
            {
                "removeUser": [username]
            }
        ];
        return proceedQueryExecution(methodArray, false, false, runOnAdminDB);
    },

    'profilingInfo': function () {
        var methodArray = [
            {
                "profilingInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'ping': function () {
        var methodArray = [
            {
                "ping": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'listDatabases': function () {
        var methodArray = [
            {
                "listDatabases": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    'command': function (command, convertIds, convertDates, runOnAdminDB) {
        var methodArray = [
            {
                "command": [command]
            }
        ];
        return proceedQueryExecution(methodArray, convertIds, convertDates, runOnAdminDB);
    },

    'addUser': function (username, password, options, runOnAdminDB) {
        var methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(methodArray, false, false, runOnAdminDB);
    },

    'buildInfo': function () {
        var methodArray = [
            {
                "buildInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    }
});


var proceedQueryExecution = function (methodArray, convertIds, convertDates, runOnAdminDB) {
    LOGGER.info(methodArray, convertIds, convertDates, runOnAdminDB);

    var convertObjectId = true;
    var convertIsoDates = true;

    if (convertIds !== undefined && !convertIds) {
        convertObjectId = false;
    }

    if (convertDates !== undefined && !convertDates) {
        convertIsoDates = false;
    }

    var result = Async.runSync(function (done) {
        try {
            var execution = runOnAdminDB ? database.admin() : database;
            for (var i = 0; i < methodArray.length; i++) {
                var last = i == (methodArray.length - 1);
                var entry = methodArray[i];
                convertJSONtoBSON(entry, convertObjectId, convertIsoDates);

                for (var key in entry) {
                    if (entry.hasOwnProperty(key)) {
                        if (last && key == Object.keys(entry)[Object.keys(entry).length - 1]) {
                            entry[key].push(function (err, docs) {
                                done(err, docs);
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
        }
    });

    convertBSONtoJSON(result);
    return result;
};