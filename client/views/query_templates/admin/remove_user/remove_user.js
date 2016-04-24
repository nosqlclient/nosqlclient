/**
 * Created by RSercan on 10.1.2016.
 */
Template.removeUser.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(true);
});

Template.removeUser.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var username = $('#inputAddUserUsername').val();

    if (username == null || username.length === 0) {
        toastr.error('Username can not be empty');
        Ladda.stopAll();
        return;
    }

    var runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

    Meteor.call("removeUser", connection, username, runOnAdminDB, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};