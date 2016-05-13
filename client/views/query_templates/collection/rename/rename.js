/**
 * Created by RSercan on 5.1.2016.
 */
Template.rename.onRendered(function () {
    Template.rename.initializeOptions();
    Template.changeConvertOptionsVisibility(false);
});

Template.dropTarget.onRendered(function () {
    $('#divDropTarget').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.rename.initializeOptions = function () {
    var cmb = $('#cmbRenameOptions');
    $.each(Template.sortObjectByKey(RENAME_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.rename.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.rename.getOptions();
    var newName = $('#inputNewName').val();

    if (newName == selectedCollection) {
        toastr.warning('Can not use same name as target name');
        Ladda.stopAll();
        return;
    }

    if (newName) {
        Meteor.call("rename", selectedCollection, newName, options, function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "rename");
            if (err == undefined && result.error == undefined) {
                Template.rename.renderCollectionnames(newName);
            }
        });
    }
    else {
        toastr.error("Please enter new name !");
        Ladda.stopAll();
    }
};

Template.rename.renderCollectionnames = function (newName) {
    Meteor.call('connect', Session.get(Template.strSessionConnection), function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't connect");
        } else {
            result.result.sort(function compare(a, b) {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            });

            // re-set collection names and selected collection
            Session.set(Template.strSessionCollectionNames, result.result);
            Session.set(Template.strSessionSelectedCollection, newName);

            // set all session values undefined except connection and collection
            Session.set(Template.strSessionSelectedQuery, undefined);
            Session.set(Template.strSessionSelectedOptions, undefined);
        }

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