import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {Session} from 'meteor/session';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_options/selector/selector';
import {getCountOptions} from '/client/imports/views/query_templates_options/count_options/count_options';

import './count.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.count.onRendered(function () {
    initializeOptions();
});


const initializeOptions = function () {
    const cmb = $('#cmbCountOptions');
    $.each(Helper.sortObjectByKey(Enums.COUNT_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.count.executeQuery = function (historyParams) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    let selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
    const options = historyParams ? historyParams.options : getCountOptions();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    const params = {
        selector: selector,
        options: options
    };

    Meteor.call("count", selectedCollection, selector, options, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "count", params, (!historyParams));
        }
    );
};

Template.count.renderQuery = function (query) {
    if (query.queryParams && query.queryParams.selector) {
        // let codemirror initialize
        Meteor.setTimeout(function () {
            Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
        }, 100);
    }
};
