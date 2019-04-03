import { ErrorHandler, ExtendedJSON, Notification, SessionManager, UIComponents } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '/client/imports/facades';
import $ from 'jquery';
import Helper from '../../helpers/helper';

const getArgs = function (operation) {
  let result = [];

  const args = $(`#cmbMongo${operation}Args`).val();
  if (!args) return result;
  args.forEach((arg) => {
    const argElement = $(`#mongo${operation}${arg}`);
    result.push(arg);

    if (arg === '--query') {
      const query = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($(`#mongo${operation}--query`)));
      if (query.ERROR) {
        Notification.error('syntax-error-query', null, { error: query.ERROR });
        result = null;
      } else result.push(JSON.stringify(query));
    } else if (arg === '--sort') {
      const sort = ExtendedJSON.convertAndCheckJSON(UIComponents.Editor.getCodeMirrorValue($(`#mongo${operation}--sort`)));
      if (sort.ERROR) {
        Notification.error('syntax-error-sort', null, { error: sort.ERROR });
        result = null;
      } else result.push(JSON.stringify(sort));
    } else if (argElement.length !== 0) result.push(argElement.val());
  });

  return result;
};

const loadCombobox = function (err, result, selector) {
  let data;
  if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
  else data = Helper.populateComboboxData(result.result, 'name');

  UIComponents.Combobox.init({ selector, data });
  Notification.stop();
};

const startNotifications = function () {
  Notification.start('#btnExecuteMongodump');
  Notification.start('#btnExecuteMongorestore');
  Notification.start('#btnExecuteMongoexport');
  Notification.start('#btnExecuteMongoimport');
};

const observeLogs = function (sessionId) {
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

          if (divLogs.data('editor')) divLogs.data('editor').focus();
        }
      },
    });
};

const initializeArgsCombo = function (selectorSessionPairs) {
  selectorSessionPairs.forEach((pair) => {
    UIComponents.Combobox.init({ selector: pair.selector, empty: false, options: {} });
    UIComponents.Combobox.setOptionsComboboxChangeEvent(pair.selector, pair.sessionKey);
  });
};

const initializeLogsArea = function (divTxtPairs) {
  divTxtPairs.forEach((pair) => {
    UIComponents.Editor.initializeCodeMirror({ divSelector: pair.div, txtAreaId: pair.txt, height: 150, noResize: true });
    pair.div.data('editor').setOption('readOnly', true);
  });
};

const Backup = function () {
  this.binaries = ['mongoimport', 'mongoexport', 'mongodump', 'mongorestore'];
};

Backup.prototype = {
  loadDatabases(prefix) {
    const selector = $(`#${prefix}--db`);
    if (selector.length === 0) return;

    startNotifications();

    Communicator.call({
      methodName: 'getDatabases',
      callback: (err, result) => {
        loadCombobox(err, result, selector);
      }
    });
  },

  loadCollectionsCombo(prefix) {
    const selector = $(`#${prefix}--collection`);
    if (selector.length === 0) return;

    startNotifications();

    const dbName = $(`#${prefix}--db`).val();
    if (!dbName) {
      UIComponents.Combobox.init({ selector });
      Notification.stop();
      return;
    }

    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName },
      callback: (err, result) => {
        loadCombobox(err, result, selector);
      }
    });
  },

  clearLogs(binary) {
    if (this.binaries.indexOf(binary) === -1) return;

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

  initializeUI() {
    initializeArgsCombo([
      { selector: $('#cmbMongodumpArgs'), sessionKey: SessionManager.strSessionMongodumpArgs },
      { selector: $('#cmbMongorestoreArgs'), sessionKey: SessionManager.strSessionMongorestoreArgs },
      { selector: $('#cmbMongoexportArgs'), sessionKey: SessionManager.strSessionMongoexportArgs },
      { selector: $('#cmbMongoimportArgs'), sessionKey: SessionManager.strSessionMongoimportArgs },
    ]);
    initializeLogsArea([
      { div: $('#mongodump'), txt: 'txtMongodumpLogs' },
      { div: $('#mongorestore'), txt: 'txtMongorestoreLogs' },
      { div: $('#mongoexport'), txt: 'txtMongoexportLogs' },
      { div: $('#mongoimport'), txt: 'txtMongoimportLogs' }
    ]);

    SessionManager.set(SessionManager.strSessionMongodumpArgs, ['--host', '--out']);
    SessionManager.set(SessionManager.strSessionMongorestoreArgs, ['--host', '--dir']);
    SessionManager.set(SessionManager.strSessionMongoexportArgs, ['--host', '--out']);
    SessionManager.set(SessionManager.strSessionMongoimportArgs, ['--host', '--file']);
  },

  getMongodumpArgs() {
    return getArgs('dump');
  },

  getMongoexportArgs() {
    return getArgs('export');
  },

  getMongorestoreArgs() {
    return getArgs('restore');
  },

  getMongoimportArgs() {
    return getArgs('import');
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

    observeLogs(sessionId);
  }
};

export default new Backup();
