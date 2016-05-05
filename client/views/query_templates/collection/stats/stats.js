/**
 * Created by sercan on 06.01.2016.
 */
Template.stats.onRendered(function () {
    Template.stats.initializeOptions();
    Template.changeConvertOptionsVisibility(false);
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

Template.stats.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : Template.stats.getOptions();

    var params = {
        options: options
    };

    Meteor.call("stats", selectedCollection, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "stats", params, (historyParams ? false : true));
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