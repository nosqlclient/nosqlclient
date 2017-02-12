import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {ReactiveVar} from "meteor/reactive-var";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import {Connections} from "/lib/imports/collections/connections";
import "./connections.html";

const toastr = require('toastr');
const Ladda = require('ladda');

require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);

require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);
require('bootstrap-filestyle');

let selectedAuthType = new ReactiveVar("");

export const populateConnectionsTable = function () {
    let tblConnections = $('#tblConnection');

    if ($.fn.dataTable.isDataTable('#tblConnection')) {
        tblConnections.DataTable().destroy();
    }

    tblConnections.DataTable({
        data: Connections.find().fetch(),
        columns: [
            {data: "_id", sClass: "hide_column"},
            {data: "name"},
            {data: "url"},
            {data: "useSsl"},
            {data: "sslCertificatePath"},
            {data: "sshAddress"}
        ],
        columnDefs: [
            {
                targets: [2],
                render: function (data) {
                    if (!data) {
                        return 'false';
                    }
                    return 'true';
                }
            },
            {
                targets: [3],
                render: function (data) {
                    if (!data) {
                        return 'false';
                    }
                    return 'true';
                }
            },
            {
                targets: [4],
                render: function (data) {
                    if (!data) {
                        return 'false';
                    }
                    return 'true';
                }
            },
            {
                targets: [5],
                render: function (data) {
                    if (!data) {
                        return 'false';
                    }
                    return 'true';
                }
            },
            {
                targets: [6],
                data: null,
                bSortable: false,
                defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>'
            },
            {
                targets: [7],
                data: null,
                bSortable: false,
                defaultContent: '<a href="" title="Duplicate" class="editor_duplicate"><i class="fa fa-clone text-navy"></i></a>'
            },
            {
                targets: [8],
                data: null,
                bSortable: false,
                defaultContent: '<a href="" title="Delete" class="editor_remove"><i class="fa fa-remove text-navy"></i></a>'
            }
        ]
    });
};

export const connect = function (isRefresh) {
    let connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    if (!connection) {
        toastr.info('Please select a connection first !');
        Ladda.stopAll();
        return;
    }
    Meteor.call('connect', connection._id, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't connect");
        }
        else {
            result.result.sort(function (a, b) {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            });

            Session.set(Helper.strSessionCollectionNames, result.result);

            if (!isRefresh) {
                $('#connectionModal').modal('hide');
                $('#switchDatabaseModal').modal('hide');

                FlowRouter.go('/databaseStats');
            }
            else {
                toastr.success("Successfuly refreshed collections");
            }
            Ladda.stopAll();
        }
    });
};

const loadSSHCertificate = function (connection, currentConnection, done) {
    if (connection.ssh) {
        if (connection.ssh.certificateFileName) {
            loadCertificate(currentConnection.ssh ? currentConnection.ssh.certificateFile : null, $('#inputSshCertificate'), function (val) {
                connection.ssh.certificateFile = val;
                done(connection);
            });
        }
        else {
            done(connection);
        }
    } else {
        done(connection);
    }
};

const loadSSLCertificates = function (connection, currentConnection, done) {
    if (connection.ssl) {
        loadRootCa(connection, 'ssl', currentConnection, function () {
            loadSSHCertificate(connection, currentConnection, done);
        });
    } else {
        loadSSHCertificate(connection, currentConnection, done);
    }
};
const populateConnection = function (currentConnection, done) {
    let connection = {servers: []};
    let connectionName = $('#inputConnectionName').val();
    connection.connectionName = connectionName ? connectionName : "unnamed_connection";
    connection.url = $('#inputUrl').val();
    connection.authenticationType = $('#cmbAuthenticationType').val();
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
        loadRootCa(connection, 'mongodb_x509', currentConnection, function () {
            loadSSLCertificates(connection, currentConnection, done);
        });
    } else {
        loadSSLCertificates(connection, currentConnection, done);
    }
};

