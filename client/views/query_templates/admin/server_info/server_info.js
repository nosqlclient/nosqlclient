/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverStatus.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.serverInfo.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();

    Meteor.call("serverInfo", Session.get(Template.strSessionConnection), function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};