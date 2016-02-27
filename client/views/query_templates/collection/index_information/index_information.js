/**
 * Created by RSercan on 3.1.2016.
 */
Template.indexInformation.onRendered(function () {
    $('#divFullInformation').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.indexInformation.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var fullVal = $('#divFullInformation').iCheck('update')[0].checked;

    var params = {
        full: fullVal
    };

    Meteor.call("indexInformation", connection, selectedCollection, fullVal, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "indexInformation", params);
    });
};