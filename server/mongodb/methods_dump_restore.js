/**
 * Created by RSercan on 17.1.2016.
 */
var backup = require('mongodb-backup');
var restore = require('mongodb-restore');
var fs = require('fs');

Meteor.methods({
    'restoreDump': function (connectionId, dumpInfo) {
        var connection = Connections.findOne({_id: connectionId});
        var connectionUrl = getConnectionUrl(connection);
        var path = dumpInfo.filePath.substring(0, dumpInfo.filePath.lastIndexOf('/'));
        var fileName = dumpInfo.filePath.substring(dumpInfo.filePath.lastIndexOf('/') + 1);

        LOGGER.info('[restoreDump]', connectionUrl, dumpInfo);
        try {
            restore({
                uri: connectionUrl,
                root: path,
                tar: fileName,
                drop: true,
                callback: Meteor.bindEnvironment(function () {
                    dumpInfo.status = DUMP_STATUS.FINISHED;
                    Meteor.call('updateDump', dumpInfo);
                })
            });
        }
        catch (ex) {
            LOGGER.error('[restoreDump]', ex);
            dumpInfo.status = DUMP_STATUS.ERROR;
            Meteor.call('updateDump', dumpInfo);
        }
    },

    'takeDump': function (connectionId, path) {
        var connection = Connections.findOne({_id: connectionId});
        var date = new Date();
        var connectionUrl = getConnectionUrl(connection);
        var fileName = connection.databaseName + "_" + date.getTime() + ".tar";
        var fullFilePath = path + "/" + fileName;

        LOGGER.info('[takeDump]', connectionUrl, path);
        try {
            backup({
                uri: connectionUrl,
                root: path,
                logger: true,
                tar: fileName,
                callback: Meteor.bindEnvironment(function () {
                    var stats = fs.statSync(fullFilePath);

                    var dump = {
                        filePath: fullFilePath,
                        date: date,
                        connectionName: connection.name,
                        connectionId: connection._id,
                        sizeInBytes: stats["size"],
                        status: DUMP_STATUS.NOT_IMPORTED
                    };

                    Meteor.call('saveDump', dump);
                })
            });
        }
        catch (ex) {
            LOGGER.error('[takeDump]', ex);
        }

    }
});
