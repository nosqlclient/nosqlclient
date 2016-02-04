/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndReplace.onRendered(function () {
    Template.findOneAndReplace.initializeAceEditor();
    Template.findOneAndReplace.initializeOptions();
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

Template.findOneAndReplace.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.findOneModifyOptions.getOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var replaceObject = ace.edit("aceReplacement").getSession().getValue();

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

    Meteor.call("findOneAndReplace", connection, selectedCollection, selector, replaceObject, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "findOneAndReplace");
    });
};