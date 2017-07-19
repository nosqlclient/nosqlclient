/**
 * Created by RSercan on 17.1.2016.
 */

import {Meteor} from "meteor/meteor";
import {Dumps} from "/lib/imports/collections";
import {getProperBinary} from "./methods_common";
import LOGGER from "../internal/logger";

const spawn = require('cross-spawn');

const executeBinary = function (args, sessionId, binaryName) {
    LOGGER.info('[' + binaryName + ']', args, sessionId);
    const binaryPath = getProperBinary(binaryName);

    try {
        let spawned = spawn(binaryPath, args);
        spawned.stdout.on('data', Meteor.bindEnvironment(function (data) {
            if (data.toString()) {
                Dumps.insert({
                    'date': Date.now(),
                    'sessionId': sessionId,
                    'binary': binaryName,
                    'message': data.toString()
                });
            }
        }));

        spawned.stderr.on('data', Meteor.bindEnvironment(function (data) {
            if (data.toString()) {
                Dumps.insert({
                    'date': Date.now(),
                    'sessionId': sessionId,
                    'binary': binaryName,
                    'message': data.toString(),
                    'error': true
                });
            }
        }));

        spawned.on('close', Meteor.bindEnvironment(function () {
            Dumps.insert({
                'date': Date.now(),
                'sessionId': sessionId,
                'binary': binaryName,
                'message': 'CLOSED'
            });
        }));

        spawned.stdin.end();
    }
    catch (ex) {
        LOGGER.error('[' + binaryName + ']', sessionId, ex);
        throw new Meteor.Error(ex.message || ex);
    }
};

Meteor.methods({
    mongodump (args, sessionId){
        executeBinary(args, sessionId, 'mongodump');
    },

    mongorestore (args, sessionId){
        executeBinary(args, sessionId, 'mongorestore');
    },

    mongoexport (args, sessionId){
        executeBinary(args, sessionId, 'mongoexport');
    },

    mongoimport (args, sessionId){
        executeBinary(args, sessionId, 'mongoimport');
    },

    removeDumpLogs(sessionId, binary){
        LOGGER.info('[removeDumpLogs]', sessionId, binary);
        if (!binary) Dumps.remove({sessionId: sessionId});
        else Dumps.remove({sessionId: sessionId, binary: binary});
    }
});
