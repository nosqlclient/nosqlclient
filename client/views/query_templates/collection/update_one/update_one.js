/**
 * Created by sercan on 06.01.2016.
 */
Template.updateOne.onRendered(function () {
    Template.updateOne.initializeOptions();
});

Template.updateOne.initializeOptions = function () {
    var cmb = $('#cmbUpdateOneOptions');
    $.each(Template.sortObjectByKey(UPDATE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.updateOne.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.updateOne.getOptions();
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

    Meteor.call("updateOne", connection, selectedCollection, selector, setObject, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, "updateOne");
    });
};

Template.updateOne.getOptions = function () {
    var result = {};

    if ($.inArray("UPSERT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[UPDATE_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};