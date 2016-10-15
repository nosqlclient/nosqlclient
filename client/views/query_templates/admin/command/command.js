var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.command.onRendered(function () {
    Template.initializeCodeMirror($('#divCommand'), 'txtCommand');
    Template.changeConvertOptionsVisibility(true);
    Template.changeRunOnAdminOptionVisibility(true);
});

Template.command.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var command = Template.getCodeMirrorValue($('#divCommand'));

    command = Template.convertAndCheckJSON(command);
    if (command["ERROR"]) {
        toastr.error("Syntax error on command: " + command["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;
    var runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

    Meteor.call("command", command, convertIds, convertDates, runOnAdminDB,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, true);
        }
    );
};