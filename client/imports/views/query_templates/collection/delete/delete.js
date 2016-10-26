import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {Session} from 'meteor/session';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/views/query_templates_common/selector/selector';

import './delete.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.delete.onRendered(function () {
    Helper.changeConvertOptionsVisibility(true);
});

Template.delete.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("delete", selectedCollection, selector, convertIds, convertDates, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "delete", params, (historyParams ? false : true));
        }
    );
};