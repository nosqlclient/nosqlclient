import { Notification, ErrorHandler, UIComponents, ExtendedJSON, SessionManager } from '/client/imports/modules';
import { QueryRender } from '/client/imports/ui';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '../../helpers/helper';

const Backup = function () {

};

Backup.prototype = {
  loadDatabases(prefix) {
    const cmb = $(`#${prefix}--db`);
    cmb.empty();
    cmb.prepend("<option value=''></option>");

    Notification.start('#btnExecuteMongodump');
    Notification.start('#btnExecuteMongorestore');
    Notification.start('#btnExecuteMongoexport');
    Notification.start('#btnExecuteMongoimport');

    Communicator.call({
      methodName: 'getDatabases',
      callback: (err, result) => {
        Helper.fillComboboxForDatabasesOrCollections({ cmb, err, result, cmbOptions: { allow_single_deselect: true } });
        Notification.stop();
      }
    });
  },

  loadCollectionsCombo(prefix) {
    Notification.start('#btnExecuteMongodump');
    Notification.start('#btnExecuteMongorestore');
    Notification.start('#btnExecuteMongoexport');
    Notification.start('#btnExecuteMongoimport');

    const cmb = $(`#${prefix}--collection`);
    cmb.empty();
    cmb.prepend("<option value=''></option>");
    const db = $(`#${prefix}--db`).val();
    if (!db) {
      cmb.chosen({
        create_option: true,
        allow_single_deselect: true,
        persistent_create_option: true,
        skip_no_results: true,
      });
      cmb.trigger('chosen:updated');
      Notification.stop();
      return;
    }

    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName: db },
      callback: (err, result) => {
        Helper.fillComboboxForDatabasesOrCollections({ cmb, err, result, cmbOptions: { allow_single_deselect: true } });
        Notification.stop();
      }
    });
  },

  observeLogs(sessionId) {
    ReactivityProvider.observeChanges(
      ReactivityProvider.types.Dumps,
      { sessionId },
      { sort: { date: -1 } },
      {
        added(id, fields) {
          const divLogs = $(`#${fields.binary}`);

          if (fields.message === 'CLOSED') Notification.stop();
          else {
            const editorResult = divLogs.data('editor');
            const previousValue = UIComponents.Editor.getCodeMirrorValue(divLogs);

            UIComponents.Editor.setCodeMirrorValue(divLogs, previousValue + fields.message);
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
  },

  clearLogs(binary) {
    Communicator.call({ methodName: 'removeDumpLogs', args: { binary } });
    UIComponents.Editor.setCodeMirrorValue($(`#${binary}`), '');
  },

  callBinaryMethod(button, binary, argsMethod) {
    Notification.start(button);
    const args = argsMethod();
    if (args === null) {
      Notification.stop();
      return;
    }
    Communicator.call({
      methodName: binary,
      args: { args },
      callback: (err) => { if (err) ErrorHandler.showMeteorFuncError(err, null); }
    });
  },

  initializeArgsCombo(cmb, sessionVar) {
    cmb.chosen();
    QueryRender.setOptionsComboboxChangeEvent(cmb, sessionVar);
  },

  initializeLogsArea(div, txt) {
    UIComponents.Editor.initializeCodeMirror({ divSelector: div, txtAreaId: txt, height: 150, noResize: true });
    div.data('editor').setOption('readOnly', true);
  },

  initializeUI() {
    this.initializeArgsCombo($('#cmbMongodumpArgs'), SessionManager.strSessionMongodumpArgs);
    this.initializeArgsCombo($('#cmbMongorestoreArgs'), SessionManager.strSessionMongorestoreArgs);
    this.initializeArgsCombo($('#cmbMongoexportArgs'), SessionManager.strSessionMongoexportArgs);
    this.initializeArgsCombo($('#cmbMongoimportArgs'), SessionManager.strSessionMongoimportArgs);
    this.initializeLogsArea($('#mongodump'), 'txtMongodumpLogs');
    this.initializeLogsArea($('#mongorestore'), 'txtMongorestoreLogs');
    this.initializeLogsArea($('#mongoexport'), 'txtMongoexportLogs');
    this.initializeLogsArea($('#mongoimport'), 'txtMongoimportLogs');

    SessionManager.set(SessionManager.strSessionMongodumpArgs, ['--host', '--out']);
    SessionManager.set(SessionManager.strSessionMongorestoreArgs, ['--host', '--dir']);
    SessionManager.set(SessionManager.strSessionMongoexportArgs, ['--host', '--out']);
    SessionManager.set(SessionManager.strSessionMongoimportArgs, ['--host', '--file']);
  },

  getMongodumpArgs() {
    const result = [];

    const args = $('#cmbMongodumpArgs').val();
    if (!args) return [];
    args.forEach((arg) => {
      const argElement = $(`#mongodump${arg}`);
      result.push(arg);

      if (arg === '--query') {
        let query = UIComponents.Editor.getCodeMirrorValue($('#mongodump--query'));
        query = ExtendedJSON.convertAndCheckJSON(query);
        if (query.ERROR) Notification.error('syntax-error-query', null, { error: query.ERROR });
        else result.push(JSON.stringify(query));
      } else if (argElement.length !== 0) result.push(argElement.val());
    });

    return result;
  },

  getMongoexportArgs() {
    let result = [];

    const args = $('#cmbMongoexportArgs').val();
    if (!args) return result;
    args.forEach((arg) => {
      const argElement = $(`#mongoexport${arg}`);
      result.push(arg);

      if (arg === '--query') {
        const query = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#mongoexport--query')));
        if (query.ERROR) {
          Notification.error('syntax-error-query', null, { error: query.ERROR });
          result = null;
        } else result.push(JSON.stringify(query));
      } else if (arg === '--sort') {
        const sort = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($('#mongoexport--sort')));
        if (sort.ERROR) {
          Notification.error('syntax-error-sort', null, { error: sort.ERROR });
          result = null;
        } else result.push(JSON.stringify(sort));
      } else if (argElement.length !== 0) result.push(argElement.val());
    });

    return result;
  },

  getMongorestoreArgs() {
    const result = [];

    const args = $('#cmbMongorestoreArgs').val();
    if (!args) return result;
    args.forEach((arg) => {
      const argElement = $(`#mongorestore${arg}`);
      result.push(arg);

      if (argElement.length !== 0) result.push(argElement.val());
    });

    return result;
  },

  getMongoimportArgs() {
    const result = [];

    const args = $('#cmbMongoimportArgs').val();
    if (!args) return result;
    args.forEach((arg) => {
      const argElement = $(`#mongoimport${arg}`);
      result.push(arg);

      if (argElement.length !== 0) result.push(argElement.val());
    });

    return result;
  },

  removeDumpLogs() {
    Communicator.call({ methodName: 'removeDumpLogs' });
  },

  init(sessionId) {
    $('#cmbMongodumpArgs').val(['--host', '--out']).trigger('chosen:updated');
    $('#cmbMongorestoreArgs').val(['--host', '--dir']).trigger('chosen:updated');
    $('#cmbMongoexportArgs').val(['--host', '--out']).trigger('chosen:updated');
    $('#cmbMongoimportArgs').val(['--host', '--file']).trigger('chosen:updated');

    // wait till --host input gets ready
    setTimeout(() => {
      const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
      let hostStr = '';
      connection.servers.forEach((server) => { hostStr += `${server.host}:${server.port},`; });
      if (hostStr.endsWith(',')) hostStr = hostStr.substr(0, hostStr.length - 1);

      $('#mongodump--host').val(hostStr);
      $('#mongorestore--host').val(hostStr);
      $('#mongoexport--host').val(hostStr);
      $('#mongoimport--host').val(hostStr);
    }, 100);

    this.observeLogs(sessionId);
  }
};

export default new Backup();
