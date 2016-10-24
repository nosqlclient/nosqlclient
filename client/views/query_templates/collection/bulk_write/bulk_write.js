import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/helper';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';

/**
 * Created by RSercan on 15.10.2016.
 */

Template.bulkWrite.onRendered(function () {
    Helper.initializeCodeMirror($('#divBulkWrite'), 'txtBulkWrite');
});

Template.bulkWrite.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var operations = historyParams ? JSON.stringify(historyParams.selector) : Helper.getCodeMirrorValue($('#divBulkWrite'));

    operations = Helper.convertAndCheckJSONAsArray(operations);
    if (operations["ERROR"]) {
        toastr.error("Syntax error on operations: " + operations["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: operations
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("bulkWrite", selectedCollection, operations, convertIds, convertDates, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "bulkWrite", params, (historyParams ? false : true));
        }
    );
};