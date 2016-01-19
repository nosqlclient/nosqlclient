/**
 * Created by RSercan on 19.1.2016.
 */
Meteor.publish('dumps', function (connectionId) {
    if (connectionId) {
        var connection = Connections.findOne({_id: connectionId});
        return Dumps.find({connectionName: connection.name});
    }

    return [];
});