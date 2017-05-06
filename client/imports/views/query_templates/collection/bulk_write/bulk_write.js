import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {initExecuteQuery} from "/client/imports/views/pages/browse_collection/browse_collection";
import {getBulkWriteOptions} from "/client/imports/views/query_templates_options/bulk_write_options/bulk_write_options";
import "./bulk_write.html";

/**
 * Created by RSercan on 15.10.2016.
 */

const toastr = require('toastr');
const Ladda = require('ladda');

Template.bulkWrite.onRendered(function () {
    Helper.initializeCodeMirror($('#divBulkWrite'), 'txtBulkWrite');
    initializeOptions();
});

const initializeOptions = function () {
    const cmb = $('#cmbBulkWriteOptions');
    $.each(Helper.sortObjectByKey(Enums.BULK_WRITE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};


Template.bulkWrite.executeQuery = function (historyParams) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    let operations = historyParams ? JSON.stringify(historyParams.selector) : Helper.getCodeMirrorValue($('#divBulkWrite'));
    const options = historyParams ? historyParams.options : getBulkWriteOptions();

    operations = Helper.convertAndCheckJSON(operations);
    if (operations["ERROR"]) {
        toastr.error("Syntax error on operations: " + operations["ERROR"]);
        Ladda.stopAll();
        return;
    }

    const params = {
        selector: operations,
        options: options
    };

    Meteor.call("bulkWrite", selectedCollection, operations, options, Meteor.default_connection._lastSessionId, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "bulkWrite", params, (!historyParams));
        }
    );
};


Template.bulkWrite.renderQuery = function (query) {
    if (query.queryParams && query.queryParams.selector) {
        // let codemirror initialize
        Meteor.setTimeout(function () {
            Helper.setCodeMirrorValue($('#divBulkWrite'), JSON.stringify(query.queryParams.selector, null, 1));
        }, 100);
    }

    if (query.queryParams.options) {
        let optionsArray = [];
        for (let property in query.queryParams.options) {
            if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.BULK_WRITE_OPTIONS))[property]) {
                optionsArray.push((_.invert(Enums.BULK_WRITE_OPTIONS))[property]);
            }
        }

        Meteor.setTimeout(function () {
            $('#cmbBulkWriteOptions').val(optionsArray).trigger('chosen:updated');
            Session.set(Helper.strSessionSelectedOptions, optionsArray);
        }, 100);

        // options load
        Meteor.setTimeout(function () {
            for (let i = 0; i < optionsArray.length; i++) {
                let option = optionsArray[i];
                let inverted = (_.invert(Enums.BULK_WRITE_OPTIONS));
                if (option === inverted.ordered) {
                    $('#inputOrdered').val(query.queryParams.options.ordered);
                }
                if (option === inverted.bypassDocumentValidation) {
                    $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
                }
            }

        }, 200);
    }
};
