/**
 * Created by RSercan on 3.1.2016.
 */
Template.mapReduce.onRendered(function () {
    Template.mapReduce.initializeAceEditor('aceMap');
    Template.mapReduce.initializeAceEditor('aceReduce');
    Template.mapReduce.initializeOptions();
});

Template.mapReduce.initializeOptions = function () {
    var cmb = $('#cmbMapReduceOptions');
    $.each(Template.sortObjectByKey(MAP_REDUCE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.mapReduce.initializeAceEditor = function (id) {
    Tracker.autorun(function (e) {
        var editor = AceEditor.instance(id, {
            mode: "javascript",
            theme: 'dawn'
        });
        if (editor.loaded !== undefined) {
            e.stop();
            editor.$blockScrolling = Infinity;
            editor.getSession().setOption("useWorker", false);
            editor.setOptions({
                fontSize: "11pt",
                showPrintMargin: false
            });
        }
    });
};

Template.mapReduce.executeQuery = function (historyParams) {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : Template.mapReduceOptions.getOptions();
    var map = historyParams ? JSON.stringify(historyParams.map) : ace.edit("aceMap").getSession().getValue();
    var reduce = historyParams ? JSON.stringify(historyParams.reduce) : ace.edit("aceReduce").getSession().getValue();


    if (map.parseFunction() == null) {
        toastr.error("Syntax error on map, not a valid function ");
        Ladda.stopAll();
        return;
    }

    if (reduce.parseFunction() == null) {
        toastr.error("Syntax error on reduce, not a valid function ");
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        map: map,
        reduce: reduce,
        options: options
    };

    Meteor.call("mapReduce", connection, selectedCollection, map, reduce, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "mapReduce", params, (historyParams ? false : true));
    });
};