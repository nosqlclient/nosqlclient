import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';
import {getOptions} from '/client/imports/views/query_templates_options/findone_modify_options/findone_modify_options';

import './findone_and_replace.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndReplace.onRendered(function () {
    Helper.initializeCodeMirror($('#divReplacement'), 'txtReplacement');
    initializeOptions();
});

const initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(Helper.sortObjectByKey(Enums.FINDONE_MODIFY_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndReplace.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
    var replaceObject = historyParams ? JSON.stringify(historyParams.replaceObject) : Helper.getCodeMirrorValue($('#divReplacement'));

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    replaceObject = Helper.convertAndCheckJSON(replaceObject);
    if (replaceObject["ERROR"]) {
        toastr.error("Syntax error on set: " + replaceObject["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        replaceObject: replaceObject,
        options: options
    };

    Meteor.call("findOneAndReplace", selectedCollection, selector, replaceObject, options, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "findOneAndReplace", params, (historyParams ? false : true));
        }
    );
};