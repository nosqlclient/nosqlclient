/**
 * Created by RSercan on 5.1.2016.
 */
Template.options.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);

    Meteor.call("options", connection, selectedCollection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "options", {}, (historyParams ? false : true));
    });
};