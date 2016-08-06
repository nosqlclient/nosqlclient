var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.distinct.onRendered(function () {
    Template.changeConvertOptionsVisibility(true);
});

Template.distinct.events({
    'keypress #inputField': function (event) {
        if (event.keyCode == 13) {
            Template.distinct.executeQuery();
            return false;
        }
    }
});

Template.distinct.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var selector = historyParams ? JSON.stringify(historyParams.selector) : Template.selector.getValue();
    var fieldName = historyParams ? historyParams.fieldName : $('#inputField').val();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        fieldName: fieldName
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("distinct", selectedCollection, selector, fieldName, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "distinct", params, (historyParams ? false : true));
        }
    );
};
