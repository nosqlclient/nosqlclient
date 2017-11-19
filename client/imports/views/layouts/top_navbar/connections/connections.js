import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helpers/helper';
import { Connections } from '/lib/imports/collections';
import { loadFile } from '/client/imports/views/layouts/top_navbar/top_navbar';
import { Communicator } from '/client/imports/facades';
import './connections.html';

const toastr = require('toastr');
const Ladda = require('ladda');

require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);

require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
require('bootstrap-filestyle');

const selectedAuthType = new ReactiveVar('');

export const populateConnectionsTable = function () {
  const tblConnections = $('#tblConnection');

  if ($.fn.dataTable.isDataTable('#tblConnection')) {
    tblConnections.DataTable().destroy();
  }

  tblConnections.DataTable({
    responsive: true,
    data: Connections.find().fetch(),
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
          if (data) {
            for (const server of data) {
              result += `<b>${server.host}</b>:${server.port}<br/> `;
            }
          }
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
    ],
  });
};

const isCredentialPromptNeeded = function (connection) {
  return connection.authenticationType && connection.authenticationType !== 'mongodb_x509' && (!connection[connection.authenticationType].username || !connection[connection.authenticationType].password);
};

export const connect = function (isRefresh, message) {
  const connection = Connections.findOne({ _id: Session.get(Helper.strSessionConnection) });
  if (!connection) {
    toastr.info('Please select a connection first !');
    Ladda.stopAll();
    return;
  }

  // prompt for username && password
  if (isCredentialPromptNeeded(connection)) {
    const modal = $('#promptUsernamePasswordModal');
    modal.data('username', connection[connection.authenticationType].username);
    modal.data('password', connection[connection.authenticationType].password);
    modal.data('connection', connection);
    modal.modal('show');
  } else {
    proceedConnecting(isRefresh, message, connection);
  }
};

const proceedConnecting = function (isRefresh, message, connection, username, password) {
  Communicator.call({
    methodName: 'connect',
    args: { connectionId: connection._id, username, password },
    callback: (err, result) => {
      if (err || result.error) {
        Helper.showMeteorFuncError(err, result, "Couldn't connect");
      } else {
        result.result.sort((a, b) => {
          if (a.name < b.name) { return -1; } else if (a.name > b.name) { return 1; }
          return 0;
        });

        Session.set(Helper.strSessionCollectionNames, result.result);

        if (!isRefresh) {
          $('#connectionModal').modal('hide');
          $('#switchDatabaseModal').modal('hide');
          $('#promptUsernamePasswordModal').modal('hide');

          FlowRouter.go('/databaseStats');
        } else if (!message) toastr.success('Successfuly refreshed collections');
        else toastr.success(message);

        Session.set(Helper.strSessionPromptedUsername, username);
        Session.set(Helper.strSessionPromptedPassword, password);

        Ladda.stopAll();
      }
    }
  });
};

const fillFormSsl = function (obj) {
  if (obj.rootCAFileName) {
    $('#inputRootCA').siblings('.bootstrap-filestyle').children('input').val(obj.rootCAFileName);
  }
  if (obj.certificateFileName) {
    $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(obj.certificateFileName);
  }
  if (obj.certificateKeyFileName) {
    $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(obj.certificateKeyFileName);
  }

  $('#inputPassPhrase').val(obj.passPhrase);
  $('#inputDisableHostnameVerification').iCheck(!obj.disableHostnameVerification ? 'uncheck' : 'check');
};

const fillFormBasicAuth = function (obj) {
  $('#inputUser').val(obj.username);
  $('#inputPassword').val(obj.password);
  $('#inputAuthenticationDB').val(obj.authSource);
};

const fillFormSsh = function (connection) {
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
};

const fillFormAuthentication = function (connection) {
  $('#cmbAuthenticationType').val(connection.authenticationType).trigger('chosen:updated');
  selectedAuthType.set(connection.authenticationType);

  // let blaze render
  Meteor.setTimeout(() => {
    if (connection.authenticationType === 'mongodb_cr') {
      fillFormBasicAuth(connection.mongodb_cr);
    } else if (connection.authenticationType === 'scram_sha_1') {
      fillFormBasicAuth(connection.scram_sha_1);
    } else if (connection.authenticationType === 'plain') {
      $('#inputLdapUsername').val(connection.plain.username);
      $('#inputLdapPassword').val(connection.plain.password);
    } else if (connection.authenticationType === 'gssapi') {
      $('#inputKerberosUsername').val(connection.gssapi.username);
      $('#inputKerberosPassword').val(connection.gssapi.password);
      $('#inputKerberosServiceName').val(connection.gssapi.serviceName);
    } else if (connection.authenticationType === 'mongodb_x509') {
      fillFormSsl(connection.mongodb_x509);
      $('#anchorConnectionSsl').removeAttr('data-toggle');
      $('#inputX509Username').val(connection.mongodb_x509.username);
    }
  }, 150);
};

