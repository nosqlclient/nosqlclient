import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactivityProvider, Communicator } from '/client/imports/facades';
import { UIComponents, SessionManager, Notification, ErrorHandler } from '/client/imports/modules';
import $ from 'jquery';
import ConnectionHelper from './helper';
import Helper from '/client/imports/helpers/helper';

require('bootstrap-filestyle');

const Connection = function () {
  this.selectedAuthType = ConnectionHelper.selectedAuthType;
};

const sortArrayByName = function (obj) {
  obj.sort((a, b) => {
    if (a.name < b.name) { return -1; } if (a.name > b.name) { return 1; }
    return 0;
  });
};

Connection.prototype = {
  prepareModal(modalTitle, editOrClone) {
    $('#addEditConnectionModalTitle').text(Helper.translate({ key: modalTitle }));
    const modal = $('#addEditConnectionModal');
    modal.data('edit', editOrClone === 'edit' ? SessionManager.get(SessionManager.strSessionConnection)._id : '');
    modal.data('clone', editOrClone === 'clone' ? SessionManager.get(SessionManager.strSessionConnection)._id : '');
    modal.modal('show');
  },

  disconnect() {
    Communicator.call({ methodName: 'disconnect' });
    SessionManager.clear();
    FlowRouter.go('/databaseStats');
  },

  prepareContextMenu() {
    const self = this;
    $.contextMenu({
      selector: '.connection_row',
      items: {
        colorize: {
          name: Helper.translate({ key: 'colorize' }),
          icon: 'fa-image',
          callback(itemKey, opt) {
            const row = $('#tblConnection').DataTable().row(opt.$trigger[0]);
            const modal = $('#colorizeModal');
            modal.data('connection', row.data()._id);
            modal.modal('show');
          }
        },
        clear_color: {
          name: Helper.translate({ key: 'clear-color' }),
          icon: 'fa-times-circle',
          callback(itemKey, opt) {
            const row = $('#tblConnection').DataTable().row(opt.$trigger[0]);
            if (row && row.data()) {
              const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: row.data()._id });
              connection.color = '';

              Communicator.call({
                methodName: 'saveConnection',
                args: { connection },
                callback: (err, result) => {
                  if (err || (result && result.error)) ErrorHandler.showMeteorFuncError(err, result);
                  else {
                    self.populateConnectionsTable();
                    Notification.success('saved-successfully');
                  }
                }
              });
            }
          }
        }
      }
    });
  },

  prepareColorizeModal() {
    const input = $('#inputColor');
    input.colorpicker({
      align: 'left',
      format: 'hex'
    });
    const colorizeModal = $('#colorizeModal');
    colorizeModal.on('shown.bs.modal', () => {
      const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: colorizeModal.data('connection') });
      input.colorpicker('setValue', connection.color);
    });
  },

  colorize() {
    const color = $('#inputColor');
    const connectionId = $('#colorizeModal').data('connection');
    if (!color.val()) {
      Notification.error('color-required');
      return;
    }

    if (!connectionId) {
      Notification.error('select-connection');
      return;
    }

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: connectionId });
    connection.color = color.val();

    Communicator.call({
      methodName: 'saveConnection',
      args: { connection },
      callback: (err, result) => {
        if (err || (result && result.error)) ErrorHandler.showMeteorFuncError(err, result);
        else {
          Notification.success('saved-successfully');
          this.populateConnectionsTable();
        }
      }
    });
  },

  switchDatabase() {
    const selector = $('#inputDatabaseNameToSwitch');
    if (!selector.val()) {
      Notification.error('enter_or_choose_database');
      return;
    }

    Notification.start('#btnConnectSwitchedDatabase');
    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    connection.databaseName = selector.val();

    Communicator.call({
      methodName: 'saveConnection',
      args: { connection },
      callback: (err, result) => {
        if (err || (result && result.error)) ErrorHandler.showMeteorFuncError(err, result);
        else this.connect(false);
      }
    });
  },

  showSwitchDatabaseModal() {
    $('#switchDatabaseModal').modal('show');

    Notification.start('#btnConnectSwitchedDatabase');

    Communicator.call({
      methodName: 'listDatabases',
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          sortArrayByName(result.result.databases);

          UIComponents.DataTable.setupDatatable({
            selectorString: '#tblSwitchDatabases',
            columns: [{ data: 'name' }],
            data: result.result.databases
          });

          $('#tblSwitchDatabases').find('tbody').on('dblclick', 'tr', () => {
            this.switchDatabase();
          });

          Notification.stop();
        }
      }
    });
  },

  setupFormForUri() {
    const url = $('#inputUrl').val();
    if (url) {
      Communicator.call({
        methodName: 'parseUrl',
        args: { connection: { url } },
        callback: (err, res) => {
          if (!err) ConnectionHelper.prepareFormForUrlParse(res, this.addServerField);
          else ErrorHandler.showMeteorFuncError(err, res);

          // let blaze initialize
          setTimeout(() => { ConnectionHelper.disableFormsForUri(); }, 150);
        }
      });
    } else ConnectionHelper.enableFormsForUri();
  },

  populateConnectionsTable() {
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblConnection',
      extraOptions: {
        createdRow(row, data) {
          if (data.color)$(row).css('background-color', data.color);
          $(row).addClass('connection_row');
        }
      },
      data: ReactivityProvider.find(ReactivityProvider.types.Connections),
      columns: [
        { data: '_id', sClass: 'hide_column' },
        { data: 'connectionName' },
        { data: 'servers' },
      ],
      columnDefs: [
        {
          targets: [2],
          render(data) {
            let result = '';
            if (data) data.forEach((server) => { result += `<b>${server.host}</b>:${server.port}<br/> `; });
            if (result.endsWith(', ')) return result.substr(0, result.length - 2);
            return result;
          },
        },
        {
          targets: [3],
          render(data, type, row) {
            let result = '<small>';
            if (row.authenticationType) result += `${row.authenticationType.toUpperCase()}<br/>`;
            if (row.ssl && row.ssl.enabled) result += 'SSL<br/>';
            if (row.ssh && row.ssh.enabled) result += 'SSH<br/>';
            if (row.url) result += 'URL<br/>';
            result += '</small> ';

            return result;
          },
        },
        {
          targets: [4],
          data: null,
          bSortable: false,
          defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>',
        },
        {
          targets: [5],
          data: null,
          bSortable: false,
          defaultContent: '<a href="" title="Duplicate" class="editor_duplicate"><i class="fa fa-clone text-navy"></i></a>',
        },
        {
          targets: [6],
          data: null,
          bSortable: false,
          defaultContent: '<a href="" title="Delete" class="editor_remove"><i class="fa fa-remove text-navy"></i></a>',
        },
      ]
    });
  },

  connect(isRefresh, message, messageTranslateOptions) {
    if (!SessionManager.get(SessionManager.strSessionConnection)) {
      Notification.warning('select-connection');
      return;
    }

    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });

    // prompt for username && password
    if (ConnectionHelper.isCredentialPromptNeeded(connection)) {
      const modal = $('#promptUsernamePasswordModal');
      modal.data('username', connection[connection.authenticationType].username);
      modal.data('password', connection[connection.authenticationType].password);
      modal.data('connection', connection);
      modal.modal('show');
    } else this.proceedConnecting({ isRefresh, message, messageTranslateOptions, connection });
  },

  proceedConnecting({ isRefresh, message, messageTranslateOptions, connection, username, password }) {
    Communicator.call({
      methodName: 'connect',
      args: { connectionId: connection._id, username, password },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          sortArrayByName(result.result);

          SessionManager.set(SessionManager.strSessionCollectionNames, result.result);

          if (!isRefresh) {
            $('#connectionModal').modal('hide');
            $('#switchDatabaseModal').modal('hide');
            $('#promptUsernamePasswordModal').modal('hide');

            SessionManager.set(SessionManager.strSessionSelectedQuery, null);
            SessionManager.set(SessionManager.strSessionSelectedCollection, null);
            SessionManager.set(SessionManager.strSessionSelectedOptions, null);
            FlowRouter.go('/databaseStats');
          } else if (!message) Notification.success('refreshed-successfully');
          else Notification.success(message, null, messageTranslateOptions);

          SessionManager.set(SessionManager.strSessionPromptedUsername, username);
          SessionManager.set(SessionManager.strSessionPromptedPassword, password);

          Notification.stop();
        }
      }
    });
  },

  addServerField(host, port) {
    const divField = $('.divHostField:hidden');
    const cloned = divField.clone();

    $('.divHostField:last').after(cloned);

    cloned.show();
    if (host) cloned.find('.txtHostName').val(host);
    if (port) cloned.find('.txtPort').val(port);
  },

  initializeSSLTemplate() {
    $('.filestyle').filestyle({});
    UIComponents.Checkbox.init($('#inputDisableHostnameVerification'));

    const promptUsernamePasswordModal = $('#promptUsernamePasswordModal');
    promptUsernamePasswordModal.on('shown.bs.modal', () => {
      $('#inputPromptedUsername').val(promptUsernamePasswordModal.data('username'));
      $('#inputPromptedPassword').val(promptUsernamePasswordModal.data('password'));
    });
    promptUsernamePasswordModal.on('hidden.bs.modal', () => {
      Notification.stop();
    });
  },

  initializeConnectionTemplate() {
    const selector = $('#tblConnection');
    UIComponents.DataTable.initiateDatatable({
      selector,
      sessionKey: SessionManager.strSessionConnection,
      clickCallback: () => { $('#btnConnect').prop('disabled', false); },
      noDeleteEvent: true
    });

    selector.find('tbody').on('dblclick', 'tr', () => {
      Notification.start('#btnConnect');
      this.connect(false);
    });

    const addEditModal = $('#addEditConnectionModal');
    addEditModal.on('shown.bs.modal', () => {
      ConnectionHelper.initializeUI();
      ConnectionHelper.resetForm();
      if (addEditModal.data('edit') || addEditModal.data('clone')) ConnectionHelper.prepareFormForEdit(this.addServerField);
      else this.addServerField('', '27017');
    });
  },

  removeConnection() {
    Notification.start('#btnConnect');

    $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');

    Communicator.call({
      methodName: 'removeConnection',
      args: { connectionId: SessionManager.get(SessionManager.strSessionConnection)._id },
      callback: (err) => {
        if (!err) {
          SessionManager.clear();
          this.populateConnectionsTable();
          Notification.stop();
        } else ErrorHandler.showMeteorFuncError(err);
      }
    });
  },

  saveConnection() {
    Notification.start('#btnSaveConnection');

    const modal = $('#addEditConnectionModal');
    const oldCollectionId = modal.data('edit') ? modal.data('edit') : modal.data('clone');
    let currentConnection = {};
    if (oldCollectionId) currentConnection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: oldCollectionId });
    ConnectionHelper.populateConnection(currentConnection, (connection) => {
      if (modal.data('edit')) connection._id = currentConnection._id;

      Communicator.call({
        methodName: 'checkAndSaveConnection',
        args: { connection },
        callback: (err) => {
          if (err) ErrorHandler.showMeteorFuncError(err, null);
          else {
            Notification.success('saved-successfully');
            this.populateConnectionsTable();
            modal.modal('hide');
          }
        }
      });
    });
  }

};

export default new Connection();
