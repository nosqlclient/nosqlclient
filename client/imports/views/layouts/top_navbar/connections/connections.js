/**
 * Created by sercan on 23.11.2016.
 */
import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import Helper from '/client/imports/helper';
import {Connections} from '/lib/imports/collections/connections';

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

const clearAllFieldsOfConnectionModal = function () {
    $('#inputConnectionName').val('');
    $('#inputConnectionNameForUrl').val('');
    $('#inputUrl').val('');
    $('#inputHost').val('');
    $('#inputPort').val('27017');
    $('#inputDatabaseName').val('test');
    $('#inputUser').val('');
    $('#inputPassword').val('');
    $('#inputAuthenticationDB').val('');
    $("#inputPassPhrase").val('');
    $("#inputSshHostname").val('');
    $("#inputSshPort").val('22');
    $("#inputSshUsername").val('');
    $("#cmbSshAuthType").val('').trigger('chosen:updated');
    $("#inputSshPassPhrase").val('');
    $("#inputSshPassword").val('');
    $('#inputX509Username').val('');
    $('#divX509Username').hide();
    $('#inputUseX509').iCheck('uncheck');
    $('#inputUseUrl').iCheck('uncheck');
    $('#inputUseSsh').iCheck('uncheck');
    $('#inputUseSSL').iCheck('uncheck');
    $('#inputReadFromSecondary').iCheck('uncheck');
    $('#inputAuthStandard').iCheck('check');
    $(":file").filestyle('clear');
    $('#addEditModalSmall').html('');
};

const proceedSavingConnection = function (saveMethodName, connection) {
    Meteor.call(saveMethodName, connection, function (err) {
        if (err) {
            toastr.warning("Couldn't save connection: " + err.message);
        }
        else {
            populateConnectionsTable();
            toastr.success('Successfuly saved connection');
            $('#addEditConnectionModal').modal('hide');
        }

        Ladda.stopAll();
    });
};

const proceedCertificateLoading = function (saveMethodName, connection, currentConnection) {
    let certificateKeySelector = $('#inputCertificateKey');
    let fileInput = certificateKeySelector.siblings('.bootstrap-filestyle').children('input');
    if (certificateKeySelector.get(0).files.length == 0 && currentConnection && currentConnection.certificateKey && fileInput.val()) {
        connection.certificateKey = currentConnection.certificateKey;
        proceedSavingConnection(saveMethodName, connection);
    } else {
        if (certificateKeySelector.get(0).files.length != 0) {
            loadFile(function (file) {
                connection.certificateKey = convertToBuffer(file.target.result);
                proceedSavingConnection(saveMethodName, connection);
            }, certificateKeySelector[0].files[0]);
        }
        else {
            proceedSavingConnection(saveMethodName, connection);
        }
    }
};

const proceedRootCertificateLoading = function (saveMethodName, connection, currentConnection) {
    let rootCaSelector = $('#inputRootCa');
    let fileInput = rootCaSelector.siblings('.bootstrap-filestyle').children('input');

    if (rootCaSelector.get(0).files.length == 0 && currentConnection && currentConnection.rootCACertificate && fileInput.val()) {
        connection.rootCACertificate = currentConnection.rootCACertificate;
        proceedCertificateLoading(saveMethodName, connection, currentConnection);
    } else {
        if (rootCaSelector.get(0).files.length != 0) {
            loadFile(function (file) {
                connection.rootCACertificate = convertToBuffer(file.target.result);
                proceedCertificateLoading(saveMethodName, connection, currentConnection);
            }, rootCaSelector[0].files[0]);

        } else {
            proceedCertificateLoading(saveMethodName, connection, currentConnection);
        }
    }
};

const loadCertificatesAndSave = function (saveMethodName, connection, currentConnection) {
    let sshCertificateSelector = $('#inputSshCertificate');
    let fileInput = sshCertificateSelector.siblings('.bootstrap-filestyle').children('input');

    if (sshCertificateSelector.get(0).files.length == 0 && currentConnection && currentConnection.sshCertificate && fileInput.val()) {
        connection.sshCertificate = currentConnection.sshCertificate;
        proceedLoadingCertificates(saveMethodName, connection, currentConnection);
    } else {
        if (sshCertificateSelector.get(0).files.length != 0) {
            loadFile(function (file) {
                connection.sshCertificate = convertToBuffer(file.target.result);
                proceedLoadingCertificates(saveMethodName, connection, currentConnection);
            }, sshCertificateSelector[0].files[0]);

        } else {
            proceedLoadingCertificates(saveMethodName, connection, currentConnection);
        }
    }
};

