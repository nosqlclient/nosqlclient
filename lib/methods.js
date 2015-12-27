/**
 * Created by RSercan on 26.12.2015.
 */
Meteor.methods({
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