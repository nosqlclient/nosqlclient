/**
 * Created by RSercan on 10.1.2016.
 */
/*global Async*/
import LOGGER from "../internal/logger";
import Helper from "./helper";
import {Meteor} from "meteor/meteor";
import {databasesBySessionId} from "./methods_common";


const proceedQueryExecution = function (methodArray, runOnAdminDB, sessionId) {
    LOGGER.info(JSON.stringify(methodArray), runOnAdminDB);

    let result = Async.runSync(function (done) {
        try {
            let execution = runOnAdminDB ? databasesBySessionId[sessionId].admin() : databasesBySessionId[sessionId];
            for (let i = 0; i < methodArray.length; i++) {
                let last = i == (methodArray.length - 1);
                let entry = methodArray[i];
                entry = Helper.convertJSONtoBSON(entry);

                for (let key in entry) {
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

    return Helper.convertBSONtoJSON(result);
};

Meteor.methods({
    top(sessionId){
        LOGGER.info('[top]');

        let result = Async.runSync(function (done) {
            try {
                databasesBySessionId[sessionId].executeDbAdminCommand({top: 1}, {}, function (err, res) {
                    done(err, res);
                });
            }
            catch (ex) {
                LOGGER.error('[top]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        return Helper.convertBSONtoJSON(result);
    },

    dbStats(sessionId) {
        LOGGER.info('[stats]');

        let result = Async.runSync(function (done) {
            try {
                databasesBySessionId[sessionId].stats(function (err, docs) {
                    done(err, docs);
                });
            }
            catch (ex) {
                LOGGER.error('[stats]', ex);
                done(new Meteor.Error(ex.message), null);
            }
        });

        return Helper.convertBSONtoJSON(result);
    },

    validateCollection(collectionName, options, sessionId) {
        const methodArray = [
            {
                "validateCollection": [collectionName, options]
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    setProfilingLevel(level, sessionId) {
        const methodArray = [
            {
                "setProfilingLevel": [level]
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    serverStatus(sessionId) {
        const methodArray = [
            {
                "serverStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    serverInfo(sessionId) {
        const methodArray = [
            {
                "serverInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    replSetGetStatus(sessionId) {
        const methodArray = [
            {
                "replSetGetStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    removeUser(username, runOnAdminDB, sessionId) {
        const methodArray = [
            {
                "removeUser": [username]
            }
        ];
        return proceedQueryExecution(methodArray, runOnAdminDB, sessionId);
    },

    profilingInfo(sessionId) {
        const methodArray = [
            {
                "profilingInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    ping(sessionId) {
        const methodArray = [
            {
                "ping": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    listDatabases(sessionId) {
        const methodArray = [
            {
                "listDatabases": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    },

    command (command, runOnAdminDB, options, sessionId) {
        const methodArray = [
            {
                "command": [command, options]
            }
        ];
        return proceedQueryExecution(methodArray, runOnAdminDB, sessionId);
    },

    addUser(username, password, options, runOnAdminDB, sessionId) {
        const methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(methodArray, runOnAdminDB, sessionId);
    },

    buildInfo(sessionId) {
        const methodArray = [
            {
                "buildInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, true, sessionId);
    }
});