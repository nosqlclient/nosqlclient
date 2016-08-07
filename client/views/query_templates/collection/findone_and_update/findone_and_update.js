var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndUpdate.onRendered(function () {
    Template.findOneAndUpdate.initializeOptions();
    Template.changeConvertOptionsVisibility(true);
});

Template.findOneAndUpdate.initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(Template.sortObjectByKey(FINDONE_MODIFY_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndUpdate.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : Template.findOneModifyOptions.getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : Template.selector.getValue();
    var setObject = historyParams ? JSON.stringify(historyParams.setObject) : ace.edit("aceSet").getSession().getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    setObject = Template.convertAndCheckJSON(setObject);
    if (setObject["ERROR"]) {
        toastr.error("Syntax error on set: " + setObject["ERROR"]);
        Ladda.stopAll();
        return;
    }
    setObject = {"$set": setObject};

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector,
        setObject: setObject,
        options: options
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("findOneAndUpdate", selectedCollection, selector, setObject, options, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "findOneAndUpdate", params, (historyParams ? false : true));
        }
    );
};