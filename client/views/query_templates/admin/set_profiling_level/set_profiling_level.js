/**
 * Created by RSercan on 10.1.2016.
 */
Template.setProfilingLevel.onRendered(function () {
    Template.setProfilingLevel.initializeOptions();
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
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var level = $('#cmbLevel').val();

    Meteor.call("setProfilingLevel", connection, level, function (err, result) {
        Template.renderAfterQueryExecution(err, result);
    });
};