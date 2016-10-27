import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/admin_queries/admin_queries';

import './command.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.command.onRendered(function () {
    Helper.initializeCodeMirror($('#divCommand'), 'txtCommand');
    Helper.changeConvertOptionsVisibility(true);
    Helper.changeRunOnAdminOptionVisibility(true);
});

Template.command.executeQuery = function () {
    initExecuteQuery();
    var command = Helper.getCodeMirrorValue($('#divCommand'));

    command = Helper.convertAndCheckJSON(command);
    if (command["ERROR"]) {
        toastr.error("Syntax error on command: " + command["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;
    var runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

    Meteor.call("command", command, convertIds, convertDates, runOnAdminDB, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, true);
        }
    );
};