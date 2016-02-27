/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOne.onRendered(function () {
    Template.findOne.initializeOptions();
});

Template.findOne.initializeOptions = function () {
    var cmb = $('#cmbFindOneCursorOptions');
    $.each(Template.sortObjectByKey(CURSOR_OPTIONS), function (key, value) {
        // dont add limit, it will be 1 already
        if (value != CURSOR_OPTIONS.LIMIT) {
            cmb.append($("<option></option>")
                .attr("value", key)
                .text(value));
        }
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOne.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var cursorOptions = Template.cursorOptions.getCursorOptions();
    var selector = Template.selector.getValue();

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

    var params = {
        selector: selector,
        cursorOptions: cursorOptions
    };

    Meteor.call("findOne", connection, selectedCollection, selector, cursorOptions, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "findOne", params);
    });
};