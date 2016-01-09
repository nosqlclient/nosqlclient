/**
 * Created by RSercan on 26.12.2015.
 */
Meteor.publish('connections', function () {
    return Connections.find();
});

Meteor.publish('settings', function () {
    return Settings.find();
});

