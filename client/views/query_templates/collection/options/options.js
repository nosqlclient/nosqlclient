/**
 * Created by RSercan on 5.1.2016.
 */
Template.options.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
});

Template.options.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);

    Meteor.call("options", Session.get(Template.strSessionConnection), selectedCollection, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "options", {}, (historyParams ? false : true));
    });
};