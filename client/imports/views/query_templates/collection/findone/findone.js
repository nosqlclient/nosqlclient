import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/views/query_templates_common/selector/selector';
import {getCursorOptions} from '/client/views/query_templates_options/cursor_options/cursor_options';

import './findone.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOne.onRendered(function () {
    initializeOptions();
    Helper.changeConvertOptionsVisibility(true);
});

const initializeOptions = function () {
    var cmb = $('#cmbFindOneCursorOptions');
    $.each(Helper.sortObjectByKey(Enums.CURSOR_OPTIONS), function (key, value) {
        // dont add limit, it will be 1 already
        if (value != Enums.CURSOR_OPTIONS.LIMIT) {
            cmb.append($("<option></option>")
                .attr("value", key)
                .text(value));
        }
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.findOne.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var cursorOptions = historyParams ? historyParams.cursorOptions : getCursorOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        cursorOptions: cursorOptions
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("findOne", selectedCollection, selector, cursorOptions, convertIds, convertDates, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "findOne", params, (historyParams ? false : true));
        }
    );
};