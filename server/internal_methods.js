/**
 * Created by RSercan on 26.12.2015.
 */
Meteor.startup(function () {
    // create a setting if not exist
    if (!Settings.findOne()) {
        Settings.insert({
            scale: "MegaBytes",
            defaultResultView: "Jsoneditor",
            autoCompleteFields: false
        });
    }
});

Meteor.methods({
    'updateSettings': function (settings) {
        Settings.update({}, {
            $set: {
                scale: settings.scale,
                defaultResultView: settings.defaultResultView,
                autoCompleteFields: settings.autoCompleteFields
            }
        });
    },

    'saveConnection': function (connection) {
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