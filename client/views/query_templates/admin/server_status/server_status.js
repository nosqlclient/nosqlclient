/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverStatus.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call("serverStatus", connection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};