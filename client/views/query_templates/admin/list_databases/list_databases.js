/**
 * Created by RSercan on 10.1.2016.
 */
Template.listDatabases.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call("listDatabases", connection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "listDatabases", true);
    });
};