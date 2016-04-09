Template.buildInfo.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.buildInfo.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call("buildInfo", connection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};