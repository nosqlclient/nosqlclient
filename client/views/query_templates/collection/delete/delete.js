/**
 * Created by RSercan on 2.1.2016.
 */
Template.delete.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var selector = Template.selector.getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("delete", connection, selectedCollection, selector, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "delete");
    });
};