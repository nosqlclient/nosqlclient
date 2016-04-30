Template.buildInfo.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.buildInfo.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();

    Meteor.call("buildInfo", Session.get(Template.strSessionConnection), function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};