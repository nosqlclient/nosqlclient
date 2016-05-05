/**
 * Created by RSercan on 10.1.2016.
 */
Template.ping.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.ping.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();

    Meteor.call("ping", function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};