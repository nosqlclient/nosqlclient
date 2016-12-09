import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_options/selector/selector';

import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import './distinct.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.distinct.onRendered(function () {
    initializeOptions();
});

const initializeOptions = function () {
    var cmb = $('#cmbDistinctOptions');
    $.each(Helper.sortObjectByKey(Enums.DISTINCT_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.distinct.events({
    'keypress #inputField' (event) {
        if (event.keyCode == 13) {
            Template.distinct.executeQuery();
            return false;
        }
    }
});

Template.distinct.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
    var fieldName = historyParams ? historyParams.fieldName : $('#inputField').val();
    var options = historyParams ? historyParams.options : {};

    if ($.inArray("MAX_TIME_MS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        let maxTimeMsVal = $('#inputMaxTimeMs').val();
        if (maxTimeMsVal) {
            options[Enums.AGGREGATE_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMsVal);
        }
    }

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        fieldName: fieldName,
        options: options
    };

    Meteor.call("distinct", selectedCollection, selector, fieldName, options, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "distinct", params, (historyParams ? false : true));
        }
    );
};

Template.distinct.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.selector) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
            }, 100);
        }

        if (query.queryParams.fieldName) {
            Meteor.setTimeout(function () {
                $('#inputField').val(query.queryParams.fieldName);
            }, 100);
        }

    }
};