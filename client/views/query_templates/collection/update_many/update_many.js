/**
 * Created by sercan on 06.01.2016.
 */
Template.updateMany.onRendered(function () {
    Template.updateMany.initializeOptions();
    Template.changeConvertOptionsVisibility(true);
});

Template.updateMany.initializeOptions = function () {
    var cmb = $('#cmbUpdateManyOptions');
    $.each(Template.sortObjectByKey(UPDATE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.updateMany.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : Template.updateMany.getOptions();
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

    Meteor.call("updateMany", Session.get(Template.strSessionConnection), selectedCollection, selector, setObject, options, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "updateMany", params, (historyParams ? false : true));
        }
    );
};

Template.updateMany.getOptions = function () {
    var result = {};

    if ($.inArray("UPSERT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[UPDATE_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};