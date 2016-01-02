/**
 * Created by RSercan on 2.1.2016.
 */
Template.geoHaystackSearch.onRendered(function () {
    Template.geoHaystackSearch.initializeOptions();
});

Template.geoHaystackSearch.initializeOptions = function () {
    var cmb = $('#cmbGeoHaystackSearchOptions');
    $.each(GEO_HAYSTACK_SEARCH_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.geoHaystackSearch.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var xAxis = $('#inputXAxis').val();
    if (xAxis) {
        xAxis = parseInt(xAxis);
    }

    var yAxis = $('#inputYAxis').val();
    if (yAxis) {
        yAxis = parseInt(yAxis);
    }

    var options = Template.geoHaystackSearchOptions.getOptions();

    if (options["ERROR"]) {
        toastr.error("Syntax error: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("geoHaystackSearch", connection, selectedCollection, xAxis, yAxis, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result);
    });
};