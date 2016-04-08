/**
 * Created by RSercan on 10.1.2016.
 */
Template.validateCollection.onRendered(function () {
    Template.initializeAceEditor('aceOptions', Template.validateCollection.executeQuery);
    Template.changeConvertOptionsVisibility(true);
});

Template.validateCollection.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var collectionName = $('#inputValidateCollection').val();
    var options = ace.edit("aceOptions").getSession().getValue();

    if (collectionName == null || collectionName.length === 0) {
        toastr.error('CollectionName can not be empty');
        Ladda.stopAll();
        return;
    }

    options = Template.convertAndCheckJSON(options);
    if (options["ERROR"]) {
        toastr.error("Syntax error on options: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("validateCollection", connection, collectionName, options, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, true);
        })
    ;
};