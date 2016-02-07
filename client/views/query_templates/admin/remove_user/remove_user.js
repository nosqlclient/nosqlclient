/**
 * Created by RSercan on 10.1.2016.
 */
Template.removeUser.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var username = $('#inputAddUserUsername').val();

    if (username == null || username.length === 0) {
        toastr.error('Username can not be empty');
        Ladda.stopAll();
        return;
    }

    Meteor.call("removeUser", connection, username, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "removeUser", true);
    });
};