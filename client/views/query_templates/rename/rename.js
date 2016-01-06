/**
 * Created by RSercan on 5.1.2016.
 */
Template.rename.onRendered(function () {
    Template.rename.initializeOptions();
});

Template.dropTarget.onRendered(function () {
    $('#divDropTarget').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.rename.initializeOptions = function () {
    var cmb = $('#cmbRenameOptions');
    $.each(RENAME_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.rename.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.rename.getOptions();
    var newName = $('#inputNewName').val();

    if (newName) {
        Meteor.call("rename", connection, selectedCollection, newName, options, function (err, result) {
            Template.renderAfterQueryExecution(err, result);
            if (err == undefined && result.error == undefined) {
                Template.rename.renderCollectionnames(newName);
            }
        });
    }
    else {
        toastr.error("Please enter new name !");
        Ladda.stopAll();
        return;
    }
};

Template.rename.renderCollectionnames = function (newName) {
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    Meteor.call('connect', connection, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }

            toastr.error("Couldn't connect: " + errorMessage);
            return;
        }

        // re-set collection names and selected collection
        Session.set(Template.strSessionCollectionNames, result.result);
        Session.set(Template.strSessionSelectedCollection, newName);

        // set all session values undefined except connection and collection
        Session.set(Template.strSessionSelectedQuery, undefined);
        Session.set(Template.strSessionSelectedOptions, undefined);
    });
};

Template.rename.getOptions = function () {
    var result = {};
    if ($.inArray("DROP_TARGET", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var dropTarget = $('#divDropTarget').iCheck('update')[0].checked;
        if (dropTarget) {
            result[RENAME_OPTIONS.DROP_TARGET] = dropTarget;
        }
    }

    return result;
};