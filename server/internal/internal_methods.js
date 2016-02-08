/**
 * Created by RSercan on 26.12.2015.
 */
Meteor.methods({
    'updateDump': function (dump) {
        Dumps.update({_id: dump._id}, {
            $set: {
                connectionName: dump.connectionName,
                connectionId: dump.connectionId,
                date: dump.date,
                sizeInBytes: dump.sizeInBytes,
                filePath: dump.filePath,
                status: dump.status
            }
        });
    },

    'saveDump': function (dump) {
        Dumps.insert(dump);
    },

    'updateSettings': function (settings) {
        Settings.update({}, {
            $set: {
                scale: settings.scale,
                maxAllowedFetchSize: settings.maxAllowedFetchSize,
                defaultResultView: settings.defaultResultView,
                autoCompleteFields: settings.autoCompleteFields,
                socketTimeoutInSeconds: settings.socketTimeoutInSeconds,
                connectionTimeoutInSeconds: settings.connectionTimeoutInSeconds,
                showDBStats: settings.showDBStats,
                dumpPath: settings.dumpPath
            }
        });
    },

    'saveConnection': function (connection) {
        if (Connections.findOne({name: connection.name}) != null) {
            console.log('Connection name already exist: ' + JSON.stringify(connection) + ' could not save it');
            throw new Meteor.Error('Connection name already exist: ' + connection.name);
        }

        Connections.insert(connection);
    },

    'updateConnection': function (connection) {
        Connections.update({_id: connection._id}, {
            $set: {
                name: connection.name,
                host: connection.host,
                port: connection.port,
                databaseName: connection.databaseName,
                user: connection.user,
                password: connection.password
            }
        });
    },

    'removeConnection': function (connectionId) {
        Connections.remove(connectionId);
    }
});