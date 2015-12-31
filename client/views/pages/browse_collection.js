/**
 * Created by RSercan on 29.12.2015.
 */
Template.browseCollection.onRendered(function () {
    if (!Session.get(Template.strSessionSelectedCollection)) {
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
            Session.set(Template.strSessionSelectedQuery, value);
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

Template.browseCollection.helpers({
    'getQueryTemplate': function () {
        if (!Session.get(Template.strSessionSelectedQuery)) {
            Session.set(Template.strSessionSelectedQuery, 'find')
        }

        return Session.get(Template.strSessionSelectedQuery);
    }
});