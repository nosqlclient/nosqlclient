/**
 * Created by RSercan on 19.1.2016.
 */
import {Meteor} from "meteor/meteor";
import {Connections} from "/lib/imports/collections/connections";
import {Actions} from "/lib/imports/collections/actions";
import {Dumps} from "/lib/imports/collections/dumps";
import {QueryHistory} from "/lib/imports/collections/query_history";
import {Settings} from "/lib/imports/collections/settings";
import ShellCommands from "/lib/imports/collections/shell";
import SchemaAnalyzeResult from "/lib/imports/collections/schema_analyze_result";

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