var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(function () {
    Template.insertMany.initializeAceEditor();
    Template.changeConvertOptionsVisibility(true);
});

Template.insertMany.initializeAceEditor = function () {
    AceEditor.instance('aceDocs', {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false
        });
    });
};

Template.insertMany.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var docs = historyParams ? JSON.stringify(historyParams.docs) : ace.edit("aceDocs").getSession().getValue();

    docs = Template.convertAndCheckJSON(docs);
    if (docs["ERROR"]) {
        toastr.error("Syntax error on docs: " + docs["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (!(docs instanceof Array)) {
        var newArray = [];
        newArray.push(docs);
        docs = newArray;
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