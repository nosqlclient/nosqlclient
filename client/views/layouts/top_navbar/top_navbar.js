Template.topNavbar.onRendered(function () {

    var selector = $('#tblConnection');
    selector.find('tbody').on('click', 'tr', function () {

        var table = selector.DataTable();

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            Session.set(Template.strSessionConnection, table.row(this).data()._id);
            $('#btnConnect').prop('disabled', false);
        }
    });

    // FIXED TOP NAVBAR OPTION
    // Uncomment this if you want to have fixed top navbar
    // $('body').addClass('fixed-nav');
    // $(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');

    $(":file").filestyle({icon: false, input: false});
    Template.topNavbar.initIChecks();
});


Template.topNavbar.events({
    'change #inputCertificate': function () {
        var blob = $('#inputCertificate')[0].files[0];
        if (blob) {
            $('#inputCertificatePath').val(blob.name);
        } else {
            $('#inputCertificatePath').val('');
        }
    },

    'change #inputRootCa': function () {
        var blob = $('#inputRootCa')[0].files[0];
        if (blob) {
            $('#inputRootCaPath').val(blob.name);
        } else {
            $('#inputRootCaPath').val('');
        }
    },

    'change #inputCertificateKey': function () {
        var blob = $('#inputCertificateKey')[0].files[0];
        if (blob) {
            $('#inputCertificateKeyPath').val(blob.name);
        } else {
            $('#inputCertificateKeyPath').val('');
        }
    },

    'click #btnRefreshCollections': function (e) {
        e.preventDefault();

        Template.topNavbar.connect(true);
    },

    'click #btnCreateNewConnection': function () {
        $('#addEditConnectionModalTitle').text('Add Connection');
        Template.topNavbar.clearAllFieldsOfConnectionModal();
    },

    'click #btnConnectionList': function () {
        if (!Session.get(Template.strSessionConnection)) {
            Template.topNavbar.populateConnectionsTable();

            $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
            $('#btnConnect').prop('disabled', true);
        }
    },

    'click .editor_remove': function (e) {
        e.preventDefault();
        var laddaButton = $('#btnConnect').ladda();
        laddaButton.ladda('start');

        // set rows not selected
        $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
        // remove connection
        Meteor.call('removeConnection', Session.get(Template.strSessionConnection));
        // clear session
        Template.clearSessions();

        Template.topNavbar.populateConnectionsTable();
        Ladda.stopAll();
    },

    'click .editor_edit': function (e) {
        $('#addEditConnectionModalTitle').text('Edit Connection');

        e.preventDefault();
        var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        Template.topNavbar.clearAllFieldsOfConnectionModal();

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
                    $('#inputCertificatePath').val(connection.sslCertificatePath);
                }

                if (connection.rootCACertificatePath) {
                    $("#inputRootCaPath").val(connection.rootCACertificatePath);
                }

                if (connection.certificateKeyPath) {
                    $("#inputCertificateKeyPath").val(connection.certificateKeyPath);
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

        $('#addEditConnectionModal').modal('show');
    },

    // Toggle left navigation
    'click #navbar-minimalize': function (event) {

        event.preventDefault();

        var body = $('body');
        var sideMenu = $('#side-menu');
        // Toggle special class
        body.toggleClass("mini-navbar");

        // Enable smoothly hide/show menu
        if (!body.hasClass('mini-navbar') || body.hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            sideMenu.hide();
            // For smoothly turn on menu
            setTimeout(function () {
                sideMenu.fadeIn(400);
            }, 200);
        } else if (body.hasClass('fixed-sidebar')) {
            sideMenu.hide();
            setTimeout(
                function () {
                    sideMenu.fadeIn(400);
                }, 100);
        } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            sideMenu.removeAttr('style');
        }
    },

    'click #btnSaveConnection': function (e) {
        e.preventDefault();
        var inputCertificatePathSelector = $('#inputCertificatePath');
        var rootCertificatePathSelector = $("#inputRootCaPath");
        var inputCertificateKeyPathSelector = $('#inputCertificateKeyPath');
        var connection = {};

        if ($('#inputUseUrl').iCheck('update')[0].checked) {
            connection.url = $('#inputUrl').val();
            connection.databaseName = Template.topNavbar.parseDatabaseNameFromUrl(connection.url);
            connection.name = $('#inputConnectionNameForUrl').val();
        } else {
            connection.name = $('#inputConnectionName').val();
            connection.host = $('#inputHost').val();
            connection.port = $('#inputPort').val();
            connection.databaseName = $('#inputDatabaseName').val();

            if ($('#inputAuthCertificate').iCheck('update')[0].checked) {
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

        if (!Template.topNavbar.checkConnection(connection)) {
            return;
        }

        var laddaButton = $('#btnSaveConnection').ladda();
        laddaButton.ladda('start');

        var isEdit = $('#addEditConnectionModalTitle').text() == 'Edit Connection';
        var currentConnection;
        if (isEdit) {
            currentConnection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
        }

        if (isEdit) {
            connection._id = Session.get(Template.strSessionConnection);
            Template.topNavbar.loadCertificatesAndSave('updateConnection', connection, currentConnection);
        }
        else {
            Template.topNavbar.loadCertificatesAndSave('saveConnection', connection, currentConnection);
        }
    },

    'click #btnConnect': function () {
        // loading button
        var laddaButton = $('#btnConnect').ladda();
        laddaButton.ladda('start');

        Template.topNavbar.connect(false);
    },

    'click #btnDisconnect': function (e) {
        e.preventDefault();

        Meteor.call('disconnect');
        Template.clearSessions();

        swal({
            title: "Disconnected!",
            text: "Successfuly disconnected",
            type: "success"
        });

        Router.go('databaseStats');
    },

    'click #anchorTab1': function () {
        if (!$('#anchorTab1').attr('data-toggle')) {
            toastr.warning('Disable URI connection to use this tab');
        }
    },

    'click #anchorTab2': function () {
        if (!$('#anchorTab2').attr('data-toggle')) {
            toastr.warning('Disable URI connection to use this tab');
        }
    }
});

Template.topNavbar.clearAllFieldsOfConnectionModal = function () {
    $('#inputConnectionName').val('');
    $('#inputConnectionNameForUrl').val('');
    $('#inputUrl').val('');
    $('#inputHost').val('');
    $('#inputPort').val('27017');
    $('#inputDatabaseName').val('');
    $('#inputUser').val('');
    $('#inputPassword').val('');
    $('#inputAuthenticationDB').val('');
    $("#inputCertificateKeyPath").val('');
    $("#inputCertificatePath").val('');
    $("#inputPassPhrase").val('');
    $("#inputRootCaPath").val('');
    $('#inputUseUrl').iCheck('uncheck');
    $('#inputUseSSL').iCheck('uncheck');
    $('#inputAuthStandard').iCheck('check');
    $(":file").filestyle('clear');
};

Template.topNavbar.proceedSavingConnection = function (saveMethodName, connection) {
    Meteor.call(saveMethodName, connection, function (err) {
        if (err) {
            toastr.warning("Couldn't save connection: " + err.message);
        }
        else {
            Template.topNavbar.populateConnectionsTable();
            toastr.success('Successfuly saved connection');
            $('#addEditConnectionModal').modal('hide');
        }

        Ladda.stopAll();
    });
};

Template.topNavbar.proceedCertificateLoading = function (saveMethodName, connection, currentConnection) {
    var certificateKeySelector = $('#inputCertificateKey');
    if (certificateKeySelector.get(0).files.length == 0 && currentConnection && currentConnection.certificateKey && $('#inputCertificateKeyPath').val()) {
        connection.certificateKey = currentConnection.certificateKey;
        Template.topNavbar.proceedSavingConnection(saveMethodName, connection);
    } else {
        if (certificateKeySelector.get(0).files.length != 0) {
            Template.topNavbar.loadFile(function (file) {
                connection.certificateKey = new Uint8Array(file.target.result);
                Template.topNavbar.proceedSavingConnection(saveMethodName, connection);
            }, certificateKeySelector[0].files[0]);
        }
        else {
            Template.topNavbar.proceedSavingConnection(saveMethodName, connection);
        }
    }
};

Template.topNavbar.proceedRootCertificateLoading = function (saveMethodName, connection, currentConnection) {
    var rootCaSelector = $('#inputRootCa');
    if (rootCaSelector.get(0).files.length == 0 && currentConnection && currentConnection.rootCACertificate && $('#inputRootCaPath').val()) {
        connection.rootCACertificate = currentConnection.rootCACertificate;
        Template.topNavbar.proceedCertificateLoading(saveMethodName, connection, currentConnection);
    } else {
        if (rootCaSelector.get(0).files.length != 0) {
            Template.topNavbar.loadFile(function (file) {
                connection.rootCACertificate = new Uint8Array(file.target.result);
                Template.topNavbar.proceedCertificateLoading(saveMethodName, connection, currentConnection);
            }, rootCaSelector[0].files[0]);

        } else {
            Template.topNavbar.proceedCertificateLoading(saveMethodName, connection, currentConnection);
        }
    }
};

Template.topNavbar.loadCertificatesAndSave = function (saveMethodName, connection, currentConnection) {
    var certificateSelector = $('#inputCertificate');

    if ($('#inputAuthCertificate').iCheck('update')[0].checked && !$('#inputUseUrl').iCheck('update')[0].checked) {
        if (certificateSelector.get(0).files.length == 0 && currentConnection && currentConnection.sslCertificate && $('#inputCertificatePath').val()) {
            connection.sslCertificate = currentConnection.sslCertificate;
            Template.topNavbar.proceedRootCertificateLoading(saveMethodName, connection, currentConnection);
        }
        else {
            if (certificateSelector.get(0).files.length != 0) {
                Template.topNavbar.loadFile(function (file) {
                    connection.sslCertificate = new Uint8Array(file.target.result);
                    Template.topNavbar.proceedRootCertificateLoading(saveMethodName, connection, currentConnection);
                }, certificateSelector[0].files[0]);

            } else {
                Template.topNavbar.proceedRootCertificateLoading(saveMethodName, connection, currentConnection);
            }
        }
    } else {
        Template.topNavbar.proceedSavingConnection(saveMethodName, connection);
    }
};

Template.topNavbar.loadFile = function (callback, blob) {
    var fileReader = new FileReader();
    fileReader.onload = callback;
    fileReader.readAsArrayBuffer(blob);
};


Template.topNavbar.checkConnection = function (connection) {
    if (!connection.name) {
        toastr.error("Connection name can't be empty");
        return false;
    }

    if ($('#inputUseUrl').iCheck('update')[0].checked) {
        if (!connection.url) {
            toastr.error("Url can't be empty");
            return false;
        }

        if (!Template.topNavbar.parseDatabaseNameFromUrl(connection.url)) {
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

Template.topNavbar.connect = function (isRefresh) {
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});

    Meteor.call('connect', connection._id, function (err, result) {
        if (err || result.error) {
            Template.showMeteorFuncError(err, result, "Couldn't connect");
        }
        else {
            result.result.sort(function compare(a, b) {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            });

            Session.set(Template.strSessionCollectionNames, result.result);

            if (!isRefresh) {
                $('#connectionModal').modal('hide');
                swal({
                    title: "Connected!",
                    text: "Successfuly connected to " + connection.name,
                    type: "success"
                });
            }
            else {
                toastr.success("Successfuly refreshed collections");
            }
            Ladda.stopAll();
        }
    });
};

Template.topNavbar.initIChecks = function () {
    var selector = $('#divAuthType');
    selector.iCheck({
        radioClass: 'iradio_square-green'
    });

    var inputAuthStandardSelector = $('#inputAuthStandard');
    var formStandardAuthSelector = $('#formStandardAuth');
    var formCertificateAuthSelector = $('#formCertificateAuth');
    var anchorTab1Selector = $('#anchorTab1');
    var anchorTab2Selector = $('#anchorTab2');
    var inputUseUriSelector = $("#inputUseUrl");

    inputAuthStandardSelector.iCheck('check');

    $('#divUseSSL').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#divUseUrl').iCheck({
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


    inputUseUriSelector.iCheck('uncheck');
    inputUseUriSelector.on('ifChanged', function (event) {
        var inputUriSelector = $('#inputUrl');
        var inputConnectionNameForUrl = $('#inputConnectionNameForUrl');

        var isChecked = event.currentTarget.checked;
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
};

Template.topNavbar.populateConnectionsTable = function () {
    var tblConnections = $('#tblConnection');

    tblConnections.DataTable({
        destroy: true,
        data: Connections.find().fetch(),
        columns: [
            {data: "_id", sClass: "hide_column"},
            {data: "name"},
            {data: "url"},
            {data: "useSsl"},
            {data: "sslCertificatePath"}
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
                data: null,
                bSortable: false,
                defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>'
            },
            {
                targets: [6],
                data: null,
                bSortable: false,
                defaultContent: '<a href="" title="Delete" class="editor_remove"><i class="fa fa-remove text-navy"></i></a>'
            }
        ]
    }).draw();
};

Template.topNavbar.parseDatabaseNameFromUrl = function (url) {
    try {
        var lastIndex = url.length;
        if (url.indexOf('?') != -1) {
            lastIndex = url.indexOf('?');
        }

        var urlSplit = url.split('//');

        if (urlSplit[1].lastIndexOf("/") == -1) {
            return "admin";
        }

        return url.substring(urlSplit[0].length + urlSplit[1].lastIndexOf("/") + 3, lastIndex);
    } catch (e) {
        return "admin";
    }
};