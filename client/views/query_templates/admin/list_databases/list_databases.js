/**
 * Created by RSercan on 10.1.2016.
 */
Template.listDatabases.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.listDatabases.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();

    Meteor.call("listDatabases", Session.get(Template.strSessionConnection), function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};