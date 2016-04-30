/**
 * Created by RSercan on 5.1.2016.
 */
Template.reIndex.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
});

Template.reIndex.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);

    Meteor.call("reIndex", Session.get(Template.strSessionConnection), selectedCollection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "reIndex", {}, (historyParams ? false : true));
    });
};