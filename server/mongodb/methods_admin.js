/**
 * Created by RSercan on 10.1.2016.
 */
import LOGGER from "../internal/logger";
import Helper from "./helper";
import {Meteor} from 'meteor/meteor';
import {database} from "./methods_common";

Meteor.methods({
    dbStats() {
        LOGGER.info('[stats]');

        let result = Async.runSync(function (done) {
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

        Helper.convertBSONtoJSON(result);
        return result;
    },

    validateCollection(collectionName, options, convertIds, convertDates) {
        const methodArray = [
            {
                "validateCollection": [collectionName, options]
            }
        ];
        return proceedQueryExecution(methodArray, convertIds, convertDates, true);
    },

    setProfilingLevel(level) {
        const methodArray = [
            {
                "setProfilingLevel": [level]
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    serverStatus() {
        const methodArray = [
            {
                "serverStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    serverInfo() {
        const methodArray = [
            {
                "serverInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    replSetGetStatus() {
        const methodArray = [
            {
                "replSetGetStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    removeUser(username, runOnAdminDB) {
        const methodArray = [
            {
                "removeUser": [username]
            }
        ];
        return proceedQueryExecution(methodArray, false, false, runOnAdminDB);
    },

    profilingInfo() {
        const methodArray = [
            {
                "profilingInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    ping() {
        const methodArray = [
            {
                "ping": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    listDatabases() {
        const methodArray = [
            {
                "listDatabases": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    },

    command (command, convertIds, convertDates, runOnAdminDB) {
        const methodArray = [
            {
                "command": [command]
            }
        ];
        return proceedQueryExecution(methodArray, convertIds, convertDates, runOnAdminDB);
    },

    addUser(username, password, options, runOnAdminDB) {
        const methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(methodArray, false, false, runOnAdminDB);
    },

    buildInfo() {
        const methodArray = [
            {
                "buildInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, false, false, true);
    }
});


const proceedQueryExecution = function (methodArray, convertIds, convertDates, runOnAdminDB) {
    LOGGER.info(methodArray, convertIds, convertDates, runOnAdminDB);

    let convertObjectId = true;
    let convertIsoDates = true;

    if (convertIds !== undefined && !convertIds) {
        convertObjectId = false;
    }

    if (convertDates !== undefined && !convertDates) {
        convertIsoDates = false;
    }

    let result = Async.runSync(function (done) {
        try {
            let execution = runOnAdminDB ? database.admin() : database;
            for (let i = 0; i < methodArray.length; i++) {
                let last = i == (methodArray.length - 1);
                let entry = methodArray[i];
                Helper.convertJSONtoBSON(entry, convertObjectId, convertIsoDates);

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

    Helper.convertBSONtoJSON(result);
    return result;
};