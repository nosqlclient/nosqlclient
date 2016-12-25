/**
 * Created by RSercan on 10.1.2016.
 */
/*global Async*/

import LOGGER from "../internal/logger";
import Helper from "./helper";
import {Meteor} from 'meteor/meteor';
import {database} from "./methods_common";


const proceedQueryExecution = function (methodArray, runOnAdminDB) {
    LOGGER.info(JSON.stringify(methodArray), runOnAdminDB);

    let result = Async.runSync(function (done) {
        try {
            let execution = runOnAdminDB ? database.admin() : database;
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

        return Helper.convertBSONtoJSON(result);
    },

    validateCollection(collectionName, options) {
        const methodArray = [
            {
                "validateCollection": [collectionName, options]
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    setProfilingLevel(level) {
        const methodArray = [
            {
                "setProfilingLevel": [level]
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    serverStatus() {
        const methodArray = [
            {
                "serverStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    serverInfo() {
        const methodArray = [
            {
                "serverInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    replSetGetStatus() {
        const methodArray = [
            {
                "replSetGetStatus": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    removeUser(username, runOnAdminDB) {
        const methodArray = [
            {
                "removeUser": [username]
            }
        ];
        return proceedQueryExecution(methodArray, runOnAdminDB);
    },

    profilingInfo() {
        const methodArray = [
            {
                "profilingInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    ping() {
        const methodArray = [
            {
                "ping": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    listDatabases() {
        const methodArray = [
            {
                "listDatabases": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    },

    command (command, runOnAdminDB, options) {
        const methodArray = [
            {
                "command": [command, options]
            }
        ];
        return proceedQueryExecution(methodArray, runOnAdminDB);
    },

    addUser(username, password, options, runOnAdminDB) {
        const methodArray = [
            {
                "addUser": [username, password, options]
            }
        ];
        return proceedQueryExecution(methodArray, runOnAdminDB);
    },

    buildInfo() {
        const methodArray = [
            {
                "buildInfo": []
            }
        ];
        return proceedQueryExecution(methodArray, true);
    }
});