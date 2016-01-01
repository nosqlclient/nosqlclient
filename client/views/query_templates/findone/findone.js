/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOne.onRendered(function () {
    Template.initializeAceEditor('preSelector', Template.findOne.executeQuery);
    Template.findOne.initializeOptions();
});

Template.findOne.initializeOptions = function () {
    var cmb = $('#cmbFindOneCursorOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
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
    var laddaButton = Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var cursorOptions = Template.find.getCursorOptions();
    var selector = ace.edit("preSelector").getSession().getValue();

    if (!selector) {
        selector = {};
    }
    else {
        try {
            selector = JSON.parse(selector);
        }
        catch (err) {
            toastr.error("Syntax error on selector: " + err.message);
            laddaButton.ladda('stop');
            return;
        }
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    Meteor.call("findOne", connection, selectedCollection, selector, cursorOptions, function (err, result) {
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