import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactivityProvider, Communicator } from '/client/imports/facades';
import { UIComponents, SessionManager, Notification, ErrorHandler } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';

require('bootstrap-filestyle');

const Connection = function () {
  this.selectedAuthType = new ReactiveVar('');
};

Connection.prototype = {
  disconnect() {
    Communicator.call({ methodName: 'disconnect' });
    SessionManager.clear();
    FlowRouter.go('/databaseStats');
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

    Communicator.call({ methodName: 'saveConnection', args: { connection } });
    this.connect(false);
  },

  showSwitchDatabaseModal() {
    $('#switchDatabaseModal').modal('show');

    Notification.start('#btnConnectSwitchedDatabase');

    Communicator.call({
      methodName: 'listDatabases',
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          result.result.databases.sort((a, b) => {
            if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; }
            return 0;
          });

          UIComponents.DataTable.setupDatatable({
            selectorString: '#tblSwitchDatabases',
            columns: [{ data: 'name' }],
            data: result.result.databases
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
          if (!err) this.prepareFormForUrlParse(res);
          else Notification.error(err.message);

          // let blaze initialize
          Meteor.setTimeout(() => { this.disableFormsForUri(); }, 150);
        }
      });
    } else this.enableFormsForUri();
  },

  populateConnectionsTable() {
    UIComponents.DataTable.setupDatatable({
      selectorString: '#tblConnection',
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

  isCredentialPromptNeeded(connection) {
    return connection.authenticationType && connection.authenticationType !== 'mongodb_x509' &&
      (!connection[connection.authenticationType].username || !connection[connection.authenticationType].password);
  },

  connect(isRefresh, message, messageTranslateOptions) {
    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    if (!connection) {
      Notification.warning('select-connection');
      return;
    }

    // prompt for username && password
    if (this.isCredentialPromptNeeded(connection)) {
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
          result.result.sort((a, b) => {
            if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; }
            return 0;
          });

          SessionManager.set(SessionManager.strSessionCollectionNames, result.result);

          if (!isRefresh) {
            $('#connectionModal').modal('hide');
            $('#switchDatabaseModal').modal('hide');
            $('#promptUsernamePasswordModal').modal('hide');

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

  fillFormSsl(obj) {
    if (obj.rootCAFileName) $('#inputRootCA').siblings('.bootstrap-filestyle').children('input').val(obj.rootCAFileName);
    if (obj.certificateFileName) $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(obj.certificateFileName);
    if (obj.certificateKeyFileName) $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(obj.certificateKeyFileName);

    $('#inputPassPhrase').val(obj.passPhrase);
    $('#inputDisableHostnameVerification').iCheck(!obj.disableHostnameVerification ? 'uncheck' : 'check');
  },

  fillFormBasicAuth(obj) {
    $('#inputUser').val(obj.username);
    $('#inputPassword').val(obj.password);
    $('#inputAuthenticationDB').val(obj.authSource);
  },

  fillFormSsh(connection) {
    $('#inputSshHostname').val(connection.ssh.host);
    $('#inputSshPort').val(connection.ssh.port);
    $('#inputSshLocalPort').val(connection.ssh.localPort);
    $('#inputSshDestinationPort').val(connection.ssh.destinationPort);
    $('#inputSshUsername').val(connection.ssh.username);

    const certificateForm = $('#formSshCertificateAuth');
    const passwordForm = $('#formSshPasswordAuth');
    if (connection.ssh.certificateFileName) {
      certificateForm.show();
      passwordForm.hide();
      $('#cmbSshAuthType').val('Certificate').trigger('chosen:updated');
      $('#inputSshCertificate').siblings('.bootstrap-filestyle').children('input').val(connection.ssh.certificateFileName);
      $('#inputSshPassPhrase').val(connection.ssh.passPhrase);
    } else {
      certificateForm.hide();
      passwordForm.show();
      $('#cmbSshAuthType').val('Password').trigger('chosen:updated');
      $('#inputSshPassword').val(connection.ssh.password);
    }
  },

  fillFormAuthentication(connection) {
    $('#cmbAuthenticationType').val(connection.authenticationType).trigger('chosen:updated');
    this.selectedAuthType.set(connection.authenticationType);

    // let blaze render
    Meteor.setTimeout(() => {
      if (connection.authenticationType === 'mongodb_cr') this.fillFormBasicAuth(connection.mongodb_cr);
      else if (connection.authenticationType === 'scram_sha_1') this.fillFormBasicAuth(connection.scram_sha_1);
      else if (connection.authenticationType === 'plain') {
        $('#inputLdapUsername').val(connection.plain.username);
        $('#inputLdapPassword').val(connection.plain.password);
      } else if (connection.authenticationType === 'gssapi') {
        $('#inputKerberosUsername').val(connection.gssapi.username);
        $('#inputKerberosPassword').val(connection.gssapi.password);
        $('#inputKerberosServiceName').val(connection.gssapi.serviceName);
      } else if (connection.authenticationType === 'mongodb_x509') {
        this.fillFormSsl(connection.mongodb_x509);
        $('#anchorConnectionSsl').removeAttr('data-toggle');
        $('#inputX509Username').val(connection.mongodb_x509.username);
      }
    }, 150);
  },

  fillFormConnection(connection) {
    if (connection.servers) {
      connection.servers.forEach((server) => { this.addServerField(server.host, server.port); });
    }
    this.selectedAuthType.set(connection.authenticationType);
    $('#inputUrl').val(connection.url);
    $('#inputDatabaseName').val(connection.databaseName);
  },

  prepareFormForUrlParse(connection) {
    $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
    $('.divHostField:visible').remove();
    this.fillFormConnection(connection);
    this.fillFormAuthentication(connection);

    const sslTab = $('#anchorConnectionSsl');
    if (connection.authenticationType === 'mongodb_x509') sslTab.removeAttr('data-toggle');
    else sslTab.attr('data-toggle', 'tab');

    if (connection.ssl) $('#inputUseSSL').iCheck(connection.ssl.enabled ? 'check' : 'uncheck');
    if (connection.options) this.fillFormOptionsExceptConnectWithNoPrimary(connection);
  },

  fillFormOptionsExceptConnectWithNoPrimary(connection) {
    $('#inputConnectionTimeoutOverride').val(connection.options.connectionTimeout);
    $('#inputReplicaSetName').val(connection.options.replicaSetName);
    $('#inputSocketTimeoutOverride').val(connection.options.socketTimeout);
    $('#cmbReadPreference').val(connection.options.readPreference).trigger('chosen:updated');
  },

  prepareFormForEdit() {
    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });

    $('#addEditModalSmall').html(connection.connectionName);
    $('#inputConnectionName').val(connection.connectionName);
    this.fillFormConnection(connection);
    this.fillFormAuthentication(connection);

    if (connection.ssl) {
      $('#inputUseSSL').iCheck(connection.ssl.enabled ? 'check' : 'uncheck');
      this.fillFormSsl(connection.ssl);
    }
    if (connection.ssh) {
      $('#inputUseSSH').iCheck(connection.ssh.enabled ? 'check' : 'uncheck');
      this.fillFormSsh(connection);
    }
    if (connection.options) {
      this.fillFormOptionsExceptConnectWithNoPrimary(connection);
      $('#inputConnectWithNoPrimary').iCheck(!connection.options.connectWithNoPrimary ? 'uncheck' : 'check');
    }
    if (connection.url) this.disableFormsForUri();
  },

  loadSSHCertificate(connection, currentConnection, done) {
    if (connection.ssh) {
      if (connection.ssh.certificateFileName) {
        Helper.loadFile(currentConnection.ssh ? currentConnection.ssh.certificateFile : null, $('#inputSshCertificate'), (val) => {
          connection.ssh.certificateFile = val;
          done(connection);
        });
      } else {
        done(connection);
      }
    } else {
      done(connection);
    }
  },

  loadSSLCertificates(connection, currentConnection, done) {
    if (connection.ssl) {
      this.loadRootCa(connection, 'ssl', currentConnection, () => {
        this.loadSSHCertificate(connection, currentConnection, done);
      });
    } else this.loadSSHCertificate(connection, currentConnection, done);
  },

  populateConnection(currentConnection, done) {
    const connection = { servers: [] };
    const connectionName = $('#inputConnectionName').val();
    connection.connectionName = connectionName || 'unnamed_connection';
    connection.url = $('#inputUrl').val();
    connection.authenticationType = $('#cmbAuthenticationType').val();
    connection.databaseName = $('#inputDatabaseName').val();
    if (connection.authenticationType !== 'mongodb_x509' && $('#inputUseSSL').iCheck('update')[0].checked) {
      connection.ssl = this.getSSLProps();
    }
    this.fillHostFields(connection);
    this.fillCorrectAuthenticationType(connection);
    if ($('#inputUseSSH').iCheck('update')[0].checked) this.fillSsh(connection);
    this.fillOptions(connection);

    if (connection.mongodb_x509) {
      this.loadRootCa(connection, 'mongodb_x509', currentConnection, () => {
        this.loadSSLCertificates(connection, currentConnection, done);
      });
    } else this.loadSSLCertificates(connection, currentConnection, done);
  },

  loadCertificateKeyFile(connection, prop, currentConnection, done) {
    if (connection[prop].certificateKeyFileName) {
      Helper.loadFile(currentConnection[prop] ? currentConnection[prop].certificateKeyFile : null, $('#inputCertificateKey'), (val) => {
        connection[prop].certificateKeyFile = val;
        done();
      });
    } else done();
  },

  loadSslCertificate(connection, prop, currentConnection, done) {
    if (connection[prop].certificateFileName) {
      Helper.loadFile(currentConnection[prop] ? currentConnection[prop].certificateFile : null, $('#inputCertificate'), (val) => {
        connection[prop].certificateFile = val;
        this.loadCertificateKeyFile(connection, prop, currentConnection, done);
      });
    } else this.loadCertificateKeyFile(connection, prop, currentConnection, done);
  },

  loadRootCa(connection, prop, currentConnection, done) {
    if (connection[prop].rootCAFileName) {
      Helper.loadFile(currentConnection[prop] ? currentConnection[prop].rootCAFile : null, $('#inputRootCA'), (val) => {
        connection[prop].rootCAFile = val;
        this.loadSslCertificate(connection, prop, currentConnection, done);
      });
    } else this.loadSslCertificate(connection, prop, currentConnection, done);
  },

  fillSsh(connection) {
    const port = $('#inputSshPort').val();
    const localPort = $('#inputSshLocalPort').val();
    const destinationPort = $('#inputSshDestinationPort').val();

    connection.ssh = {
      enabled: $('#inputUseSSH').iCheck('update')[0].checked,
      host: $('#inputSshHostname').val(),
      port: port ? parseInt(port, 10) : '',
      localPort: localPort ? parseInt(localPort, 10) : '',
      destinationPort: destinationPort ? parseInt(destinationPort, 10) : '',
      username: $('#inputSshUsername').val(),
      certificateFileName: $('#inputSshCertificate').siblings('.bootstrap-filestyle').children('input').val(),
      passPhrase: $('#inputSshPassPhrase').val(),
      password: $('#inputSshPassword').val(),
    };
  },

  fillOptions(connection) {
    const connectionTimeot = $('#inputConnectionTimeoutOverride').val();
    const socketTimeout = $('#inputSocketTimeoutOverride').val();
    connection.options = {
      connectionTimeout: connectionTimeot ? parseInt(connectionTimeot, 10) : '',
      socketTimeout: socketTimeout ? parseInt(socketTimeout, 10) : '',
      readPreference: $('#cmbReadPreference').val(),
      connectWithNoPrimary: $('#inputConnectWithNoPrimary').iCheck('update')[0].checked,
      replicaSetName: $('#inputReplicaSetName').val(),
    };
  },

  fillHostFields(connection) {
    const hostFields = $('.divHostField');
    Object.keys(hostFields).forEach((key) => {
      const divField = $(hostFields[key]);
      const host = divField.find('.txtHostName').val();
      let port = divField.find('.txtPort').val();
      port = port ? parseInt(port, 10) : '';
      if (host && port) connection.servers.push({ host, port });
    });
  },

  getSSLProps() {
    return {
      enabled: $('#inputUseSSL').iCheck('update')[0].checked,
      rootCAFileName: $('#inputRootCA').siblings('.bootstrap-filestyle').children('input').val(),
      certificateFileName: $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(),
      passPhrase: $('#inputPassPhrase').val(),
      certificateKeyFileName: $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(),
      disableHostnameVerification: $('#inputDisableHostnameVerification').iCheck('update')[0].checked,
    };
  },

  fillCorrectAuthenticationType(connection) {
    if (connection.authenticationType === 'scram_sha_1' || connection.authenticationType === 'mongodb_cr') {
      connection[connection.authenticationType] = {
        username: $('#inputUser').val(),
        password: $('#inputPassword').val(),
        authSource: $('#inputAuthenticationDB').val(),
      };
    } else if (connection.authenticationType === 'mongodb_x509') {
      connection.mongodb_x509 = this.getSSLProps();
      connection.mongodb_x509.username = $('#inputX509Username').val();
    } else if (connection.authenticationType === 'gssapi') {
      connection.gssapi = {
        username: $('#inputKerberosUsername').val(),
        password: $('#inputKerberosPassword').val(),
        serviceName: $('#inputKerberosServiceName').val(),
      };
    } else if (connection.authenticationType === 'plain') {
      connection.plain = {
        username: $('#inputLdapUsername').val(),
        password: $('#inputLdapPassword').val(),
      };
    }
  },

  resetForm() {
    $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
    $(':file').filestyle('clear');
    $('#addEditModalSmall').html('');
    $('#inputConnectWithNoPrimary, #inputDisableHostnameVerification, #inputUseSSL, #inputUseSSH').iCheck('uncheck');
    $('#spanUseSSL').hide();
    $('.divHostField:visible').remove();
    this.selectedAuthType.set('');

    $('#inputConnectionName, #inputUrl, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, ' +
    '#inputLdapUsername, #inputLdapPassword, #inputConnectionTimeout, #inputSocketTimeout, #inputSshHostname, ' +
    '#inputSshPort, #inputSshLocalPort, #inputSshDestinationPort, #inputSshUsername, #inputSshPassPhrase, #inputSshPassword, #inputUser, #inputPassword, ' +
    '#inputAuthenticationDB, #inputPassPhrase, #inputX509Username').val('');
    $('#inputDatabaseName').val('test');
    $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference').find('option').prop('selected', false).trigger('chosen:updated');
    $('#anchorConnectionSsl').attr('data-toggle', 'tab');
    $('#divSshTemplate').hide();
    $('#divSslTemplate').hide();
    this.enableFormsForUri();
  },

  addServerField(host, port) {
    const divField = $('.divHostField:hidden');
    const cloned = divField.clone();

    $('.divHostField:last').after(cloned);

    cloned.show();
    if (host) cloned.find('.txtHostName').val(host);
    if (port) cloned.find('.txtPort').val(port);
  },

  initializeUI() {
    $('.filestyle').filestyle({});
    $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference').chosen({
      allow_single_deselect: true,
    });
    $('#divConnectWithNoPrimary, #divUseSSL, #divUseSSH').iCheck({
      checkboxClass: 'icheckbox_square-green',
    });
    $('#divUseSSH').on('ifToggled', () => {
      const divTemplate = $('#divSshTemplate');
      if ($('#inputUseSSH').iCheck('update')[0].checked) divTemplate.show();
      else divTemplate.hide();
    });

    $('#divUseSSL').on('ifToggled', () => {
      const divTemplate = $('#divSslTemplate');
      if ($('#inputUseSSL').iCheck('update')[0].checked) divTemplate.show();
      else divTemplate.hide();
    });
  },

  disableFormsForUri() {
    $('.divHostField:visible').find('input, button').prop('disabled', true).parent('div')
      .attr('data-original-title', 'Clear URL to activate here');
    $('#inputDatabaseName, #cmbAuthenticationType, #inputConnectionTimeoutOverride, #inputReplicaSetName, #inputSocketTimeoutOverride, #cmbReadPreference, ' +
      '#inputUser, #inputPassword, #inputAuthenticationDB, #inputLdapUsername, #inputLdapPassword, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, #inputX509Username')
      .prop('disabled', true).trigger('chosen:updated').parent('div')
      .attr('data-original-title', 'Clear URL to activate here');
    $('#inputUseSSL').iCheck('disable');
    $('#spanUseSSL').show();

    $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  enableFormsForUri() {
    $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
    $('.divHostField:visible').find('input, button').prop('disabled', false).parent('div')
      .attr('data-original-title', '');
    $('#inputDatabaseName, #cmbAuthenticationType, #inputConnectionTimeoutOverride, #inputReplicaSetName, #inputSocketTimeoutOverride, #cmbReadPreference, ' +
    '#inputUser, #inputPassword, #inputAuthenticationDB, #inputLdapUsername, #inputLdapPassword, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, #inputX509Username')
      .prop('disabled', false).trigger('chosen:updated').parent('div')
      .attr('data-original-title', '');
    $('#inputUseSSL').iCheck('enable');
    $('#spanUseSSL').hide();
    this.selectedAuthType.set($('#cmbAuthenticationType').val());
  },

  initializeSSLTemplate() {
    $('.filestyle').filestyle({});
    $('#inputDisableHostnameVerification').iCheck({
      checkboxClass: 'icheckbox_square-green',
    });

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
      this.initializeUI();
      this.resetForm();
      if (addEditModal.data('edit') || addEditModal.data('clone')) this.prepareFormForEdit();
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
    this.populateConnection(currentConnection, (connection) => {
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
