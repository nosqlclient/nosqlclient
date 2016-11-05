import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {Session} from 'meteor/session';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './aggregate.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.aggregate.onRendered(function () {
    Helper.initializeCodeMirror($('#divPipeline'), 'txtPipeline');
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

    Meteor.call("aggregate", selectedCollection, pipeline, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "aggregate", params, (historyParams ? false : true));
        }
    );
};

Template.aggregate.renderQuery = function (query) {
    if (query.queryParams && query.queryParams.pipeline) {
        // let codemirror initialize
        Meteor.setTimeout(function () {
            Helper.setCodeMirrorValue($('#divPipeline'), JSON.stringify(query.queryParams.pipeline, null, 1));
        }, 100);
    }
};
