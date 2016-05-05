/**
 * Created by RSercan on 3.1.2016.
 */
Template.isCapped.onRendered(function () {
    Template.changeConvertOptionsVisibility(false);
});

Template.isCapped.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);

    Meteor.call("isCapped", selectedCollection, function (err, result) {
        if (!result.result) {
            result.result = false;
        }
        Template.renderAfterQueryExecution(err, result, false, "isCapped", {}, (historyParams ? false : true));
    });
};