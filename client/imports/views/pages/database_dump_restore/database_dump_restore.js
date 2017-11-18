import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Connections, Dumps } from '/lib/imports/collections';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import './database_dump_restore.html';
import { getMongodumpArgs } from './mongodump_options/mongodump_options';
import { getMongorestoreArgs } from './mongorestore_options/mongorestore_options';
import { getMongoexportOptions } from './mongoexport_options/mongoexport_options';
import { getMongoimportOptions } from './mongoimport_options/mongoimport_options';
import Helper from '/client/imports/helper';
import { Communicator } from '/client/imports/facades';
import './common_options/common_options';

const Ladda = require('ladda');
const toastr = require('toastr');

const initializeArgsCombo = function (cmb, sessionVar) {
  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb, sessionVar);
};

const initializeLogsArea = function (div, txt) {
  Helper.initializeCodeMirror(div, txt, false, 150, true);
  div.data('editor').setOption('readOnly', true);
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
  }, { sort: { date: -1 } }).observeChanges({
    added(id, fields) {
      const divLogs = $(`#${fields.binary}`);

      if (fields.message === 'CLOSED') Ladda.stopAll();
      else {
        const editorResult = divLogs.data('editor');
        const previousValue = Helper.getCodeMirrorValue(divLogs);

        Helper.setCodeMirrorValue(divLogs, previousValue + fields.message);
        if (editorResult) {
          editorResult.focus();
          editorResult.setCursor(editorResult.lineCount() - 2, editorResult.getLine(editorResult.lineCount() - 2).length - 2);
        }

        if (divLogs.data('editor')) {
          divLogs.data('editor').focus();
        }
      }
    },
  });
};

const clearLogs = function (binary) {
  Communicator.call({ methodName: 'removeDumpLogs', args: { binary } });
  Helper.setCodeMirrorValue($(`#${binary}`), '');
};

const callBinaryMethod = function (button, binary, argsMethod) {
  Ladda.create(document.querySelector(button)).start();
  const args = argsMethod();
  if (args === null) {
    Ladda.stopAll();
    return;
  }
  Communicator.call({
    methodName: binary,
    args: { args },
    callback: (err) => {
      if (err) {
        Ladda.stopAll();
        Helper.showMeteorFuncError(err, null, "Couldn't proceed");
      }
    }
  });
};

Template.databaseDumpRestore.onDestroyed(() => {
  Communicator.call({ methodName: 'removeDumpLogs' });
});

Template.databaseDumpRestore.onRendered(function () {
  if (!Session.get(Helper.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');
  const dumps = this.subscribe('dumps');

  initializeUI();

  this.autorun(() => {
    if (settings.ready() && connections.ready() && dumps.ready()) {
      $('#cmbMongodumpArgs').val(['--host', '--out']).trigger('chosen:updated');
      $('#cmbMongorestoreArgs').val(['--host', '--dir']).trigger('chosen:updated');
      $('#cmbMongoexportArgs').val(['--host', '--out']).trigger('chosen:updated');
      $('#cmbMongoimportArgs').val(['--host', '--file']).trigger('chosen:updated');

      // wait till --host input gets ready
      Meteor.setTimeout(() => {
        const connection = Connections.findOne({ _id: Session.get(Helper.strSessionConnection) });
        let hostStr = '';
        for (const server of connection.servers) hostStr += `${server.host}:${server.port},`;
        if (hostStr.endsWith(',')) hostStr = hostStr.substr(0, hostStr.length - 1);

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
  'click #btnExecuteMongodump': function () {
    callBinaryMethod('#btnExecuteMongodump', 'mongodump', getMongodumpArgs);
  },

  'click #btnExecuteMongorestore': function () {
    callBinaryMethod('#btnExecuteMongorestore', 'mongorestore', getMongorestoreArgs);
  },

  'click #btnExecuteMongoexport': function () {
    callBinaryMethod('#btnExecuteMongoexport', 'mongoexport', getMongoexportOptions);
  },

  'click #btnExecuteMongoimport': function () {
    callBinaryMethod('#btnExecuteMongoimport', 'mongoimport', getMongoimportOptions);
  },

  'click #btnClearMongoimportLogs': function () {
    clearLogs('mongoimport');
  },

  'click #btnClearMongoexportLogs': function () {
    clearLogs('mongoexport');
  },

  'click #btnClearMongodumpLogs': function () {
    clearLogs('mongodump');
  },

  'click #btnClearMongorestoreLogs': function () {
    clearLogs('mongorestore');
  },
});
