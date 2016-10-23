/**
 * Created by RSercan on 17.1.2016.
 */

import {Connections} from '/lib/collections/connections';
import {Meteor} from 'meteor/meteor';
import LOGGER from "../internal/logger";
import Helper from "./helper";
import Enums from "/lib/enums";

const backup = require('mongodb-backup');
const restore = require('mongodb-restore');
const fs = require('fs');

Meteor.methods({
    restoreDump(connectionId, dumpInfo) {
        const connection = Connections.findOne({_id: connectionId});
        const connectionUrl = Helper.getConnectionUrl(connection);
        const path = dumpInfo.filePath.substring(0, dumpInfo.filePath.lastIndexOf('/'));
        const fileName = dumpInfo.filePath.substring(dumpInfo.filePath.lastIndexOf('/') + 1);

        LOGGER.info('[restoreDump]', connectionUrl, dumpInfo);
        try {
            restore({
                uri: connectionUrl,
                root: path,
                tar: fileName,
                drop: true,
                callback: Meteor.bindEnvironment(function () {
                    dumpInfo.status = Enums.DUMP_STATUS.FINISHED;
                    Meteor.call('updateDump', dumpInfo);
                })
            });
        }
        catch (ex) {
            LOGGER.error('[restoreDump]', ex);
            dumpInfo.status = Enums.DUMP_STATUS.ERROR;
            Meteor.call('updateDump', dumpInfo);
        }
    },

    takeDump(connectionId, path) {
        const connection = Connections.findOne({_id: connectionId});
        const date = new Date();
        const connectionUrl = Helper.getConnectionUrl(connection);
        const fileName = connection.databaseName + "_" + date.getTime() + ".tar";
        const fullFilePath = path + "/" + fileName;

        LOGGER.info('[takeDump]', connectionUrl, path);
        try {
            backup({
                uri: connectionUrl,
                root: path,
                logger: true,
                tar: fileName,
                callback: Meteor.bindEnvironment(function () {
                    const stats = fs.statSync(fullFilePath);

                    Meteor.call('saveDump', {
                        filePath: fullFilePath,
                        date: date,
                        connectionName: connection.name,
                        connectionId: connection._id,
                        sizeInBytes: stats["size"],
                        status: Enums.DUMP_STATUS.NOT_IMPORTED
                    });
                })
            });
        }
        catch (ex) {
            LOGGER.error('[takeDump]', ex);
        }

    }
});
