/**
 * Created by Sercan on 10.12.2016.
 */
/*global _*/
import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {initExecuteQuery} from "/client/imports/views/pages/browse_collection/browse_collection";
import "./group.html";

const toastr = require('toastr');
const Ladda = require('ladda');

Template.group.onRendered(function () {
    Helper.initializeCodeMirror($('#divKeys'), 'txtKeys');
    Helper.initializeCodeMirror($('#divCondition'), 'txtCondition');
    Helper.initializeCodeMirror($('#divInitial'), 'txtInitial');
    Helper.initializeCodeMirror($('#divReduce'), 'txtReduce');
    Helper.initializeCodeMirror($('#divFinalize'), 'txtFinalize');

    $('#divCommand').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.group.executeQuery = function (historyParams) {
    initExecuteQuery();
    let selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    let keys = historyParams ? JSON.stringify(historyParams.keys) : Helper.getCodeMirrorValue($('#divKeys'));
    let condition = historyParams ? JSON.stringify(historyParams.condition) : Helper.getCodeMirrorValue($('#divCondition'));
    let initial = historyParams ? JSON.stringify(historyParams.initial) : Helper.getCodeMirrorValue($('#divInitial'));
    let reduce = historyParams ? JSON.stringify(historyParams.reduce) : Helper.getCodeMirrorValue($('#divReduce'));
    let finalize = historyParams ? JSON.stringify(historyParams.finalize) : Helper.getCodeMirrorValue($('#divFinalize'));
    let command = $('#inputCommand').iCheck('update')[0].checked;

    if (keys.startsWith('function')) {
        if (keys.parseFunction() == null) {
            toastr.error("Syntax error on keys, not a valid function, you can provide object or array as well");
            Ladda.stopAll();
            return;
        }
    } else {
        keys = Helper.convertAndCheckJSON(keys);
        if (keys["ERROR"]) {
            toastr.error("Syntax error on keys: " + keys["ERROR"]);
            Ladda.stopAll();
            return;
        }
    }

    condition = Helper.convertAndCheckJSON(condition);
    if (condition["ERROR"]) {
        toastr.error("Syntax error on condition: " + condition["ERROR"]);
        Ladda.stopAll();
        return;
    }

    initial = Helper.convertAndCheckJSON(initial);
    if (initial["ERROR"]) {
        toastr.error("Syntax error on initial: " + initial["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (reduce.parseFunction() == null) {
        toastr.error("Syntax error on reduce, not a valid function");
        Ladda.stopAll();
        return;
    }

    if (finalize.parseFunction() == null) {
        toastr.error("Syntax error on finalize, not a valid function");
        Ladda.stopAll();
        return;
    }

    const params = {
        keys: keys,
        condition: condition,
        initial: initial,
        reduce: reduce,
        finalize: finalize,
        command: command
    };

    Meteor.call("group", selectedCollection, keys, condition, initial, reduce, finalize, command,Meteor.default_connection._lastSessionId, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "group", params, (!historyParams));
    });
};


Template.group.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.keys) {
            Meteor.setTimeout(function () {
                if (query.queryParams.keys.startsWith('function')) {
                    Helper.setCodeMirrorValue($('#divKeys'), query.queryParams.keys);
                } else {
                    let str = JSON.stringify(query.queryParams.keys, null, 1).replace(/\\n/g, '\n');
                    Helper.setCodeMirrorValue($('#divKeys'), str.substring(1, str.length - 1));
                }

            }, 100);
        }

        if (query.queryParams.condition) {
            Meteor.setTimeout(function () {
                let str = JSON.stringify(query.queryParams.condition, null, 1).replace(/\\n/g, '\n');
                Helper.setCodeMirrorValue($('#divCondition'), str.substring(1, str.length - 1));
            }, 100);
        }

        if (query.queryParams.initial) {
            Meteor.setTimeout(function () {
                let str = JSON.stringify(query.queryParams.initial, null, 1).replace(/\\n/g, '\n');
                Helper.setCodeMirrorValue($('#divInitial'), str.substring(1, str.length - 1));
            }, 100);
        }

        if (query.queryParams.reduce) {
            Meteor.setTimeout(function () {
                let str = JSON.stringify(query.queryParams.reduce, null, 1).replace(/\\n/g, '\n');
                Helper.setCodeMirrorValue($('#divReduce'), str.substring(1, str.length - 1));
            }, 100);
        }

        if (query.queryParams.finalize) {
            Meteor.setTimeout(function () {
                let str = JSON.stringify(query.queryParams.finalize, null, 1).replace(/\\n/g, '\n');
                Helper.setCodeMirrorValue($('#divFinalize'), str.substring(1, str.length - 1));
            }, 100);
        }

        if (query.queryParams.command) {
            Meteor.setTimeout(function () {
                $('#divCommand').iCheck(query.queryParams.options.command ? 'check' : 'uncheck');
            }, 100);
        }
    }
};