const proceedLoadingCertificates = function (saveMethodName, connection, currentConnection) {
    let certificateSelector = $('#inputCertificate');
    let fileInput = certificateSelector.siblings('.bootstrap-filestyle').children('input');

    if ($('#inputAuthCertificate').iCheck('update')[0].checked && !$('#inputUseUrl').iCheck('update')[0].checked) {
        if (certificateSelector.get(0).files.length == 0 && currentConnection && currentConnection.sslCertificate && fileInput.val()) {
            connection.sslCertificate = currentConnection.sslCertificate;
            proceedRootCertificateLoading(saveMethodName, connection, currentConnection);
        }
        else {
            if (certificateSelector.get(0).files.length != 0) {
                loadFile(function (file) {
                    connection.sslCertificate = convertToBuffer(file.target.result);
                    proceedRootCertificateLoading(saveMethodName, connection, currentConnection);
                }, certificateSelector[0].files[0]);

            } else {
                proceedRootCertificateLoading(saveMethodName, connection, currentConnection);
            }
        }
    } else {
        proceedSavingConnection(saveMethodName, connection);
    }
};

const loadFile = function (callback, blob) {
    let fileReader = new FileReader();
    fileReader.onload = callback;
    fileReader.readAsArrayBuffer(blob);
};

const checkConnection = function (connection) {

    let sshAuthTypeSelector = $('#cmbSshAuthType');

    if (!connection.name) {
        toastr.error("Connection name can't be empty");
        return false;
    }

    if ($('#inputUseSsh').iCheck('update')[0].checked) {
        if (!connection.sshAddress) {
            toastr.error("Ssh hostname can't be empty");
            return false;
        }

        if (!connection.sshPort) {
            toastr.error("Ssh port can't be empty");
            return false;
        }

        if (!connection.sshUser) {
            toastr.error("Ssh user can't be empty");
            return false;
        }

        if (!sshAuthTypeSelector.find(":selected").text()) {
            toastr.error("Ssh authentication type can't be empty");
            return false;
        }

        if (sshAuthTypeSelector.find(":selected").text() == 'Password') {
            if (!connection.sshPassword) {
                toastr.error("Ssh password can't be empty");
                return false;
            }
        } else {
            if (!connection.sshCertificatePath) {
                toastr.error("Ssh certificate path can't be empty");
                return false;
            }
        }
    }


    if ($('#inputUseUrl').iCheck('update')[0].checked) {
        if (!connection.url) {
            toastr.error("Url can't be empty");
            return false;
        }

        if (!parseDatabaseNameFromUrl(connection.url)) {
            toastr.error("Url should include db name");
            return false;
        }

    } else {
        if (!connection.host) {
            toastr.error("Host can't be empty");
            return false;
        }
        if (!connection.port) {
            toastr.error("Port can't be empty");
            return false;
        }
        if (!connection.databaseName) {
            toastr.error("Database name can't be empty");
            return false;
        }

        if (!$('#inputAuthCertificate').iCheck('update')[0].checked) {
            if (connection.passPhrase) {
                connection.passPhrase = "";
                toastr.warning('Removed passPhrase, since there is no certificate');
            }
        }
    }

    return true;
};

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

const parseDatabaseNameFromUrl = function (url) {
    try {
        let lastIndex = url.length;
        if (url.indexOf('?') != -1) {
            lastIndex = url.indexOf('?');
        }

        let urlSplit = url.split('//');

        if (urlSplit[1].lastIndexOf("/") == -1) {
            return "admin";
        }

        return url.substring(urlSplit[0].length + urlSplit[1].lastIndexOf("/") + 3, lastIndex);
    } catch (e) {
        return "admin";
    }
};

const convertToBuffer = function (buffer) {
    return new Uint8Array(buffer);
};

const initChosen = function () {
    let cmb = $('#cmbSshAuthType');

    cmb.append($("<option></option>")
        .attr("value", "Password")
        .text("Password"));
    cmb.append($("<option></option>")
        .attr("value", "Key File")
        .text("Key File"));

    cmb.chosen({width: '100%'});
};

