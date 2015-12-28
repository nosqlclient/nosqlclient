/**
 * Created by RSercan on 26.12.2015.
 */
var editor;

getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        editor = new JSONEditor(document.getElementById("jsoneditor"));
    }
    return editor;
}

Template.browseDB.helpers({
    'collectionNames': function () {
        return Session.get(strSessionCollectionNames);
    }
});

Template.browseDB.events({
    'click #btnExecuteQuery': function (e) {
        var connection = Connections.findOne({_id: Session.get(strSessionConnection)});
        var selectedCollection = Session.get(strSessionSelectedCollection);
        var query = 'db.' + selectedCollection + '.' + $('#inputQuery').val();

        Meteor.call('executeQuery', connection, query, function (err, result) {
            if (result.error) {
                toastr.error("Couldn't execute query: " + result.error.message);
                return;
            }

            console.log(result.result);
            getEditor().set(result.result);
        });
    }

});