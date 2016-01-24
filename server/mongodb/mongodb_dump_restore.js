/**
 * Created by RSercan on 17.1.2016.
 */
Meteor.methods({
    'restoreDump': function (connection, dumpInfo) {
        var connectionUrl = getConnectionUrl(connection);
        var restore = Meteor.npmRequire('mongodb-restore');
        var path = dumpInfo.filePath.substring(0, dumpInfo.filePath.indexOf('/'));
        var fileName = dumpInfo.filePath.substring(dumpInfo.filePath.indexOf('/') + 1);

        console.log('[DUMP] Restoring dump ' + JSON.stringify(dumpInfo) + ' to the ' + connectionUrl);
        try {
            restore({
                uri: connectionUrl,
                root: path,
                tar: fileName,
                drop: true,
                callback: Meteor.bindEnvironment(function () {
                    dumpInfo.status = DUMP_STATUS.FINISHED;
                    console.log("[DUMP] Dump has successfuly restored: " + JSON.stringify(dumpInfo));
                    Meteor.call('updateDump', dumpInfo);
                })
            });
        }
        catch (ex) {
            console.log('[DUMP] Unexpected exception during dump process: ', ex);
            dumpInfo.status = DUMP_STATUS.ERROR;
            Meteor.call('updateDump', dumpInfo);
        }
    },

    'takeDump': function (connection, path) {
        var date = new Date();
        var connectionUrl = getConnectionUrl(connection);
        var fileName = connection.databaseName + "_" + date.getTime() + ".tar";
        var fullFilePath = path + "/" + fileName;
        var backup = Meteor.npmRequire('mongodb-backup');

        console.log('[DUMP] Taking dump to the path: ' + path + " with fileName: " + fileName);
        try {
            backup({
                uri: connectionUrl,
                root: path,
                tar: fileName,
                //stream :
                callback: Meteor.bindEnvironment(function () {
                    var fs = Meteor.npmRequire('fs');
                    var stats = fs.statSync(fullFilePath);

                    var dump = {
                        filePath: fullFilePath,
                        date: date,
                        connectionName: connection.name,
                        sizeInBytes: stats["size"],
                        status: DUMP_STATUS.NOT_IMPORTED
                    };

                    console.log("[DUMP] Trying to save dump: " + JSON.stringify(dump));
                    Meteor.call('saveDump', dump);
                    console.log('[DUMP] Dump process has finished');
                })
            });
        }
        catch (ex) {
            console.log('Unexpected exception during dump process: ', ex);
        }
    }
});