const fillFormConnection = function (connection) {
  if (connection.servers) {
    for (const server of connection.servers) {
      addField(server.host, server.port);
    }
  }
  selectedAuthType.set(connection.authenticationType);
  $('#inputUrl').val(connection.url);
  $('#inputDatabaseName').val(connection.databaseName);
};

const prepareFormForUrlParse = function (connection) {
  $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
  $('.divHostField:visible').remove();
  fillFormConnection(connection);
  fillFormAuthentication(connection);

  const sslTab = $('#anchorConnectionSsl');
  if (connection.authenticationType === 'mongodb_x509') sslTab.removeAttr('data-toggle');
  else sslTab.attr('data-toggle', 'tab');

  if (connection.ssl) $('#inputUseSSL').iCheck(connection.ssl.enabled ? 'check' : 'uncheck');
  if (connection.options) fillFormOptionsExceptConnectWithNoPrimary(connection);
};

const fillFormOptionsExceptConnectWithNoPrimary = function (connection) {
  $('#inputConnectionTimeoutOverride').val(connection.options.connectionTimeout);
  $('#inputReplicaSetName').val(connection.options.replicaSetName);
  $('#inputSocketTimeoutOverride').val(connection.options.socketTimeout);
  $('#cmbReadPreference').val(connection.options.readPreference).trigger('chosen:updated');
};

const prepareFormForEdit = function () {
  const connection = Connections.findOne({ _id: Session.get(Helper.strSessionConnection) });

  $('#addEditModalSmall').html(connection.connectionName);
  $('#inputConnectionName').val(connection.connectionName);
  fillFormConnection(connection);
  fillFormAuthentication(connection);

  if (connection.ssl) {
    $('#inputUseSSL').iCheck(connection.ssl.enabled ? 'check' : 'uncheck');
    fillFormSsl(connection.ssl);
  }
  if (connection.ssh) {
    $('#inputUseSSH').iCheck(connection.ssh.enabled ? 'check' : 'uncheck');
    fillFormSsh(connection);
  }
  if (connection.options) {
    fillFormOptionsExceptConnectWithNoPrimary(connection);
    $('#inputConnectWithNoPrimary').iCheck(!connection.options.connectWithNoPrimary ? 'uncheck' : 'check');
  }
  if (connection.url) {
    disableFormsForUri();
  }
};

const loadSSHCertificate = function (connection, currentConnection, done) {
  if (connection.ssh) {
    if (connection.ssh.certificateFileName) {
      loadFile(currentConnection.ssh ? currentConnection.ssh.certificateFile : null, $('#inputSshCertificate'), (val) => {
        connection.ssh.certificateFile = val;
        done(connection);
      });
    } else {
      done(connection);
    }
  } else {
    done(connection);
  }
};

const loadSSLCertificates = function (connection, currentConnection, done) {
  if (connection.ssl) {
    loadRootCa(connection, 'ssl', currentConnection, () => {
      loadSSHCertificate(connection, currentConnection, done);
    });
  } else {
    loadSSHCertificate(connection, currentConnection, done);
  }
};

const populateConnection = function (currentConnection, done) {
  const connection = { servers: [] };
  const connectionName = $('#inputConnectionName').val();
  connection.connectionName = connectionName || 'unnamed_connection';
  connection.url = $('#inputUrl').val();
  connection.authenticationType = $('#cmbAuthenticationType').val();
  connection.databaseName = $('#inputDatabaseName').val();
  if (connection.authenticationType !== 'mongodb_x509' && $('#inputUseSSL').iCheck('update')[0].checked) {
    connection.ssl = getSSLProps();
  }
  fillHostFields(connection);
  fillCorrectAuthenticationType(connection);
  if ($('#inputUseSSH').iCheck('update')[0].checked) {
    fillSsh(connection);
  }
  fillOptions(connection);

  if (connection.mongodb_x509) {
    loadRootCa(connection, 'mongodb_x509', currentConnection, () => {
      loadSSLCertificates(connection, currentConnection, done);
    });
  } else {
    loadSSLCertificates(connection, currentConnection, done);
  }
};

