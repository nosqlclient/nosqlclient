/**
 * Created by RSercan on 29.12.2015.
 */
Template.browseCollection.onRendered(function () {
    if (!Session.get(Template.strSessionSelectedCollection)) {
        Router.go('browseDB');
        return;
    }

    var cmb = $('#cmbQueries');
    cmb.append($("<optgroup id='optGroupCollectionQueries' label='Collection Queries'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupCollectionQueries');

    $.each(Template.sortObjectByKey(QUERY_TYPES), function (key, value) {
        cmbOptGroupCollection.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });
    cmb.chosen();

});

Template.browseCollection.events({
    'change #cmbQueries': function () {
        Session.set(Template.strSessionSelectedOptions, []);
        $('#divJsonEditor').hide();
        $('#divAceEditor').hide();

        var value = $('#cmbQueries').find(":selected").text();
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
    'click #btnExecuteQuery': function () {
        var queryTemplate = Session.get(Template.strSessionSelectedQuery);
        if (queryTemplate) {
            Template[queryTemplate].executeQuery();
        } else {
            toastr.warning('Select Query', 'Please select a query first ');
        }
    }
});

Template.browseCollection.helpers({
    'getQueryTemplate': function () {
        return Session.get(Template.strSessionSelectedQuery);
    },

    'getHelpBlockForSelectedQuery': function () {
        switch (Session.get(Template.strSessionSelectedQuery)) {
            case QUERY_TYPES.FINDONE_AND_REPLACE:
                return Spacebars.SafeString('This query replaces whole document which matched by <strong>selector</strong> with the <strong>set</strong> object');

            case QUERY_TYPES.FINDONE_AND_DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document which matched by <strong>selector</strong>');

            case QUERY_TYPES.CREATE_INDEX:
                return Spacebars.SafeString('Since mongodb version <strong>3.0.0</strong>, this query can be used instead of <strong>ensureIndex</strong>');

            case QUERY_TYPES.DELETE:
                return Spacebars.SafeString('<strong><font color=\'red\'>CAUTION:</font></strong> This query removes whole document(s) which matched by <strong>selector</strong>');

            case QUERY_TYPES.GEO_HAYSTACK_SEARCH:
                return Spacebars.SafeString('This query executes a geo search using a <strong>geo haystack index</strong> on a collection');

            case QUERY_TYPES.IS_CAPPED:
                return Spacebars.SafeString('Returns the information of if the collection is a <strong>capped</strong> collection');

            case QUERY_TYPES.OPTIONS:
                return Spacebars.SafeString('Returns <strong>collection</strong> options');

            case QUERY_TYPES.RE_INDEX:
                return Spacebars.SafeString('Reindex all indexes on the collection <strong>Warning:</strong> reIndex is a blocking operation <i>(indexes are rebuilt in the foreground)</i> and will be slow for large collections');

            case QUERY_TYPES.UPDATE_MANY:
                return Spacebars.SafeString('Updates all documents which matched by <strong>Selector</strong');

            default:
                return '';
        }
    }
});

Template.browseCollection.initExecuteQuery = function () {
    // hide results
    $('#divJsonEditor').hide();
    $('#divAceEditor').hide();

    // loading button
    var l = $('#btnExecuteQuery').ladda();
    l.ladda('start');
};

Template.browseCollection.setResult = function (result) {
    // set json editor
    Template.browseCollection.getEditor().set(result);

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