const initIChecks = function () {
    let selector = $('#divAuthType');
    selector.iCheck({
        radioClass: 'iradio_square-green'
    });

    let inputAuthStandardSelector = $('#inputAuthStandard');
    let formStandardAuthSelector = $('#formStandardAuth');
    let formCertificateAuthSelector = $('#formCertificateAuth');
    let anchorTab1Selector = $('#anchorTab1');
    let anchorTab2Selector = $('#anchorTab2');
    let inputUseUriSelector = $("#inputUseUrl");
    let inputUseSshSelector = $("#inputUseSsh");
    let inputUseX509Username = $("#inputUseX509");
    let inputReadFromSecondary = $("#inputReadFromSecondary");

    inputAuthStandardSelector.iCheck('check');

    $('#divUseSSL, #divUseSsh, #divUseUrl, #divReadFromSecondary, #divUseX509').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    inputAuthStandardSelector.on('ifChecked', function () {
        formStandardAuthSelector.show();
        formCertificateAuthSelector.hide();
    });

    $('#inputAuthCertificate').on('ifChecked', function () {
        formStandardAuthSelector.hide();
        formCertificateAuthSelector.show();
    });

    inputReadFromSecondary.iCheck('uncheck');

    inputUseX509Username.iCheck('uncheck');
    inputUseX509Username.on('ifChanged', function (event) {
        let divX509UsernameSelector = $('#divX509Username');

        let isChecked = event.currentTarget.checked;
        if (isChecked) {
            divX509UsernameSelector.show();
        } else {
            divX509UsernameSelector.hide();
        }
    });

    inputUseUriSelector.iCheck('uncheck');
    inputUseUriSelector.on('ifChanged', function (event) {
        let inputUriSelector = $('#inputUrl');
        let inputConnectionNameForUrl = $('#inputConnectionNameForUrl');

        let isChecked = event.currentTarget.checked;
        if (isChecked) {
            inputUriSelector.prop('disabled', false);
            inputConnectionNameForUrl.prop('disabled', false);
            anchorTab1Selector.removeAttr("data-toggle");
            anchorTab2Selector.removeAttr("data-toggle");
        } else {
            inputUriSelector.prop('disabled', true);
            inputConnectionNameForUrl.prop('disabled', true);
            anchorTab1Selector.attr('data-toggle', 'tab');
            anchorTab2Selector.attr('data-toggle', 'tab');
        }
    });

    inputUseSshSelector.iCheck('uncheck');
    inputUseSshSelector.on('ifChanged', function (event) {
        let inputSshHostnameSelector = $('#inputSshHostname');
        let inputSshPortSelector = $('#inputSshPort');
        let inputSshUsernameSelector = $('#inputSshUsername');
        let comboSshAuthTypeSelector = $('#cmbSshAuthType');
        let inputSshPasswordSelector = $('#inputSshPassword');
        let inputSshCertificatePathSelector = $('#inputSshCertificatePath');
        let inputSshCertificateSelector = $('#inputSshCertificate');
        let inputSshPassPhrase = $('#inputSshPassPhrase');


        let isChecked = event.currentTarget.checked;
        if (isChecked) {
            inputSshHostnameSelector.prop('disabled', false);
            inputSshPortSelector.prop('disabled', false);
            inputSshUsernameSelector.prop('disabled', false);
            comboSshAuthTypeSelector.prop('disabled', false).trigger("chosen:updated");
            inputSshCertificatePathSelector.prop('disabled', false);
            inputSshCertificateSelector.prop('disabled', false);
            inputSshPassPhrase.prop('disabled', false);
            inputSshPasswordSelector.prop('disabled', false);
        } else {
            inputSshHostnameSelector.prop('disabled', true);
            inputSshPortSelector.prop('disabled', true);
            inputSshUsernameSelector.prop('disabled', true);
            comboSshAuthTypeSelector.prop('disabled', true).trigger("chosen:updated");
            inputSshCertificatePathSelector.prop('disabled', true);
            inputSshCertificateSelector.prop('disabled', true);
            inputSshPassPhrase.prop('disabled', true);
            inputSshPasswordSelector.prop('disabled', true);
        }

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

const populateConnectionModal = function () {
    let connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    clearAllFieldsOfConnectionModal();

    $('#addEditModalSmall').html(connection.name);
    if (connection.x509Username) {
        $('#divX509Username').show();
        $('#inputUseX509').iCheck('check');
        $('#inputX509Username').val(connection.x509Username);
    } else {
        $('#inputUseX509').iCheck('uncheck');
        $('#divX509Username').hide();
    }

    if (connection.readFromSecondary) {
        $('#inputReadFromSecondary').iCheck('check');
    } else {
        $('#inputReadFromSecondary').iCheck('uncheck');
    }

    if (connection.sshAddress) {
        $('#inputUseSsh').iCheck('check');
        $('#inputSshHostname').val(connection.sshAddress);
        $('#inputSshPort').val(connection.sshPort);
        $('#inputSshUsername').val(connection.sshUser);

        if (connection.sshPassword) {
            $("#cmbSshAuthType").val('Password').trigger('chosen:updated');
            $('#inputSshPassword').val(connection.sshPassword);
            $('#formSshPasswordAuth').show();
            $('#formSshCertificateAuth').hide();
        }
        if (connection.sshCertificatePath) {
            $("#cmbSshAuthType").val('Key File').trigger('chosen:updated');
            $('#inputSshCertificate').siblings('.bootstrap-filestyle').children('input').val(connection.sshCertificatePath);
            $('#formSshPasswordAuth').hide();
            $('#formSshCertificateAuth').show();
        }
        if (connection.sshPassPhrase) {
            $('#inputSshPassPhrase').val(connection.sshPassPhrase);
        }
    } else {
        $('#inputUseSsh').iCheck('uncheck');
    }

    if (connection.url) {
        $('#inputUseUrl').iCheck('check');
        $('#inputUrl').val(connection.url);
        $('#inputConnectionNameForUrl').val(connection.name);
        $('.nav-tabs a[href="#tab-3-url"]').tab('show');
    } else {
        $('#inputUseUrl').iCheck('uncheck');
        $('#inputConnectionName').val(connection.name);
        $('#inputHost').val(connection.host);
        $('#inputPort').val(connection.port);
        $('#inputDatabaseName').val(connection.databaseName);

        if (connection.sslCertificatePath || connection.rootCACertificatePath || connection.certificateKeyPath) {
            $('#inputAuthStandard').iCheck('uncheck');
            $('#inputAuthCertificate').iCheck('check');
            $('#inputPassPhrase').val(connection.passPhrase);

            if (connection.sslCertificatePath) {
                $('#inputCertificate').siblings('.bootstrap-filestyle').children('input').val(connection.sslCertificatePath);
            }

            if (connection.rootCACertificatePath) {
                $('#inputRootCa').siblings('.bootstrap-filestyle').children('input').val(connection.rootCACertificatePath);
            }

            if (connection.certificateKeyPath) {
                $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input').val(connection.certificateKeyPath);
            }

        } else {
            $('#inputAuthStandard').iCheck('check');
            $('#inputAuthCertificate').iCheck('uncheck');
            $('#inputUser').val(connection.user);
            $('#inputPassword').val(connection.password);
            $('#inputAuthenticationDB').val(connection.authDatabaseName);

            if (connection.useSsl) {
                $('#inputUseSSL').iCheck('check');
            } else {
                $('#inputUseSSL').iCheck('uncheck');
            }
        }
    }
};

Template.connections.onRendered(function () {
    let selector = $('#tblConnection');
    selector.find('tbody').on('click', 'tr', function () {
        const table = selector.DataTable();
        Helper.doTableRowSelectable(table,$(this));

        if (table.row(this).data()) {
            Session.set(Helper.strSessionConnection, table.row(this).data()._id);
            $('#btnConnect').prop('disabled', false);
        }

    });

    $(".filestyle").filestyle({});

    initIChecks();
    initChosen();
});

Template.connections.events({
    'change #inputCertificate'() {
        let inputSelector = $('#inputCertificate');
        let blob = inputSelector[0].files[0];
        let fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

        if (blob) {
            fileInput.val(blob.name);
        } else {
            fileInput.val('');
        }
    },

    'change #inputSshCertificate' () {
        let inputSelector = $('#inputSshCertificate');
        let blob = inputSelector[0].files[0];
        let fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

        if (blob) {
            fileInput.val(blob.name);
        } else {
            fileInput.val('');
        }
    },

    'change #inputRootCa' () {
        let inputSelector = $('#inputRootCa');
        let blob = inputSelector[0].files[0];
        let fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

        if (blob) {
            fileInput.val(blob.name);
        } else {
            fileInput.val('');
        }
    },

    'change #inputCertificateKey' () {
        let inputSelector = $('#inputCertificateKey');
        let blob = inputSelector[0].files[0];
        let fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

        if (blob) {
            fileInput.val(blob.name);
        } else {
            fileInput.val('');
        }
    },

    'change #cmbSshAuthType' () {
        let value = $('#cmbSshAuthType').find(":selected").text();
        let passAuth = $('#formSshPasswordAuth');
        let certificateAuth = $('#formSshCertificateAuth');
        if (value == 'Password') {
            passAuth.show();
            certificateAuth.hide();
        }
        else {
            certificateAuth.show();
            passAuth.hide();
        }
    },

    'click #btnCreateNewConnection' () {
        $('#addEditConnectionModalTitle').text('Add Connection');
        clearAllFieldsOfConnectionModal();
    },

    'click .editor_remove'  (e) {
        e.preventDefault();

        let laddaButton = Ladda.create(document.querySelector('#btnConnect'));
        laddaButton.start();

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

    'click .editor_edit' (e) {
        $('#addEditConnectionModalTitle').text('Edit Connection');
        e.preventDefault();
        populateConnectionModal();
        $('#addEditConnectionModal').modal('show');
    },

    'click .editor_duplicate' (e) {
        $('#addEditConnectionModalTitle').text('Clone Connection');
        e.preventDefault();
        populateConnectionModal();
        $('#addEditConnectionModal').modal('show');
    },

    'click #btnSaveConnection' (e) {
        e.preventDefault();
        let inputCertificatePathSelector = $('#inputCertificate').siblings('.bootstrap-filestyle').children('input');
        let rootCertificatePathSelector = $('#inputRootCa').siblings('.bootstrap-filestyle').children('input');
        let inputCertificateKeyPathSelector = $('#inputCertificateKey').siblings('.bootstrap-filestyle').children('input');
        let cmbSShAuthTypeSelector = $('#cmbSshAuthType');
        let inputSShPassPhraseSelector = $('#inputSshPassPhrase');
        let inputSshCertificatePathSelector = $('#inputSshCertificate').siblings('.bootstrap-filestyle').children('input');
        let connection = {};

        connection.readFromSecondary = $('#inputReadFromSecondary').iCheck('update')[0].checked;

        if ($('#inputUseSsh').iCheck('update')[0].checked) {
            connection.sshAddress = $('#inputSshHostname').val();
            connection.sshPort = $('#inputSshPort').val();
            connection.sshUser = $('#inputSshUsername').val();

            if (cmbSShAuthTypeSelector.val() == 'Password') {
                connection.sshPassword = $('#inputSshPassword').val();
            }
            else if (cmbSShAuthTypeSelector.val() == 'Key File') {
                if (inputSshCertificatePathSelector.val()) {
                    connection.sshCertificatePath = inputSshCertificatePathSelector.val();
                }
                if (inputSShPassPhraseSelector.val()) {
                    connection.sshPassPhrase = inputSShPassPhraseSelector.val();
                }
            }
        }

        if ($('#inputUseUrl').iCheck('update')[0].checked) {
            connection.url = $('#inputUrl').val();
            connection.databaseName = parseDatabaseNameFromUrl(connection.url);
            connection.name = $('#inputConnectionNameForUrl').val();
        } else {
            connection.name = $('#inputConnectionName').val();
            connection.host = $('#inputHost').val();
            connection.port = $('#inputPort').val();
            connection.databaseName = $('#inputDatabaseName').val();

            if ($('#inputAuthCertificate').iCheck('update')[0].checked) {
                let x509 = $('#inputX509Username');
                if ($('#inputUseX509').iCheck('update')[0].checked && x509.val()) {
                    connection.x509Username = x509.val();
                }

                if (inputCertificatePathSelector.val()) {
                    connection.sslCertificatePath = inputCertificatePathSelector.val();
                    connection.passPhrase = $("#inputPassPhrase").val();
                }

                if (rootCertificatePathSelector.val()) {
                    connection.rootCACertificatePath = rootCertificatePathSelector.val();
                }

                if (inputCertificateKeyPathSelector.val()) {
                    connection.certificateKeyPath = inputCertificateKeyPathSelector.val();
                }

            } else {
                connection.user = $('#inputUser').val();
                connection.password = $('#inputPassword').val();
                connection.authDatabaseName = $('#inputAuthenticationDB').val();
                connection.useSsl = $('#inputUseSSL').iCheck('update')[0].checked;
            }
        }

        if (!checkConnection(connection)) {
            return;
        }


        let laddaButton = Ladda.create(document.querySelector('#btnSaveConnection'));
        laddaButton.start();

        let isEdit = $('#addEditConnectionModalTitle').text() == 'Edit Connection';
        let currentConnection;
        if (isEdit) {
            currentConnection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
        }
        if (isEdit) {
            connection._id = Session.get(Helper.strSessionConnection);
            loadCertificatesAndSave('updateConnection', connection, currentConnection);
        }
        else {
            loadCertificatesAndSave('saveConnection', connection, currentConnection);
        }
    }
});