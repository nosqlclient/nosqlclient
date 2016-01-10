/**
 * Created by RSercan on 10.1.2016.
 */
Template.adminQueries.onRendered(function () {
    if (!Session.get(Template.strSessionConnection)) {
        Router.go('/browseDB');
        return;
    }

    var cmb = $('#cmbAdminQueries');
    cmb.append($("<optgroup id='optGroupAdminQueries' label='Admin Queries'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupAdminQueries');

    $.each(Template.sortObjectByKey(ADMIN_QUERY_TYPES), function (key, value) {
        cmbOptGroupCollection.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });
    cmb.chosen();
});


Template.adminQueries.events({
    'change #cmbAdminQueries': function () {
        Session.set(Template.strSessionSelectedOptions, []);
        $('#divJsonEditor').hide();
        $('#divAceEditor').hide();

        var value = $('#cmbAdminQueries').find(":selected").text();
        if (value) {
            Session.set(Template.strSessionSelectedQuery, value);
        }
    },

    'click #btnSwitchView': function () {
        var jsonView = $('#divJsonEditor');
        var aceView = $('#divAceEditor');

        if (jsonView.css('display') == 'none' && aceView.css('display') == 'none') {
            return;
        }

        if (jsonView.css('display') == 'none') {
            aceView.hide();
            jsonView.show('slow');
        } else {
            jsonView.hide();
            aceView.show('slow');
        }
    },
    'click #btnExecuteAdminQuery': function () {
        var queryTemplate = Session.get(Template.strSessionSelectedQuery);
        if (queryTemplate) {
            Template[queryTemplate].executeQuery();
        } else {
            toastr.warning('Select Query', 'Please select a query first ');
        }
    }
});

Template.adminQueries.helpers({
    'getQueryTemplate': function () {
        return Session.get(Template.strSessionSelectedQuery);
    },

    'getHelpBlockForSelectedQuery': function () {
        switch (Session.get(Template.strSessionSelectedQuery)) {
            case ADMIN_QUERY_TYPES.ADD_USER:
                return Spacebars.SafeString('Add a user to the database');

            default:
                return '';
        }
    }
});

Template.adminQueries.initExecuteQuery = function () {
    // hide results
    $('#divJsonEditor').hide();
    $('#divAceEditor').hide();

    // loading button
    var l = $('#btnExecuteAdminQuery').ladda();
    l.ladda('start');
};

Template.adminQueries.setResult = function (result) {
    // set json editor
    Template.adminQueries.getEditor().set(result);

    // set ace editor
    AceEditor.instance('aceeditor', {
        mode: 'javascript',
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            fontSize: '12pt',
            showPrintMargin: false
        });
        editor.setValue(JSON.stringify(result, null, '\t'), -1);
    });

    var settings = Settings.findOne();
    if (settings.defaultResultView == 'Jsoneditor') {
        $('#divJsonEditor').show('slow');
    }
    else {
        $('#divAceEditor').show('slow');
    }
};

var jsonEditor;
Template.browseCollection.getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        jsonEditor = new JSONEditor(document.getElementById('jsoneditor'), {
            mode: 'tree',
            modes: ['code', 'form', 'text', 'tree', 'view'],
            search: true
        });
    }
    return jsonEditor;
};