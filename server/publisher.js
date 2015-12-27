/**
 * Created by RSercan on 26.12.2015.
 */
Meteor.publish('connections', function () {
    return Connections.find();
});

