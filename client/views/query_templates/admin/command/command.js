/**
 * Created by RSercan on 10.1.2016.
 */
Template.command.onRendered(function () {
    Template.initializeAceEditor('aceCommand', Template.command.executeQuery);
    Template.changeConvertOptionsVisibility(true);
});

Template.command.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var command = ace.edit("aceCommand").getSession().getValue();

    command = Template.convertAndCheckJSON(command);
    if (command["ERROR"]) {
        toastr.error("Syntax error on command: " + command["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("command", connection, command, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, true);
        }
    );
};