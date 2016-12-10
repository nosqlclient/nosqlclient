import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_options/selector/selector';

import '/client/imports/views/query_templates_options/set/set';
import '/client/imports/views/query_templates_options/upsert/upsert';

import './update_many.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by sercan on 06.01.2016.
 */
const getOptions = function () {
    var result = {};

    if ($.inArray("UPSERT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[Enums.UPDATE_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};

const initializeOptions = function () {
    var cmb = $('#cmbUpdateManyOptions');
    $.each(Helper.sortObjectByKey(Enums.UPDATE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.updateMany.onRendered(function () {
    initializeOptions();
});

Template.updateMany.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
    var setObject = historyParams ? JSON.stringify(historyParams.setObject) : Helper.getCodeMirrorValue($('#divSet'));

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    setObject = Helper.convertAndCheckJSON(setObject);
    if (setObject["ERROR"]) {
        toastr.error("Syntax error on set: " + setObject["ERROR"]);
        Ladda.stopAll();
        return;
    }
    setObject = {"$set": setObject};


    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        setObject: setObject,
        options: options
    };

    Meteor.call("updateMany", selectedCollection, selector, setObject, options, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "updateMany", params, (historyParams ? false : true));
        }
    );
};

Template.updateMany.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.selector) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
            }, 100);
        }

        if (query.queryParams.setObject) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divSet'), JSON.stringify(query.queryParams.setObject.$set, null, 1));
            }, 100);
        }

        if (query.queryParams.options) {
            let optionsArray = [];
            for (let property in query.queryParams.options) {
                if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.UPDATE_OPTIONS))[property]) {
                    optionsArray.push((_.invert(Enums.UPDATE_OPTIONS))[property]);
                }
            }

            Meteor.setTimeout(function () {
                $('#cmbUpdateManyOptions').val(optionsArray).trigger('chosen:updated');
                Session.set(Helper.strSessionSelectedOptions, optionsArray);

            }, 100);

            // options load
            Meteor.setTimeout(function () {
                for (let i = 0; i < optionsArray.length; i++) {
                    let option = optionsArray[i];
                    let inverted = (_.invert(Enums.UPDATE_OPTIONS));
                    if (option === inverted.upsert) {
                        $('#divVerbose').iCheck(query.queryParams.options.upsert ? 'check' : 'uncheck');
                    }
                }
            }, 200);
        }
    }
};