var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.geoNear.onRendered(function () {
    Template.geoNear.initializeOptions();
    Template.changeConvertOptionsVisibility(false);
});

Template.geoNear.initializeOptions = function () {
    var cmb = $('#cmbGeoNearOptions');
    $.each(Template.sortObjectByKey(GEO_NEAR_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.geoNear.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
    if (xAxis) {
        xAxis = parseInt(xAxis);
    }

    var yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
    if (yAxis) {
        yAxis = parseInt(yAxis);
    }

    var options = historyParams ? historyParams.options : Template.geoNearOptions.getOptions();
    if (options["ERROR"]) {
        toastr.error("Syntax error: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        xAxis: xAxis,
        yAxis: yAxis,
        options: options
    };

    Meteor.call("geoNear", selectedCollection, xAxis, yAxis, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "geoNear", params, (historyParams ? false : true));
    });
};