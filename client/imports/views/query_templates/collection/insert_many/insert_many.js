import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {getOptions} from "/client/imports/views/query_templates_options/insert_many_options/insert_many_options";
import {initExecuteQuery} from "/client/imports/views/pages/browse_collection/browse_collection";
import "./insert_many.html";

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(function () {
    Helper.initializeCodeMirror($('#divDocs'), 'txtDocs');
    initializeOptions();
});

const initializeOptions = function () {
    const cmb = $('#cmbInsertManyOptions');
    $.each(Helper.sortObjectByKey(Enums.INSERT_MANY_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};


Template.insertMany.executeQuery = function (historyParams) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    let docs = historyParams ? JSON.stringify(historyParams.docs) : Helper.getCodeMirrorValue($('#divDocs'));
    const options = historyParams ? historyParams.options : getOptions();

    docs = Helper.convertAndCheckJSON(docs);
    if (docs["ERROR"]) {
        toastr.error("Syntax error on docs: " + docs["ERROR"]);
        Ladda.stopAll();
        return;
    }

    const params = {
        docs: docs,
        options: options
    };

    Meteor.call("insertMany", selectedCollection, docs, options, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "insertMany", params, (!historyParams));
    });
};

Template.insertMany.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.docs) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divDocs'), JSON.stringify(query.queryParams.docs, null, 1));
            }, 100);
        }

        if (query.queryParams.options) {
            let optionsArray = [];
            for (let property in query.queryParams.options) {
                if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.INSERT_MANY_OPTIONS))[property]) {
                    optionsArray.push((_.invert(Enums.INSERT_MANY_OPTIONS))[property]);
                }
            }

            Meteor.setTimeout(function () {
                $('#cmbInsertManyOptions').val(optionsArray).trigger('chosen:updated');
                Session.set(Helper.strSessionSelectedOptions, optionsArray);

            }, 100);

            // options load
            Meteor.setTimeout(function () {
                for (let i = 0; i < optionsArray.length; i++) {
                    let option = optionsArray[i];
                    let inverted = (_.invert(Enums.INSERT_MANY_OPTIONS));
                    if (option === inverted.bypassDocumentValidation) {
                        $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
                    }
                    if (option === inverted.serializeFunctions) {
                        $('#divSerializeFunctions').iCheck(query.queryParams.options.serializeFunctions ? 'check' : 'uncheck');
                    }
                }
            }, 200);
        }
    }
};