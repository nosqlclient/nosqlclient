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
        });
    }
    else {
        toastr.error("Please enter new name !");
        Ladda.stopAll();
        return;
    }
};

Template.rename.getOptions = function () {
    var result = {};

    if ($.inArray("DROP_TARGET", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var dropTarget = $('#divDropTarget').iCheck('update')[0].checked;
        if (dropTarget) {
            result[RENAME_OPTIONS.DROP_TARGET] = dropTarget;
        }
    }
};