const loadCertificateKeyFile = function (connection, prop, currentConnection, done) {
  if (connection[prop].certificateKeyFileName) {
    loadFile(currentConnection[prop] ? currentConnection[prop].certificateKeyFile : null, $('#inputCertificateKey'), (val) => {
      connection[prop].certificateKeyFile = val;
      done();
    });
  } else {
    done();
  }
};

const loadsslCertificate = function (connection, prop, currentConnection, done) {
  if (connection[prop].certificateFileName) {
    loadFile(currentConnection[prop] ? currentConnection[prop].certificateFile : null, $('#inputCertificate'), (val) => {
      connection[prop].certificateFile = val;
      loadCertificateKeyFile(connection, prop, currentConnection, done);
    });
  } else {
    loadCertificateKeyFile(connection, prop, currentConnection, done);
  }
};

const loadRootCa = function (connection, prop, currentConnection, done) {
  if (connection[prop].rootCAFileName) {
    loadFile(currentConnection[prop] ? currentConnection[prop].rootCAFile : null, $('#inputRootCA'), (val) => {
      connection[prop].rootCAFile = val;
      loadsslCertificate(connection, prop, currentConnection, done);
    });
  } else {
    loadsslCertificate(connection, prop, currentConnection, done);
  }
};

const fillSsh = function (connection) {
  const port = $('#inputSshPort').val();
  const localPort = $('#inputSshLocalPort').val();
  const destinationPort = $('#inputSshDestinationPort').val();

  connection.ssh = {
    enabled: $('#inputUseSSH').iCheck('update')[0].checked,
    host: $('#inputSshHostname').val(),
    port: port ? parseInt(port) : '',
    localPort: localPort ? parseInt(localPort) : '',
    destinationPort: destinationPort ? parseInt(destinationPort) : '',
    username: $('#inputSshUsername').val(),
    certificateFileName: $('#inputSshCertificate').siblings('.bootstrap-filestyle').children('input').val(),
    passPhrase: $('#inputSshPassPhrase').val(),
    password: $('#inputSshPassword').val(),
  };
};

const fillOptions = function (connection) {
  const connectionTimeot = $('#inputConnectionTimeoutOverride').val();
  const socketTimeout = $('#inputSocketTimeoutOverride').val();
  connection.options = {
    connectionTimeout: connectionTimeot ? parseInt(connectionTimeot) : '',
    socketTimeout: socketTimeout ? parseInt(socketTimeout) : '',
    readPreference: $('#cmbReadPreference').val(),
    connectWithNoPrimary: $('#inputConnectWithNoPrimary').iCheck('update')[0].checked,
    replicaSetName: $('#inputReplicaSetName').val(),
  };
};

const fillHostFields = function (connection) {
  for (let divField of $('.divHostField')) {
    divField = $(divField);
    const host = divField.find('.txtHostName').val();
    let port = divField.find('.txtPort').val();
    port = port ? parseInt(port) : '';
    if (host && port) {
      connection.servers.push({ host, port });
    }
  }
};

const getSSLProps = function () {
  return {
    enabled: $('#inputUseSSL').iCheck('update')[0].checked,
    rootCAFileName: $('#inputRootCA').siblings('.bootstrap-filestyle').children('input').val(),
    certificateFileName: $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(),
    passPhrase: $('#inputPassPhrase').val(),
    certificateKeyFileName: $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(),
    disableHostnameVerification: $('#inputDisableHostnameVerification').iCheck('update')[0].checked,
  };
};

