/**
 * Created by RSercan on 5.1.2016.
 */
Template.reIndex.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);

    Meteor.call("reIndex", connection, selectedCollection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "reIndex");
    });
};