/**
 * Created by RSercan on 29.12.2015.
 */
var jsonEditor;
var jsonEditorOptions = {
    mode: "tree",
    search: true
};

getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        jsonEditor = new JSONEditor(document.getElementById("jsoneditor"), jsonEditorOptions);
    }
    return jsonEditor;
}

Template.browseCollection.helpers({
    'getQueryTemplate': function () {
        if (!Session.get(strSessionSelectedQuery)) {
            Session.set(strSessionSelectedQuery, 'find')
        }

        return Session.get(strSessionSelectedQuery);
    }
});


Template.browseCollection.onRendered(function () {
    if (!Session.get(strSessionSelectedCollection)) {
        Router.go('browseDB');
        return;
    }

    var cmb = $('#cmbQueries');
    $.each(QUERY_TYPES, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
});

Template.browseCollection.events({
    'change #cmbQueries': function (e) {
        var value = $('#cmbQueries').find(":selected").text();
        if (value) {
            Session.set(strSessionSelectedQuery, value);
        }
    },

    'click #btnSwitchView': function (e) {
        var jsonView = $('#divJsonEditor');
        var aceView = $('#divAceEditor');

        if (jsonView.css('display') == 'none') {
            aceView.hide();
            jsonView.show('slow');
        } else {
            jsonView.hide();
            aceView.show('slow');
        }

    }
});