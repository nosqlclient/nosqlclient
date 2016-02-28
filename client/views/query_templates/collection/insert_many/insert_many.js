/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(function () {
    Template.insertMany.initializeAceEditor();
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
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
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

    Meteor.call("insertMany", connection, selectedCollection, docs, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "insertMany", params, (historyParams ? false : true));
    });
};