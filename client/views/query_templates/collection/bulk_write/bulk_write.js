/**
 * Created by RSercan on 15.10.2016.
 */

Template.bulkWrite.onRendered(function () {
    Template.initializeCodeMirror($('#divBulkWrite'), 'txtBulkWrite');
});

Template.bulkWrite.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var operations = historyParams ? JSON.stringify(historyParams.selector) : Template.getCodeMirrorValue($('#divBulkWrite'));

    operations = Template.convertAndCheckJSONAsArray(operations);
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

    Meteor.call("bulkWrite", selectedCollection, operations, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "bulkWrite", params, (historyParams ? false : true));
        }
    );
};