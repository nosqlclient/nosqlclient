/**
 * Created by RSercan on 2.1.2016.
 */
Template.dropIndex.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
});
Template.dropIndex.events({
    'keypress #inputIndexName': function (event) {
        if (event.keyCode == 13) {
            Template.dropIndex.executeQuery();
            return false;
        }
    }
});

Template.dropIndex.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var indexName = historyParams ? historyParams.indexName : $('#inputIndexName').val();

    var params = {
        indexName: indexName
    };

    Meteor.call("dropIndex", connection, selectedCollection, indexName, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "dropIndex", params, (historyParams ? false : true));
    });
};
