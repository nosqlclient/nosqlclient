var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.aggregate.onRendered(function () {
    Template.initializeCodeMirror($('#divPipeline'), 'txtPipeline');
    Template.changeConvertOptionsVisibility(true);
});

Template.aggregate.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var pipeline = historyParams ? JSON.stringify(historyParams.pipeline) : Template.getCodeMirrorValue($('#divPipeline'));

    pipeline = Template.convertAndCheckJSON(pipeline);
    if (pipeline["ERROR"]) {
        toastr.error("Syntax error on pipeline: " + pipeline["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        pipeline: pipeline
    };

    var convertIds = $('#aConvertObjectIds').iCheck('update')[0].checked;
    var convertDates = $('#aConvertIsoDates').iCheck('update')[0].checked;

    Meteor.call("aggregate", selectedCollection, pipeline, convertIds, convertDates,
        function (err, result) {
            Template.renderAfterQueryExecution(err, result, false, "aggregate", params, (historyParams ? false : true));
        }
    );
};