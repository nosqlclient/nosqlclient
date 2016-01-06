/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndDelete.onRendered(function () {
    Template.findOneAndDelete.initializeOptions();
});

Template.findOneAndDelete.initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(Template.sortObjectByKey(FINDONE_MODIFY_OPTIONS), function (key, value) {
        // upsert and returnOriginal is not for delete
        if (value != FINDONE_MODIFY_OPTIONS.UPSERT && value != FINDONE_MODIFY_OPTIONS.RETURN_ORIGINAL) {
            cmb.append($("<option></option>")
                .attr("value", key)
                .text(value));
        }
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndDelete.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.findOneModifyOptions.getOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("findOneAndDelete", connection, selectedCollection, selector, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result);
    });
};