const loadCertificateKeyFile = function (connection, prop, currentConnection, done) {
    if (connection[prop].certificateKeyFileName) {
        loadCertificate(currentConnection[prop] ? currentConnection[prop].certificateKeyFile : null, $('#inputCertificateKey'), function (val) {
            connection[prop].certificateKeyFile = val;
            done();
        });
    } else {
        done();
    }
};

const loadsslCertificate = function (connection, prop, currentConnection, done) {
    if (connection[prop].certificateFileName) {
        loadCertificate(currentConnection[prop] ? currentConnection[prop].certificateFile : null, $('#inputCertificate'), function (val) {
            connection[prop].certificateFile = val;
            loadCertificateKeyFile(connection, prop, currentConnection, done);
        });
    }
    else {
        loadCertificateKeyFile(connection, prop, currentConnection, done);
    }
};

const loadRootCa = function (connection, prop, currentConnection, done) {
    if (connection[prop].rootCAFileName) {
        loadCertificate(currentConnection[prop] ? currentConnection[prop].rootCAFile : null, $('#inputRootCA'), function (val) {
            connection[prop].rootCAFile = val;
            loadsslCertificate(connection, prop, currentConnection, done);
        });
    }
    else {
        loadsslCertificate(connection, prop, currentConnection, done);
    }
};

const loadCertificate = function (currentVal, input, done) {
    let fileInput = input.siblings('.bootstrap-filestyle').children('input');
    if (input[0].files.length == 0 && currentVal && fileInput.val()) {
        done(currentVal);
    }
    else if (input[0].files.length != 0) {
        const fileReader = new FileReader();
        fileReader.onload = function (file) {
            done(new Uint8Array(file.target.result));
        };
        fileReader.readAsArrayBuffer(input[0].files[0]);
    } else {
        done([]);
    }
};

const fillSsh = function (connection) {
    const port = $('#inputSshPort').val();

    connection.ssh = {
        enabled: $('#inputUseSSH').iCheck('update')[0].checked,
        host: $('#inputSshHostname').val(),
        port: port ? parseInt(port) : '',
        username: $('#inputSshUsername').val(),
        certificateFileName: $('#inputSshCertificate').siblings('.bootstrap-filestyle').children('input').val(),
        passPhrase: $('#inputSshPassPhrase').val(),
        password: $('#inputSshPassword').val()
    };
};

const fillOptions = function (connection) {
    const connectionTimeot = $('#inputConnectionTimeoutOverride').val();
    const socketTimeout = $('#inputSocketTimeoutOverride').val();
    connection.options = {
        connectionTimeout: connectionTimeot ? parseInt(connectionTimeot) : '',
        socketTimeout: socketTimeout ? parseInt(socketTimeout) : '',
        readPreference: $('#cmbReadPreference').val(),
        connectWithNoPrimary: $('#inputConnectWithNoPrimary').iCheck('update')[0].checked
    };
};

