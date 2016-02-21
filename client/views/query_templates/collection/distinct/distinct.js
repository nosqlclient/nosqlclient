/**
 * Created by RSercan on 2.1.2016.
 */
Template.distinct.events({
    'keypress #inputField': function (event) {
        if (event.keyCode == 13) {
            Template.distinct.executeQuery();
            return false;
        }
    }
});

Template.distinct.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var selector = Template.selector.getValue();
    var fieldName = $('#inputField').val();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("distinct", connection, selectedCollection, selector, fieldName, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "distinct");
    });
};
