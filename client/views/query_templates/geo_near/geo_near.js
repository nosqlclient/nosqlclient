/**
 * Created by RSercan on 3.1.2016.
 */
Template.geoNear.onRendered(function () {
    Template.geoNear.initializeOptions();
});

Template.geoNear.initializeOptions = function () {
    var cmb = $('#cmbGeoNearOptions');
    $.each(GEO_NEAR_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.geoNear.executeQuery = function () {
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

    var options = Template.geoNearOptions.getOptions();
    if (options["ERROR"]) {
        toastr.error("Syntax error: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    Meteor.call("geoNear", connection, selectedCollection, xAxis, yAxis, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result);
    });
};