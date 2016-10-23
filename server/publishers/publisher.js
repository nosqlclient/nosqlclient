/**
 * Created by RSercan on 19.1.2016.
 */
import {Meteor} from 'meteor/meteor';
import {Connections} from '/lib/collections/connections';
import {Actions} from '/lib/collections/actions';
import {Dumps} from '/lib/collections/dumps';
import {QueryHistory} from '/lib/collections/query_history';
import {Settings} from '/lib/collections/settings';


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