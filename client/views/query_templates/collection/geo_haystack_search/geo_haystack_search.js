var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.geoHaystackSearch.onRendered(function () {
    Template.geoHaystackSearch.initializeOptions();
    Template.changeConvertOptionsVisibility(false);
});

Template.geoHaystackSearch.initializeOptions = function () {
    var cmb = $('#cmbGeoHaystackSearchOptions');
    $.each(Template.sortObjectByKey(GEO_HAYSTACK_SEARCH_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.geoHaystackSearch.executeQuery = function (historyParams) {
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

    var options = historyParams ? historyParams.options : Template.geoHaystackSearchOptions.getOptions();

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

    Meteor.call("geoHaystackSearch", selectedCollection, xAxis, yAxis, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "geoHaystackSearch", params, (historyParams ? false : true));
    });
};