const fillCorrectAuthenticationType = function (connection) {
  if (connection.authenticationType === 'scram_sha_1' || connection.authenticationType === 'mongodb_cr') {
    connection[connection.authenticationType] = {
      username: $('#inputUser').val(),
      password: $('#inputPassword').val(),
      authSource: $('#inputAuthenticationDB').val(),
    };
  } else if (connection.authenticationType === 'mongodb_x509') {
    connection.mongodb_x509 = getSSLProps();
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
};

const resetForm = function () {
  $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
  $(':file').filestyle('clear');
  $('#addEditModalSmall').html('');
  $('#inputConnectWithNoPrimary, #inputDisableHostnameVerification, #inputUseSSL, #inputUseSSH').iCheck('uncheck');
  $('#spanUseSSL').hide();
  $('.divHostField:visible').remove();
  selectedAuthType.set('');

  $('#inputConnectionName, #inputUrl, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, ' +
        '#inputLdapUsername, #inputLdapPassword, #inputConnectionTimeout, #inputSocketTimeout, #inputSshHostname, ' +
        '#inputSshPort, #inputSshLocalPort, #inputSshDestinationPort, #inputSshUsername, #inputSshPassPhrase, #inputSshPassword, #inputUser, #inputPassword, ' +
        '#inputAuthenticationDB, #inputPassPhrase, #inputX509Username').val('');
  $('#inputDatabaseName').val('test');
  $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference').find('option').prop('selected', false).trigger('chosen:updated');
  $('#anchorConnectionSsl').attr('data-toggle', 'tab');
  $('#divSshTemplate').hide();
  $('#divSslTemplate').hide();
  enableFormsForUri();
};

const addField = function (host, port) {
  const divField = $('.divHostField:hidden');
  const cloned = divField.clone();

  $('.divHostField:last').after(cloned);

  cloned.show();
  if (host) {
    cloned.find('.txtHostName').val(host);
  }
  if (port) {
    cloned.find('.txtPort').val(port);
  }
};

const initializeUI = function () {
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
};

Template.sslTemplate.onRendered(() => {
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
    Ladda.stopAll();
  });
});

Template.connections.onRendered(() => {
  const selector = $('#tblConnection');
  selector.find('tbody').on('click', 'tr', function () {
    const table = selector.DataTable();
    Helper.doTableRowSelectable(table, $(this));

    if (table.row(this).data()) {
      Session.set(Helper.strSessionConnection, table.row(this).data()._id);
      $('#btnConnect').prop('disabled', false);
    }
  });
  selector.find('tbody').on('dblclick', 'tr', () => {
    Ladda.create(document.querySelector('#btnConnect')).start();
    connect(false);
  });

  const addEditModal = $('#addEditConnectionModal');
  addEditModal.on('shown.bs.modal', () => {
    initializeUI();
    resetForm();
    if (addEditModal.data('edit') || addEditModal.data('clone')) {
      prepareFormForEdit();
    } else {
      addField('', '27017');
    }
  });
});

Template.connections.helpers({
  authenticationMethod(...methods) {
    return methods.indexOf(selectedAuthType.get()) !== -1;
  },
});

const disableFormsForUri = function () {
  $('.divHostField:visible').find('input, button').prop('disabled', true).parent('div')
    .attr('data-original-title', 'Clear URL to activate here');
  $('#inputDatabaseName, #cmbAuthenticationType, #inputConnectionTimeoutOverride, #inputReplicaSetName, #inputSocketTimeoutOverride, #cmbReadPreference, #inputUser, #inputPassword, #inputAuthenticationDB, #inputLdapUsername, #inputLdapPassword, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, #inputX509Username')
    .prop('disabled', true).trigger('chosen:updated').parent('div')
    .attr('data-original-title', 'Clear URL to activate here');
  $('#inputUseSSL').iCheck('disable');
  $('#spanUseSSL').show();

  $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
};

const enableFormsForUri = function () {
  $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
  $('.divHostField:visible').find('input, button').prop('disabled', false).parent('div')
    .attr('data-original-title', '');
  $('#inputDatabaseName, #cmbAuthenticationType, #inputConnectionTimeoutOverride, #inputReplicaSetName, #inputSocketTimeoutOverride, #cmbReadPreference, #inputUser, #inputPassword, #inputAuthenticationDB, #inputLdapUsername, #inputLdapPassword, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, #inputX509Username')
    .prop('disabled', false).trigger('chosen:updated').parent('div')
    .attr('data-original-title', '');
  $('#inputUseSSL').iCheck('enable');
  $('#spanUseSSL').hide();
  selectedAuthType.set($('#cmbAuthenticationType').val());
};

