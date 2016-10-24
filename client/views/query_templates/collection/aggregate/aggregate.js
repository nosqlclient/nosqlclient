import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/helper';
import {Session} from 'meteor/session';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.aggregate.onRendered(function () {
    Helper.initializeCodeMirror($('#divPipeline'), 'txtPipeline');
    Helper.changeConvertOptionsVisibility(true);
});

Template.aggregate.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var pipeline = historyParams ? JSON.stringify(historyParams.pipeline) : Helper.getCodeMirrorValue($('#divPipeline'));

    pipeline = Helper.convertAndCheckJSON(pipeline);
    if (pipeline["ERROR"]) {
        toastr.error("Syntax error on pipeline: " + pipeline["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        pipeline: pipeline
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("aggregate", selectedCollection, pipeline, convertIds, convertDates, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "aggregate", params, (historyParams ? false : true));
        }
    );
};