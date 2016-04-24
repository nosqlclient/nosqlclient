/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverStatus.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.serverStatus.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call("serverStatus", connection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};