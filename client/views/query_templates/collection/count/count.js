/**
 * Created by RSercan on 2.1.2016.
 */
Template.count.onRendered(function () {
    Template.changeConvertOptionsVisibility(true);
});

Template.count.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var selector = historyParams ? JSON.stringify(historyParams.selector) : Template.selector.getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("count", selectedCollection, selector, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "count", params, (historyParams ? false : true));
        }
    );
};