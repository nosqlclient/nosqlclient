var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(function () {
    Template.initializeCodeMirror($('#divDocs'), 'txtDocs');
    Template.changeConvertOptionsVisibility(true);
});

Template.insertMany.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var docs = historyParams ? JSON.stringify(historyParams.docs) : Template.getCodeMirrorValue($('#divDocs'));

    docs = Template.convertAndCheckJSONAsArray(docs);
    if (docs["ERROR"]) {
        toastr.error("Syntax error on docs: " + docs["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        docs: docs
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("insertMany", selectedCollection, docs, convertIds, convertDates, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "insertMany", params, (historyParams ? false : true));
    });
};