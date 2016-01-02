/**
 * Created by RSercan on 2.1.2016.
 */
Template.count.onRendered(function () {
    Template.initializeAceEditor('aceSelector', Template.count.executeQuery);
});

Template.count.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var selector = ace.edit("aceSelector").getSession().getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("count", connection, selectedCollection, selector, function (err, result) {
        Template.renderAfterQueryExecution(err, result);
    });
};