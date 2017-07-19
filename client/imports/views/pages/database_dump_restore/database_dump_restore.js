import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {Connections, Dumps} from "/lib/imports/collections";
import {FlowRouter} from "meteor/kadira:flow-router";
import {$} from "meteor/jquery";
import "./database_dump_restore.html";
import {getMongodumpArgs} from "./mongodump_options/mongodump_options";
import {getMongorestoreArgs} from "./mongorestore_options/mongorestore_options";
import {getMongoexportOptions} from "./mongoexport_options/mongoexport_options";
import {getMongoimportOptions} from "./mongoimport_options/mongoimport_options";
import "./common_options/common_options";
import Helper from "/client/imports/helper";

const Ladda = require('ladda');
const toastr = require('toastr');

const initializeArgsCombo = function (cmb, sessionVar) {
    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb, sessionVar);
};

const initializeLogsArea = function (div, txt) {
    Helper.initializeCodeMirror(div, txt, false, 150, true);
    div.data('editor').setOption("readOnly", true);
};

const initializeUI = function () {
    initializeArgsCombo($('#cmbMongodumpArgs'), Helper.strSessionMongodumpArgs);
    initializeArgsCombo($('#cmbMongorestoreArgs'), Helper.strSessionMongorestoreArgs);
    initializeArgsCombo($('#cmbMongoexportArgs'), Helper.strSessionMongoexportArgs);
    initializeArgsCombo($('#cmbMongoimportArgs'), Helper.strSessionMongoimportArgs);
    initializeLogsArea($('#mongodump'), 'txtMongodumpLogs');
    initializeLogsArea($('#mongorestore'), 'txtMongorestoreLogs');
    initializeLogsArea($('#mongoexport'), 'txtMongoexportLogs');
    initializeLogsArea($('#mongoimport'), 'txtMongoimportLogs');

    Session.set(Helper.strSessionMongodumpArgs, ['--host', '--out']);
    Session.set(Helper.strSessionMongorestoreArgs, ['--host', '--dir']);
    Session.set(Helper.strSessionMongoexportArgs, ['--host', '--out']);
    Session.set(Helper.strSessionMongoimportArgs, ['--host', '--file']);
};

const observeLogs = function () {
    Dumps.find({
        sessionId: Meteor.default_connection._lastSessionId,
    }, {sort: {date: -1}}).observeChanges({
        added: function (id, fields) {
            let divLogs = $('#' + fields.binary);

            if (fields.message === 'CLOSED') Ladda.stopAll();
            else {
                let editorResult = divLogs.data('editor');
                let previousValue = Helper.getCodeMirrorValue(divLogs);

                Helper.setCodeMirrorValue(divLogs, previousValue + fields.message);
                if (editorResult) {
                    editorResult.focus();
                    editorResult.setCursor(editorResult.lineCount() - 2, editorResult.getLine(editorResult.lineCount() - 2).length - 2);
                }

                if (divLogs.data('editor')) {
                    divLogs.data('editor').focus();
                }
            }
        }
    });
};

const clearLogs = function (binary) {
    Meteor.call("removeDumpLogs", Meteor.default_connection._lastSessionId, binary);
    Helper.setCodeMirrorValue($('#' + binary), '');
};

const callBinaryMethod = function (button, binary, argsMethod) {
    Ladda.create(document.querySelector(button)).start();
    const args = argsMethod();
    if (args === null) {
        Ladda.stopAll();
        return;
    }

    Meteor.call(binary, args, Meteor.default_connection._lastSessionId, function (err) {
        if (err) {
            Ladda.stopAll();
            Helper.showMeteorFuncError(err, null, "Couldn't proceed");
        }
    });
};

Template.databaseDumpRestore.onDestroyed(function () {
    Meteor.call("removeDumpLogs", Meteor.default_connection._lastSessionId);
});

Template.databaseDumpRestore.onRendered(function () {
    if (!Session.get(Helper.strSessionCollectionNames)) {
        FlowRouter.go('/databaseStats');
        return;
    }

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');
    let dumps = this.subscribe('dumps');

    initializeUI();

    this.autorun(() => {
        if (settings.ready() && connections.ready() && dumps.ready()) {

            $('#cmbMongodumpArgs').val(['--host', '--out']).trigger('chosen:updated');
            $('#cmbMongorestoreArgs').val(['--host', '--dir']).trigger('chosen:updated');
            $('#cmbMongoexportArgs').val(['--host', '--out']).trigger('chosen:updated');
            $('#cmbMongoimportArgs').val(['--host', '--file']).trigger('chosen:updated');

            // wait till --host input gets ready
            Meteor.setTimeout(function () {
                const connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
                let hostStr = "";
                for (let server of connection.servers) hostStr += server.host + ":" + server.port + ",";
                if (hostStr.endsWith(",")) hostStr = hostStr.substr(0, hostStr.length - 1);

                $('#mongodump--host').val(hostStr);
                $('#mongorestore--host').val(hostStr);
                $('#mongoexport--host').val(hostStr);
                $('#mongoimport--host').val(hostStr);
            }, 100);

            observeLogs();
        }
    });
});

Template.databaseDumpRestore.events({
    'click #btnExecuteMongodump'(){
        callBinaryMethod('#btnExecuteMongodump', 'mongodump', getMongodumpArgs);
    },

    'click #btnExecuteMongorestore'(){
        callBinaryMethod('#btnExecuteMongorestore', 'mongorestore', getMongorestoreArgs);
    },

    'click #btnExecuteMongoexport'(){
        callBinaryMethod('#btnExecuteMongoexport', 'mongoexport', getMongoexportOptions);
    },

    'click #btnExecuteMongoimport'(){
        callBinaryMethod('#btnExecuteMongoimport', 'mongoimport', getMongoimportOptions);
    },

    'click #btnClearMongoimportLogs'(){
        clearLogs('mongoimport');
    },

    'click #btnClearMongoexportLogs'(){
        clearLogs('mongoexport');
    },

    'click #btnClearMongodumpLogs'(){
        clearLogs('mongodump');
    },

    'click #btnClearMongorestoreLogs'(){
        clearLogs('mongorestore');
    }
});