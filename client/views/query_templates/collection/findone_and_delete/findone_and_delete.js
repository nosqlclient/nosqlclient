var toastr = require('toastr');
/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndDelete.onRendered(function () {
    Template.findOneAndDelete.initializeOptions();
    Template.changeConvertOptionsVisibility(true);
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

Template.findOneAndDelete.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : Template.findOneModifyOptions.getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : Template.selector.getValue();

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

    var params = {
        selector: selector,
        options: options
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("findOneAndDelete", selectedCollection, selector, options , convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "findOneAndDelete", params, (historyParams ? false : true));
        }
    );
};