Template.connections.events({
  'mousedown .showpass': function (e) {
    $(e.currentTarget).parent('span').siblings('input').attr('type', 'text');
  },
  'mouseup .showpass': function (e) {
    $(e.currentTarget).parent('span').siblings('input').attr('type', 'password');
  },
  'mouseout .showpass': function (e) {
    $(e.currentTarget).parent('span').siblings('input').attr('type', 'password');
  },

  'click #btnProceedConnecting': function () {
    proceedConnecting(false, null, $('#promptUsernamePasswordModal').data('connection'), $('#inputPromptedUsername').val(), $('#inputPromptedPassword').val());
  },

  'change #inputUrl': function () {
    const url = $('#inputUrl').val();
    if (url) {
      Communicator.call({
        methodName: 'parseUrl',
        args: { connection: { url } },
        callback: (err, res) => {
          if (!err) {
            prepareFormForUrlParse(res);
          } else {
            toastr.error(err.message);
          }

          // let blaze initialize
          Meteor.setTimeout(() => {
            disableFormsForUri();
          }, 150);
        }
      });
    } else {
      enableFormsForUri();
    }
  },

  'click #anchorConnectionSsl': function () {
    if (!$('#anchorConnectionSsl').attr('data-toggle')) {
      toastr.warning('SSL already set via Mongodb-X509');
    }
  },

  'change #cmbSshAuthType': function () {
    const authType = $('#cmbSshAuthType').val();
    const certificateForm = $('#formSshCertificateAuth');
    const passwordForm = $('#formSshPasswordAuth');
    if (authType === 'Certificate') {
      certificateForm.show();
      passwordForm.hide();
    } else if (authType === 'Password') {
      certificateForm.hide();
      passwordForm.show();
    } else {
      certificateForm.hide();
      passwordForm.hide();
    }
  },

  'change #cmbAuthenticationType': function () {
    const authType = $('#cmbAuthenticationType').val();
    const sslTab = $('#anchorConnectionSsl');
    selectedAuthType.set(authType);
    if (authType === 'mongodb_x509') {
      sslTab.removeAttr('data-toggle');
    } else {
      sslTab.attr('data-toggle', 'tab');
    }
  },

  'click .addHost': function () {
    addField();
  },

  'click .deleteHost': function (e) {
    if ($('.divHostField:visible').length === 1) {
      toastr.warning('At least one host is required !');
      return;
    }
    $(e.currentTarget).parents('.divHostField').remove();
  },

  'click #btnCreateNewConnection': function () {
    $('#addEditConnectionModalTitle').text('Add Connection');
    const modal = $('#addEditConnectionModal');
    modal.data('edit', null);
    modal.data('clone', null);
    modal.modal('show');
  },

  'click .editor_remove': function (e) {
    e.preventDefault();

    Ladda.create(document.querySelector('#btnConnect')).start();

    $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');

    Communicator.call({
      methodName: 'removeConnection',
      args: { connectionId: Session.get(Helper.strSessionConnection) },
      callback: (err) => {
        if (!err) {
          Helper.clearSessions();
          populateConnectionsTable();
        } else {
          toastr.error(`unexpected error during connection remove: ${err.message}`);
        }

        Ladda.stopAll();
      }
    });
  },

  'click .editor_edit': function () {
    $('#addEditConnectionModalTitle').text('Edit Connection');
    const modal = $('#addEditConnectionModal');
    modal.data('edit', Session.get(Helper.strSessionConnection));
    modal.data('clone', '');
    modal.modal('show');
  },

  'click .editor_duplicate': function () {
    $('#addEditConnectionModalTitle').text('Clone Connection');
    const modal = $('#addEditConnectionModal');
    modal.data('clone', Session.get(Helper.strSessionConnection));
    modal.data('edit', '');
    modal.modal('show');
  },

  'click #btnSaveConnection': function (e) {
    e.preventDefault();
    Ladda.create(document.querySelector('#btnSaveConnection')).start();

    const modal = $('#addEditConnectionModal');
    const oldCollectionId = modal.data('edit') ? modal.data('edit') : modal.data('clone');
    let currentConnection = {};
    if (oldCollectionId) {
      currentConnection = Connections.findOne({ _id: oldCollectionId });
    }
    populateConnection(currentConnection, (connection) => {
      if (modal.data('edit')) {
        connection._id = currentConnection._id;
      }

      Communicator.call({
        methodName: 'checkAndSaveConnection',
        args: { connection },
        callback: (err) => {
          if (err) {
            Helper.showMeteorFuncError(err, null, 'could not save connection');
          } else {
            toastr.success('Successfully saved connection');
            populateConnectionsTable();
            modal.modal('hide');
          }

          Ladda.stopAll();
        }
      });
    });
  },
});
