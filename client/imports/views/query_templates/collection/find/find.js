import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Settings} from '/lib/imports/collections/settings';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';
import {getCursorOptions} from '/client/imports/views/query_templates_options/cursor_options/cursor_options';

import './find.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    initializeOptions();
});

const initializeOptions = function () {
    var cmb = $('#cmbFindCursorOptions');
    $.each(Helper.sortObjectByKey(Enums.CURSOR_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);

    $('#divExecuteExplain').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
    $('#inputExecuteExplain').iCheck('uncheck');
};

Template.find.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var maxAllowedFetchSize = Math.round(Settings.findOne().maxAllowedFetchSize * 100) / 100;
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

    // max allowed fetch size  != 0 and there's no project option, check for size
    if (maxAllowedFetchSize && maxAllowedFetchSize != 0 && !(Enums.CURSOR_OPTIONS.PROJECT in cursorOptions)) {
        // get stats to calculate fetched documents size from avgObjSize (stats could be changed, therefore we can't get it from html )
        Meteor.call("stats", selectedCollection, {}, function (statsError, statsResult) {
            if (statsError || statsResult.error || !(statsResult.result.avgObjSize)) {
                // if there's an error, nothing we can do
                proceedFindQuery(selectedCollection, selector, cursorOptions, (historyParams ? false : true));
            }
            else {
                if (Enums.CURSOR_OPTIONS.LIMIT in cursorOptions) {
                    var count = cursorOptions.limit;
                    if (checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                        proceedFindQuery(selectedCollection, selector, cursorOptions, (historyParams ? false : true));
                    }
                }
                else {
                    Meteor.call("count", selectedCollection, selector, function (err, result) {
                        if (err || result.error) {
                            proceedFindQuery(selectedCollection, selector, cursorOptions, (historyParams ? false : true));
                        }
                        else {
                            var count = result.result;
                            if (checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                                proceedFindQuery(selectedCollection, selector, cursorOptions, (historyParams ? false : true));
                            }
                        }
                    });
                }
            }
        });
    }
    else {
        proceedFindQuery(selectedCollection, selector, cursorOptions);
    }
};

const proceedFindQuery = function (selectedCollection, selector, cursorOptions, saveHistory) {
    var params = {
        selector: selector,
        cursorOptions: cursorOptions
    };

    var executeExplain = false;
    if (!saveHistory) {
        executeExplain = $('#inputExecuteExplain').iCheck('update')[0].checked;
    }

    Meteor.call("find", selectedCollection, selector, cursorOptions, executeExplain, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "find", params, saveHistory);
    });
};

const checkAverageSize = function (count, avgObjSize, maxAllowedFetchSize) {
    var totalBytes = (count * avgObjSize) / (1024 * 1024);
    var totalMegabytes = Math.round(totalBytes * 100) / 100;

    if (totalMegabytes > maxAllowedFetchSize) {
        Ladda.stopAll();
        toastr.error("The fetched document size (average): " + totalMegabytes + " MB, exceeds maximum allowed size (" + maxAllowedFetchSize + " MB), please use LIMIT, SKIP options.");
        return false;
    }

    return true;
};
