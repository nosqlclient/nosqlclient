/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndUpdate.onRendered(function () {
    Template.initializeAceEditor('aceSelector', Template.findOneAndUpdate.executeQuery);
    Template.initializeAceEditor('aceSet', Template.findOneAndUpdate.executeQuery);
    Template.findOneAndUpdate.initializeOptions();
});

Template.findOneAndUpdate.initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(FINDONE_MODIFY_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndUpdate.executeQuery = function () {
    var laddaButton = Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.findOneAndUpdate.getOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var setObject = ace.edit("aceSet").getSession().getValue();

    selector = Template.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    setObject = Template.convertAndCheckJSON(setObject);
    if (setObject["ERROR"]) {
        toastr.error("Syntax error on set: " + setObject["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    Meteor.call("findOneAndUpdate", connection, selectedCollection, selector, setObject, options, function (err, result) {
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

Template.findOneAndUpdate.getOptions = function () {
    var result = {};



    return result;
};