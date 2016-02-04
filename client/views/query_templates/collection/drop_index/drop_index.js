/**
 * Created by RSercan on 2.1.2016.
 */
Template.dropIndex.events({
    'keypress #inputIndexName': function (event) {
        if (event.keyCode == 13) {
            Template.dropIndex.executeQuery();
            return false;
        }
    }
});

Template.dropIndex.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var indexName = $('#inputIndexName').val();

    Meteor.call("dropIndex", connection, selectedCollection, indexName, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "dropIndex");
    });
};
