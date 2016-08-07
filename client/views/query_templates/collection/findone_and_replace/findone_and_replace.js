var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndReplace.onRendered(function () {
    Template.findOneAndReplace.initializeAceEditor();
    Template.findOneAndReplace.initializeOptions();
    Template.changeConvertOptionsVisibility(true);
});

Template.findOneAndReplace.initializeAceEditor = function () {
    AceEditor.instance('aceReplacement', {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false
        });
    });
};

Template.findOneAndReplace.initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(Template.sortObjectByKey(FINDONE_MODIFY_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndReplace.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : Template.findOneModifyOptions.getOptions();
    var selector = historyParams ? JSON.stringify(historyParams.selector) : Template.selector.getValue();
    var replaceObject = historyParams ? JSON.stringify(historyParams.replaceObject) : ace.edit("aceReplacement").getSession().getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    replaceObject = Template.convertAndCheckJSON(replaceObject);
    if (replaceObject["ERROR"]) {
        toastr.error("Syntax error on set: " + replaceObject["ERROR"]);
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
        replaceObject: replaceObject,
        options: options
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("findOneAndReplace", selectedCollection, selector, replaceObject, options, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "findOneAndReplace", params, (historyParams ? false : true));
        }
    );
};