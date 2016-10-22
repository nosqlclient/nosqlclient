/**
 * Created by RSercan on 19.1.2016.
 */
Meteor.publish('connections', function () {
    return Connections.find();
});

Meteor.publish('actions', function () {
    return Actions.find();
});

Meteor.publish('dumps', function (connectionId) {
    return Dumps.find({connectionId: connectionId}, {sort: {date: 1}});
});

Meteor.publish('queryHistories', function () {
    return QueryHistory.find();
});

Meteor.publish('settings', function () {
    return Settings.find();
});