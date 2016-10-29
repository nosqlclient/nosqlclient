import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './bulk_write.html';

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

    Meteor.call("bulkWrite", selectedCollection, operations, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "bulkWrite", params, (historyParams ? false : true));
        }
    );
};