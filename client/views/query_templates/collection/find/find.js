/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    Template.find.initializeOptions();
});

Template.find.initializeOptions = function () {
    var cmb = $('#cmbFindCursorOptions');
    $.each(Template.sortObjectByKey(CURSOR_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.find.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var cursorOptions = Template.cursorOptions.getCursorOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var maxAllowedFetchSize = Settings.findOne().maxAllowedFetchSize;

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("find", connection, selectedCollection, selector, cursorOptions, maxAllowedFetchSize, function (err, result) {
        Template.renderAfterQueryExecution(err, result);
    });
};