const fillHostFields = function (connection) {
    for (let divField of $('.divHostField')) {
        divField = $(divField);
        const host = divField.find('.txtHostName').val();
        let port = divField.find('.txtPort').val();
        port = port ? parseInt(port) : '';
        if (host && port) {
            connection.servers.push({host: host, port: port});
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
        disableHostnameVerification: $('#inputDisableHostnameVerification').iCheck('update')[0].checked
    };
};

const fillCorrectAuthenticationType = function (connection) {
    if (connection.authenticationType === 'scram_sha_1' || connection.authenticationType === 'mongodb_cr') {
        connection[connection.authenticationType] = {
            username: $('#inputUser').val(),
            password: $('#inputPassword').val(),
            authSource: $('#inputAuthenticationDB').val()
        };
    }
    else if (connection.authenticationType === 'mongodb_x509') {
        connection.mongodb_x509 = getSSLProps();
    }
    else if (connection.authenticationType === 'gssapi') {
        connection.gssapi = {
            username: $('#inputKerberosUsername').val(),
            password: $('#inputKerberosPassword').val(),
            serviceName: $('#inputKerberosServiceName').val()
        };
    }
    else if (connection.authenticationType === 'plain') {
        connection.plain = {
            username: $('#inputLdapUsername').val(),
            password: $('#inputLdapPassword').val(),
        };
    }
};

const checkConnection = function (connection) {
//TODO
};

const resetForm = function () {
    $('.nav-tabs a[href="#tab-1-connection"]').tab('show');
    $(":file").filestyle('clear');
    $('#addEditModalSmall').html('');
    $('#inputConnectWithNoPrimary, #inputDisableHostnameVerification, #inputUseSSL, #inputUseSSH').iCheck('uncheck');
    $('.divHostField:visible').remove();
    selectedAuthType.set('');

    $('#inputConnectionName, #inputUrl, #inputKerberosUsername, #inputKerberosPassword, #inputKerberosServiceName, ' +
        '#inputLdapUsername, #inputLdapPassword, #inputConnectionTimeout, #inputSocketTimeout, #inputSshHostname, ' +
        '#inputSshPort, #inputSshUsername, #inputSshPassPhrase, #inputSshPassword, #inputUser, #inputPassword, ' +
        '#inputAuthenticationDB, #inputPassPhrase').val('');
    $('#inputDatabaseName').val('test');
    $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference').find('option').prop('selected', false).trigger('chosen:updated');
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
    $(".filestyle").filestyle({});
    $('#cmbAuthenticationType, #cmbSshAuthType, #cmbReadPreference').chosen();
    $('#divConnectWithNoPrimary, #divUseSSL, #divUseSSH').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
};

Template.sslTemplate.onRendered(function () {
    $('.filestyle').filestyle({});
    $('#inputDisableHostnameVerification').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.connections.onRendered(function () {
    let selector = $('#tblConnection');
    selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        Helper.doTableRowSelectable(table, $(this));

        if (table.row(this).data()) {
            Session.set(Helper.strSessionConnection, table.row(this).data()._id);
            $('#btnConnect').prop('disabled', false);
        }

    });

    $('#addEditConnectionModal').on('shown.bs.modal', function () {
        initializeUI();
        resetForm();
        addField('', '27017');
    });
});

Template.connections.helpers({
    authenticationMethod(...methods) {
        return methods.indexOf(selectedAuthType.get()) != -1;
    }
});

Template.connections.events({
    'click #anchorConnectionSsl'(){
        if (!$('#anchorConnectionSsl').attr('data-toggle')) {
            toastr.warning('SSL already set via Mongodb-X509');
        }
    },

    'change #cmbSshAuthType'(){
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

    'change #cmbAuthenticationType'(){
        const authType = $('#cmbAuthenticationType').val();
        const sslTab = $('#anchorConnectionSsl');
        selectedAuthType.set(authType);
        if (authType === 'mongodb_x509') {
            sslTab.removeAttr('data-toggle');
        } else {
            sslTab.attr('data-toggle', 'tab');
        }
    },

    'click .addHost' (){
        addField();
    },

    'click .deleteHost'(e){
        if ($('.divHostField:visible').length === 1) {
            toastr.warning('At least one host is required !');
            return;
        }
        $(e.currentTarget).parents('.divHostField').remove();
    },

    'change .filestyle'(e){
        let inputSelector = $('#' + e.currentTarget.id);
        let blob = inputSelector[0].files[0];
        let fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

        if (blob) {
            fileInput.val(blob.name);
        } else {
            fileInput.val('');
        }
    },

    'click #btnCreateNewConnection' () {
        $('#addEditConnectionModalTitle').text('Add Connection');
        $('#addEditConnectionModal').modal('show');
    },

    'click .editor_remove'  (e) {
        e.preventDefault();

        Ladda.create(document.querySelector('#btnConnect')).start();

        $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
        Meteor.call('removeConnection', Session.get(Helper.strSessionConnection), function (err) {
            if (!err) {
                Helper.clearSessions();
                populateConnectionsTable();
            } else {
                toastr.error("unexpected error during connection remove: " + err.message);
            }

            Ladda.stopAll();
        });

    },

    'click #btnSaveConnection' (e) {
        e.preventDefault();
        Ladda.create(document.querySelector('#btnSaveConnection')).start();
        populateConnection({}, function (connection) {
            checkConnection(connection);
        });
    }
});