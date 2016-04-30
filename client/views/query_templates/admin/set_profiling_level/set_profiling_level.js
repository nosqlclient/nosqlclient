/**
 * Created by RSercan on 10.1.2016.
 */
Template.setProfilingLevel.onRendered(function () {
    Template.setProfilingLevel.initializeOptions();
    Template.changeConvertOptionsVisibility(false);
    Template.changeRunOnAdminOptionVisibility(false);
});

Template.setProfilingLevel.initializeOptions = function () {
    var cmb = $('#cmbLevel');
    $.each(Template.sortObjectByKey(PROFILING_LEVELS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", value)
            .text(key));
    });

    cmb.chosen();
};

Template.setProfilingLevel.executeQuery = function () {
    Template.adminQueries.initExecuteQuery();
    var level = $('#cmbLevel').val();

    Meteor.call("setProfilingLevel", Session.get(Template.strSessionConnection), level, function (err, result) {
        Template.renderAfterQueryExecution(err, result, true);
    });
};