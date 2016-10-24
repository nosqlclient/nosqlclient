import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/helper';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/views/query_templates_common/selector/selector';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.distinct.onRendered(function () {
    Helper.changeConvertOptionsVisibility(true);
});

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

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        fieldName: fieldName
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("distinct", selectedCollection, selector, fieldName, convertIds, convertDates, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "distinct", params, (historyParams ? false : true));
        }
    );
};
