import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {Settings} from "/lib/imports/collections/settings";
import {initExecuteQuery} from "/client/imports/views/pages/browse_collection/browse_collection";
import {getSelectorValue} from "/client/imports/views/query_templates_options/selector/selector";
import {getCursorOptions} from "/client/imports/views/query_templates_options/cursor_options/cursor_options";
import "/client/imports/views/query_templates_options/explain/explain";
import "./find.html";

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by sercan on 30.12.2015.
 */
/*global _*/

const proceedFindQuery = function (selectedCollection, selector, cursorOptions, saveHistory, exportFormat) {
    const executeExplain = $('#inputExecuteExplain').iCheck('update')[0].checked;

    const params = {
        selector: selector,
        cursorOptions: cursorOptions,
        executeExplain: executeExplain
    };

    if (exportFormat) {
        window.open('export?format=' + exportFormat + '&selectedCollection=' + selectedCollection + "&selector=" + JSON.stringify(selector) + "&cursorOptions=" + JSON.stringify(cursorOptions) + "&sessionId=" + Meteor.default_connection._lastSessionId);
        Ladda.stopAll();
    } else {
        Meteor.call("find", selectedCollection, selector, cursorOptions, executeExplain, Meteor.default_connection._lastSessionId, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "find", params, saveHistory);
        });
    }
};

const checkAverageSize = function (count, avgObjSize, maxAllowedFetchSize) {
    const totalBytes = (count * avgObjSize) / (1024 * 1024);
    const totalMegabytes = Math.round(totalBytes * 100) / 100;

    if (totalMegabytes > maxAllowedFetchSize) {
        Ladda.stopAll();
        toastr.error("The fetched document size (average): " + totalMegabytes + " MB, exceeds maximum allowed size (" + maxAllowedFetchSize + " MB), please use LIMIT, SKIP options.");
        return false;
    }

    return true;
};

const initializeOptions = function () {
    const cmb = $('#cmbFindCursorOptions');
    $.each(Helper.sortObjectByKey(Enums.CURSOR_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);

    cmb.val("LIMIT").trigger('chosen:updated');
    Session.set(Helper.strSessionSelectedOptions, ["LIMIT"]);
};

Template.find.onRendered(function () {
    initializeOptions();
});

Template.find.executeQuery = function (historyParams, exportFormat) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    const maxAllowedFetchSize = Math.round(Settings.findOne().maxAllowedFetchSize * 100) / 100;
    const cursorOptions = historyParams ? historyParams.cursorOptions : getCursorOptions();
    let selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

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
        Meteor.call("stats", selectedCollection, {}, Meteor.default_connection._lastSessionId, function (statsError, statsResult) {
            if (statsError || statsResult.error || !(statsResult.result.avgObjSize)) {
                // if there's an error, nothing we can do
                proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
            }
            else {
                if (Enums.CURSOR_OPTIONS.LIMIT in cursorOptions) {
                    const count = cursorOptions.limit;
                    if (checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                        proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
                    }
                }
                else {
                    Meteor.call("count", selectedCollection, selector, {}, Meteor.default_connection._lastSessionId, function (err, result) {
                        if (err || result.error) {
                            proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
                        }
                        else {
                            const count = result.result;
                            if (checkAverageSize(count, statsResult.result.avgObjSize, maxAllowedFetchSize)) {
                                proceedFindQuery(selectedCollection, selector, cursorOptions, (!historyParams), exportFormat);
                            }
                        }
                    });
                }
            }
        });
    }
    else {
        proceedFindQuery(selectedCollection, selector, cursorOptions, false, exportFormat);
    }
};

Template.find.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.selector) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
            }, 100);
        }

        if (query.queryParams.cursorOptions) {
            let optionsArray = [];
            for (let property in query.queryParams.cursorOptions) {
                if (query.queryParams.cursorOptions.hasOwnProperty(property) && (_.invert(Enums.CURSOR_OPTIONS))[property]) {
                    optionsArray.push((_.invert(Enums.CURSOR_OPTIONS))[property]);
                }
            }

            Meteor.setTimeout(function () {
                $('#cmbFindCursorOptions').val(optionsArray).trigger('chosen:updated');
                Session.set(Helper.strSessionSelectedOptions, optionsArray);
            }, 100);

            // options load
            Meteor.setTimeout(function () {
                for (let i = 0; i < optionsArray.length; i++) {
                    let option = optionsArray[i];
                    let inverted = (_.invert(Enums.CURSOR_OPTIONS));
                    if (option === inverted.project) {
                        Helper.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.cursorOptions.project, null, 1));
                    }
                    if (option === inverted.skip) {
                        $('#inputSkip').val(query.queryParams.cursorOptions.skip);
                    }
                    if (option === inverted.sort) {
                        Helper.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.cursorOptions.sort, null, 1));
                    }
                    if (option === inverted.limit) {
                        $('#inputLimit').val(query.queryParams.cursorOptions.limit);
                    }
                    if (option === inverted.maxTimeMS) {
                        $('#inputMaxTimeMs').val(query.queryParams.cursorOptions.maxTimeMS);
                    }
                    if (option === inverted.max) {
                        Helper.setCodeMirrorValue($('#divMax'), JSON.stringify(query.queryParams.cursorOptions.max, null, 1));
                    }
                    if (option === inverted.min) {
                        Helper.setCodeMirrorValue($('#divMin'), JSON.stringify(query.queryParams.cursorOptions.min, null, 1));
                    }
                }
            }, 200);
        }

        Meteor.setTimeout(function () {
            $('#divExecuteExplain').iCheck(query.queryParams.executeExplain ? 'check' : 'uncheck');
        }, 100);
    }
};
