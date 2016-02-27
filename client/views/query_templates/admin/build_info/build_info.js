Template.buildInfo.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call("buildInfo", connection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};