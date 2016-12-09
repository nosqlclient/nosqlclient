import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {Session} from 'meteor/session';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getAggregateOptions} from '/client/imports/views/query_templates_options/aggregate_options/aggregate_options';

import './aggregate.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.aggregate.onRendered(function () {
    Helper.initializeCodeMirror($('#divPipeline'), 'txtPipeline');
    initializeOptions();
});

const initializeOptions = function () {
    var cmb = $('#cmbAggregateOptions');
    $.each(Helper.sortObjectByKey(Enums.AGGREGATE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};


Template.aggregate.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var pipeline = historyParams ? JSON.stringify(historyParams.pipeline) : Helper.getCodeMirrorValue($('#divPipeline'));
    var options = historyParams ? historyParams.options : getAggregateOptions();

    pipeline = Helper.convertAndCheckJSON(pipeline);
    if (pipeline["ERROR"]) {
        toastr.error("Syntax error on pipeline: " + pipeline["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        pipeline: pipeline,
        options: options
    };

    Meteor.call("aggregate", selectedCollection, pipeline, options, function (err, result) {
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
