/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndUpdate.onRendered(function () {
    Template.findOneAndUpdate.initializeOptions();
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

Template.findOneAndUpdate.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.findOneModifyOptions.getOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();
    var setObject = ace.edit("aceSet").getSession().getValue();

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

    Meteor.call("findOneAndUpdate", connection, selectedCollection, selector, setObject, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result,"findOneAndUpdate");
    });
};