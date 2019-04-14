import { ReactivityProvider } from '/client/imports/facades';
import { SessionManager, UIComponents } from '/client/imports/modules';
import $ from 'jquery';
import Helper from '../../helpers/helper';
import { ReactiveVar } from 'meteor/reactive-var';

const setDivToggle = function (divUseSelector, divSelector, inputSelector) {
  divUseSelector.on('ifToggled', () => {
    if (UIComponents.Checkbox.getState(inputSelector)) divSelector.show();
    else divSelector.hide();
  });
};

const ConnectionHelper = function () {
  this.selectedAuthType = new ReactiveVar('');
};

ConnectionHelper.prototype = {
  isCredentialPromptNeeded(connection) {
    return connection.authenticationType && connection.authenticationType !== 'mongodb_x509'
      && (!connection[connection.authenticationType].username || !connection[connection.authenticationType].password);
  },

  fillFormSsl(obj) {
    if (obj.rootCAFileName) $('#inputRootCA').siblings('.bootstrap-filestyle').children('input').val(obj.rootCAFileName);
    if (obj.certificateFileName) $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(obj.certificateFileName);
    if (obj.certificateKeyFileName) $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(obj.certificateKeyFileName);

    $('#inputPassPhrase').val(obj.passPhrase);
    UIComponents.Checkbox.toggleState($('#inputDisableHostnameVerification'), !obj.disableHostnameVerification ? 'uncheck' : 'check');
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
    setTimeout(() => {
      if (connection.authenticationType === 'mongodb_cr') this.fillFormBasicAuth(connection.mongodb_cr);
      else if (connection.authenticationType === 'scram_sha_1') this.fillFormBasicAuth(connection.scram_sha_1);
      else if (connection.authenticationType === 'scram_sha_256') this.fillFormBasicAuth(connection.scram_sha_256);
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

  fillFormConnection(connection, addServerField) {
    if (connection.servers) {
      connection.servers.forEach((server) => { addServerField(server.host, server.port); });
    }
    this.selectedAuthType.set(connection.authenticationType);
    $('#inputUrl').val(connection.url);
    $('#inputDatabaseName').val(connection.databaseName);
  },

  prepareFormForUrlParse(connection, addServerField) {
    $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
    $('.divHostField:visible').remove();
    this.fillFormConnection(connection, addServerField);
    this.fillFormAuthentication(connection);

    const sslTab = $('#anchorConnectionSsl');
    if (connection.authenticationType === 'mongodb_x509') sslTab.removeAttr('data-toggle');
    else sslTab.attr('data-toggle', 'tab');

    if (connection.ssl) UIComponents.Checkbox.toggleState($('#inputUseSSL'), connection.ssl.enabled ? 'check' : 'uncheck');
    if (connection.options) this.fillFormOptionsExceptConnectWithNoPrimary(connection);
  },

  fillFormOptionsExceptConnectWithNoPrimary(connection) {
    $('#inputConnectionTimeoutOverride').val(connection.options.connectionTimeout);
    $('#inputReplicaSetName').val(connection.options.replicaSetName);
    $('#inputSocketTimeoutOverride').val(connection.options.socketTimeout);
    $('#cmbReadPreference').val(connection.options.readPreference).trigger('chosen:updated');
  },

  prepareFormForEdit(addServerField) {
    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });

    $('#addEditModalSmall').html(connection.connectionName);
    $('#inputConnectionName').val(connection.connectionName);
    this.fillFormConnection(connection, addServerField);
    this.fillFormAuthentication(connection);

    if (connection.ssl) {
      UIComponents.Checkbox.toggleState($('#inputUseSSL'), connection.ssl.enabled ? 'check' : 'uncheck');
      this.fillFormSsl(connection.ssl);
    }
    if (connection.ssh) {
      UIComponents.Checkbox.toggleState($('#inputUseSSH'), connection.ssh.enabled ? 'check' : 'uncheck');
      this.fillFormSsh(connection);
    }
    if (connection.options) {
      this.fillFormOptionsExceptConnectWithNoPrimary(connection);
      UIComponents.Checkbox.toggleState($('#inputConnectWithNoPrimary'), !connection.options.connectWithNoPrimary ? 'uncheck' : 'check');
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
    if (connection.authenticationType !== 'mongodb_x509' && UIComponents.Checkbox.getState($('#inputUseSSL'))) {
      connection.ssl = this.getSSLProps();
    }
    this.fillHostFields(connection);
    this.fillCorrectAuthenticationType(connection);
    if (UIComponents.Checkbox.getState($('#inputUseSSH'))) this.fillSsh(connection);
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
      enabled: UIComponents.Checkbox.getState($('#inputUseSSH')),
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
      connectWithNoPrimary: UIComponents.Checkbox.getState($('#inputConnectWithNoPrimary')),
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
      enabled: UIComponents.Checkbox.getState($('#inputUseSSL')),
      rootCAFileName: $('#inputRootCA').siblings('.bootstrap-filestyle').children('input').val(),
      certificateFileName: $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(),
      passPhrase: $('#inputPassPhrase').val(),
      certificateKeyFileName: $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(),
      disableHostnameVerification: UIComponents.Checkbox.getState($('#inputDisableHostnameVerification'))
    };
  },

  fillCorrectAuthenticationType(connection) {
    if (connection.authenticationType === 'scram_sha_1' || connection.authenticationType === 'scram_sha_256'
      || connection.authenticationType === 'mongodb_cr') {
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
    UIComponents.Checkbox.toggleState($('#inputConnectWithNoPrimary, #inputDisableHostnameVerification, #inputUseSSL, #inputUseSSH'), 'uncheck');
    $('#spanUseSSL').hide();
    $('.divHostField:visible').remove();
    this.selectedAuthType.set('');

    $('#inputConnectionName, #inputUrl, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, '
      + '#inputLdapUsername, #inputLdapPassword, #inputConnectionTimeout, #inputSocketTimeout, #inputSshHostname, '
      + '#inputSshPort, #inputSshLocalPort, #inputSshDestinationPort, #inputSshUsername, #inputSshPassPhrase, #inputSshPassword, #inputUser, #inputPassword, '
      + '#inputAuthenticationDB, #inputPassPhrase, #inputX509Username').val('');
    $('#inputDatabaseName').val('test');
    $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference').find('option').prop('selected', false).trigger('chosen:updated');
    $('#anchorConnectionSsl').attr('data-toggle', 'tab');
    $('#divSshTemplate').hide();
    $('#divSslTemplate').hide();
    this.enableFormsForUri();
  },


  initializeUI() {
    $('.filestyle').filestyle({});
    UIComponents.Combobox.init({ selector: $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference'), options: { allow_single_deselect: true, }, empty: false });
    UIComponents.Checkbox.init($('#inputConnectWithNoPrimary, #inputUseSSH, #inputUseSSL'));

    setDivToggle($('#divUseSSH'), $('#divSshTemplate'), $('#inputUseSSH'));
    setDivToggle($('#divUseSSL'), $('#divSslTemplate'), $('#inputUseSSL'));
  },

  disableFormsForUri() {
    $('.divHostField:visible').find('input, button').prop('disabled', true).parent('div')
      .attr('data-original-title', 'Clear URL to activate here');
    $('#inputDatabaseName, #cmbAuthenticationType, #inputConnectionTimeoutOverride, #inputReplicaSetName, #inputSocketTimeoutOverride, #cmbReadPreference, '
      + '#inputUser, #inputPassword, #inputAuthenticationDB, #inputLdapUsername, #inputLdapPassword, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, #inputX509Username')
      .prop('disabled', true).trigger('chosen:updated').parent('div')
      .attr('data-original-title', 'Clear URL to activate here');
    UIComponents.Checkbox.toggleState($('#inputUseSSL'), 'disable');
    $('#spanUseSSL').show();

    $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  enableFormsForUri() {
    $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
    $('.divHostField:visible').find('input, button').prop('disabled', false).parent('div')
      .attr('data-original-title', '');
    $('#inputDatabaseName, #cmbAuthenticationType, #inputConnectionTimeoutOverride, #inputReplicaSetName, #inputSocketTimeoutOverride, #cmbReadPreference, '
      + '#inputUser, #inputPassword, #inputAuthenticationDB, #inputLdapUsername, #inputLdapPassword, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, #inputX509Username')
      .prop('disabled', false).trigger('chosen:updated').parent('div')
      .attr('data-original-title', '');
    UIComponents.Checkbox.toggleState($('#inputUseSSL'), 'enable');
    $('#spanUseSSL').hide();
    this.selectedAuthType.set($('#cmbAuthenticationType').val());
  },
};

export default new ConnectionHelper();
