import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {Settings} from '/lib/imports/collections/settings';
import Enums from '/lib/imports/enums';

import './admin_queries.html';

var toastr = require('toastr');
var Ladda = require('ladda');
var JSONEditor = require('jsoneditor');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.adminQueries.onRendered(function () {
    if (Session.get(Helper.strSessionCollectionNames) == undefined) {
        Router.go('databaseStats');
        return;
    }

    var cmb = $('#cmbAdminQueries');
    cmb.append($("<optgroup id='optGroupAdminQueries' label='Admin Queries'></optgroup>"));
    var cmbOptGroupCollection = cmb.find('#optGroupAdminQueries');

    $.each(Helper.sortObjectByKey(Enums.ADMIN_QUERY_TYPES), function (key, value) {
        cmbOptGroupCollection.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });
    cmb.chosen();

    $('#aConvertIsoDates, #aConvertObjectIds, #aRunOnAdminDB').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
    Helper.changeConvertOptionsVisibility(false);
});


Template.adminQueries.events({
    'change #cmbAdminQueries'  () {
        Session.set(Helper.strSessionSelectedOptions, []);

        var value = $('#cmbAdminQueries').find(":selected").text();
        if (value) {
            Session.set(Helper.strSessionSelectedQuery, value);
        }
    },

    'click #btnSwitchView'  () {
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
    'click #btnExecuteAdminQuery'() {
        var queryTemplate = Session.get(Helper.strSessionSelectedQuery);
        if (queryTemplate) {
            Template[queryTemplate].executeQuery();
        } else {
            toastr.warning('Select Query', 'Please select a query first ');
        }
    }
});

Template.adminQueries.helpers({
    'getQueryTemplate' () {
        return Session.get(Helper.strSessionSelectedQuery);
    },

    'getHelpBlockForSelectedQuery' () {
        switch (Session.get(Helper.strSessionSelectedQuery)) {
            case Enums.ADMIN_QUERY_TYPES.ADD_USER:
                return Spacebars.SafeString('Add a user to the database');

            case Enums.ADMIN_QUERY_TYPES.BUILD_INFO:
                return Spacebars.SafeString('Retrieve the server information for the current instance of the db client');

            case Enums.ADMIN_QUERY_TYPES.LIST_DATABASES:
                return Spacebars.SafeString('List the available databases');

            case Enums.ADMIN_QUERY_TYPES.COMMAND:
                return Spacebars.SafeString('Execute a command');

            case Enums.ADMIN_QUERY_TYPES.PING:
                return Spacebars.SafeString('Ping the server and retrieve results');

            case Enums.ADMIN_QUERY_TYPES.PROFILING_INFO:
                return Spacebars.SafeString('Retrive the current profiling information');

            case Enums.ADMIN_QUERY_TYPES.REPL_SET_GET_STATUS:
                return Spacebars.SafeString('Get <strong>ReplicaSet</strong> status');

            case Enums.ADMIN_QUERY_TYPES.SERVER_STATUS:
                return Spacebars.SafeString('Retrieve this <strong>db\'s</strong> server status.');

            case Enums.ADMIN_QUERY_TYPES.SET_PROFILING_LEVEL:
                return Spacebars.SafeString('Set the current profiling level');

            case Enums.ADMIN_QUERY_TYPES.VALIDATE_COLLECTION:
                return Spacebars.SafeString('Validate an existing collection');

            default:
                return '';
        }
    }
});

export const initExecuteQuery = function () {
    var l = Ladda.create(document.querySelector('#btnExecuteAdminQuery'));
    l.start();
};

export const setAdminResult = function (result) {
    // set json editor
    getEditor().set(result);

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

    var jsonEditor = $('#divJsonEditor');
    var aceEditor = $('#divAceEditor');
    if (jsonEditor.css('display') == 'none' && aceEditor.css('display') == 'none') {
        var settings = Settings.findOne();
        if (settings.defaultResultView == 'Jsoneditor') {
            jsonEditor.show('slow');
        }
        else {
            aceEditor.show('slow');
        }
    }
};

var jsonEditor;
const getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        jsonEditor = new JSONEditor(document.getElementById('jsoneditor'), {
            mode: 'tree',
            modes: ['code', 'form', 'text', 'tree', 'view'],
            search: true
        });
    }
    return jsonEditor;
};