/**
 * Created by RSercan on 10.1.2016.
 */
Template.command.onRendered(function () {
    Template.initializeAceEditor('aceCommand', Template.command.executeQuery);
});

Template.command.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var command = ace.edit("aceCommand").getSession().getValue();

    command = Template.convertAndCheckJSON(command);
    if (command["ERROR"]) {
        toastr.error("Syntax error on command: " + command["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("command", connection, command, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "command", true);
    });
};