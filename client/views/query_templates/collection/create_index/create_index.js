/**
 * Created by RSercan on 2.1.2016.
 */
Template.createIndex.onRendered(function () {
    Template.initializeAceEditor('aceFields', Template.createIndex.executeQuery);
    Template.createIndex.initializeOptions();
});

Template.createIndex.initializeOptions = function () {
    var cmb = $('#cmbCreateIndexOptions');
    $.each(Template.sortObjectByKey(CREATE_INDEX_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.createIndex.executeQuery = function () {
    Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var options = Template.createIndexOptions.getOptions();
    var fields = ace.edit("aceFields").getSession().getValue();

    fields = Template.convertAndCheckJSON(fields);
    if (fields["ERROR"]) {
        toastr.error("Syntax error on index field: " + fields["ERROR"]);
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        fields: fields,
        options: options
    };

    Meteor.call("createIndex", connection, selectedCollection, fields, options, function (err, result) {
        Template.renderAfterQueryExecution(err, result, false, "createIndex", params);
    });
};