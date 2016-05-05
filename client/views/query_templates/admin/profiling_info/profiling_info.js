/**
 * Created by RSercan on 10.1.2016.
 */
Template.profilingInfo.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.profilingInfo.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    Meteor.call("profilingInfo", function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};