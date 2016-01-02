/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndReplace.onRendered(function () {
    Template.initializeAceEditor('aceSelector', Template.findOneAndReplace.executeQuery);
    Template.initializeAceEditor('aceReplacement', Template.findOneAndReplace.executeQuery);
    Template.findOneAndReplace.initializeOptions();
});

Template.findOneAndReplace.initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(FINDONE_MODIFY_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndReplace.executeQuery = function () {
    var laddaButton = Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.findOneModifyOptions.getOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var replaceObject = ace.edit("aceReplacement").getSession().getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    replaceObject = Template.convertAndCheckJSON(replaceObject);
    if (replaceObject["ERROR"]) {
        toastr.error("Syntax error on set: " + replaceObject["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    Meteor.call("findOneAndReplace", connection, selectedCollection, selector, replaceObject, options, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }
            toastr.error("Couldn't execute query: " + errorMessage);
            // stop loading animation
            laddaButton.ladda('stop');
            return;
        }

        Template.browseCollection.setResult(result.result);
        // stop loading animation
        laddaButton.ladda('stop');
    });
};