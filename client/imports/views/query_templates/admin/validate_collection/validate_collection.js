import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/views/pages/admin_queries/admin_queries';

import './validate_collection.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.validateCollection.onRendered(function () {
    Helper.initializeCodeMirror($('#divOptions'), 'txtOptions');
    Helper.changeConvertOptionsVisibility(true);
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.validateCollection.executeQuery = function () {
    initExecuteQuery();
    var collectionName = $('#inputValidateCollection').val();
    var options = Helper.getCodeMirrorValue($('#divOptions'));

    if (collectionName == null || collectionName.length === 0) {
        toastr.error('CollectionName can not be empty');
        Ladda.stopAll();
        return;
    }

    options = Helper.convertAndCheckJSON(options);
    if (options["ERROR"]) {
        toastr.error("Syntax error on options: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("validateCollection", collectionName, options, convertIds, convertDates, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};