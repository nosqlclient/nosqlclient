/**
 * Created by RSercan on 10.1.2016.
 */
Template.profilingInfo.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
});

Template.profilingInfo.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call("profilingInfo", connection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};