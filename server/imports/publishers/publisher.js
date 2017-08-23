/**
 * Created by RSercan on 19.1.2016.
 */
import {Meteor} from "meteor/meteor";
import {
    Connections,
    Actions,
    Dumps,
    QueryHistory,
    Settings,
    ShellCommands,
    SchemaAnalyzeResult
} from "/lib/imports/collections";

Meteor.publish('schema_analyze_result', function () {
    return SchemaAnalyzeResult.find({});
});

Meteor.publish('shell_commands', function () {
    return ShellCommands.find({});
});

Meteor.publish('connections', function () {
    return Connections.find();
});

Meteor.publish('actions', function () {
    return Actions.find();
});

Meteor.publish('dumps', function () {
    return Dumps.find({}, {sort: {date: 1}});
});

Meteor.publish('queryHistories', function () {
    return QueryHistory.find();
});

Meteor.publish('settings', function () {
    return Settings.find();
});