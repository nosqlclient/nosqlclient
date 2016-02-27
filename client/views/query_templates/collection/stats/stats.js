/**
 * Created by sercan on 06.01.2016.
 */
Template.stats.onRendered(function () {
    Template.stats.initializeOptions();
});

Template.scale.onRendered(function () {
    $('#divScale').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.stats.initializeOptions = function () {
    var cmb = $('#cmbStatsOptions');
    $.each(Template.sortObjectByKey(STATS_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.stats.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.stats.getOptions();

    var params = {
        options: options
    };

    Meteor.call("stats", connection, selectedCollection, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "stats", params);
    });
};

Template.stats.getOptions = function () {
    var result = {};

    if ($.inArray("SCALE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var scale = $('#inputScale').val();
        if (scale) {
            result[STATS_OPTIONS.SCALE] = parseInt(scale);
        }
    }

    return result;
};