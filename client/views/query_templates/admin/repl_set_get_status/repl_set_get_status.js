/**
 * Created by RSercan on 10.1.2016.
 */
Template.replSetGetStatus.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.replSetGetStatus.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();

    Meteor.call("replSetGetStatus", Session.get(Template.strSessionConnection), function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};