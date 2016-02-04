/**
 * Created by RSercan on 2.1.2016.
 */
Template.aggregate.onRendered(function () {
    Template.aggregate.initializeAceEditor();
});

Template.aggregate.initializeAceEditor = function () {
    AceEditor.instance('acePipeline', {
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

Template.aggregate.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var pipeline = ace.edit("acePipeline").getSession().getValue();

    pipeline = Template.convertAndCheckJSON(pipeline);
    if (pipeline["ERROR"]) {
        toastr.error("Syntax error on pipeline: " + pipeline["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("aggregate", connection, selectedCollection, pipeline, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "aggregate");
    });
};