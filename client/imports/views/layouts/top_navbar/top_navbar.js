import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import {Connections} from "/lib/imports/collections/connections";
import {connect, populateConnectionsTable} from "/client/imports/views/layouts/top_navbar/connections/connections";
import "/client/imports/views/layouts/top_navbar/connections/connections";
import "./top_navbar.html";

const toastr = require('toastr');
const Ladda = require('ladda');
require('datatables.net')(window, $);
require('datatables.net-buttons')(window, $);
require('datatables.net-responsive')(window, $);

require('datatables.net-bs')(window, $);
require('datatables.net-buttons-bs')(window, $);
require('datatables.net-responsive-bs')(window, $);

export const loadFile = function (currentVal, input, done, readAsString) {
    let fileInput = input.siblings('.bootstrap-filestyle').children('input');
    if (input[0].files.length == 0 && currentVal && fileInput.val()) {
        done(currentVal);
    }
    else if (input[0].files.length != 0) {
        const fileReader = new FileReader();
        fileReader.onload = function (file) {
            if (readAsString) done(file.target.result);
            else done(new Uint8Array(file.target.result));
        };

        if (readAsString) fileReader.readAsText(input[0].files[0], "UTF-8");
        else fileReader.readAsArrayBuffer(input[0].files[0]);
    } else {
        done([]);
    }
};

const init = function () {
    $(".filestyle").filestyle({});
    let selectorForSwitchDatabases = $('#tblSwitchDatabases');
    selectorForSwitchDatabases.find('tbody').on('click', 'tr', function () {
        let table = selectorForSwitchDatabases.DataTable();
        Helper.doTableRowSelectable(table, $(this));

        if (table.row(this).data()) {
            $('#inputDatabaseNameToSwitch').val(table.row(this).data().name);
        }
    });

    $("body").addClass('fixed-sidebar');
};

const populateSwitchDatabaseTable = function (data) {
    let tblSwitchDatabases = $('#tblSwitchDatabases');

    tblSwitchDatabases.DataTable({
        responsive: true,
        destroy: true,
        data: data,
        columns: [
            {data: "name"}
        ],
        columnDefs: []
    }).draw();
};

Template.topNavbar.onRendered(function () {
    let connections = this.subscribe('connections');
    this.autorun(() => {
        if (connections.ready()) {
            init();
        }
    });
});

Template.topNavbar.events({
    'click #btnProceedImportExport'(e) {
        e.preventDefault();
        let laddaButton = Ladda.create(document.querySelector('#btnProceedImportExport'));
        let isImport = $('#importExportMongoclientTitle').text() == 'Import Mongoclient Data';
        let importInput = $('#inputImportBackupFile');
        let exportInput = $('#inputExportBackupDir');

        if (isImport && importInput.val()) {
            laddaButton.start();
            loadFile(null, importInput, function (val) {
                Meteor.call('importMongoclient', val, function (err) {
                    if (err) {
                        toastr.error("Couldn't import: " + err.message);
                    } else {
                        toastr.success("Successfully imported from " + importInput.siblings('.bootstrap-filestyle').children('input').val());
                        $('#importExportMongoclientModal').modal('hide');
                    }

                    Ladda.stopAll();
                });
            }, true);
        }
        else if (!isImport && exportInput.val()) {
            laddaButton.start();
            Meteor.call('exportMongoclient', exportInput.val(), function (err, path) {
                if (err) {
                    toastr.error("Couldn't export: " + err.message);
                } else {
                    toastr.success("Successfully exported to " + path.result);
                    $('#importExportMongoclientModal').modal('hide');
                }

                Ladda.stopAll();
            });
        }

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

    'click #btnRefreshCollections2'() {
        connect(true);
    },

    'click #btnExportMongoclient' (e) {
        e.preventDefault();
        let icon = $('#importExportMongoclientIcon');
        $('#importExportMongoclientTitle').text('Export Mongoclient Data');
        icon.removeClass('fa-download');
        icon.addClass('fa-upload');
        $('#btnProceedImportExport').text('Export');
        $('#frmImportMongoclient').hide();
        $('#frmExportMongoclient').show();
        $('#importExportMongoclientModal').modal('show');
    },

    'click #btnImportMongoclient' (e) {
        e.preventDefault();
        let icon = $('#importExportMongoclientIcon');
        $('#importExportMongoclientTitle').text('Import Mongoclient Data');
        icon.addClass('fa-download');
        icon.removeClass('fa-upload');
        $('#btnProceedImportExport').text('Import');
        $('#frmImportMongoclient').show();
        $('#frmExportMongoclient').hide();
        $('#importExportMongoclientModal').modal('show');
    },

    'click #btnAboutMongoclient' (e) {
        e.preventDefault();
        $('#aboutModal').modal('show');
    },

    'click #btnSwitchDatabase' (e) {
        e.preventDefault();
        $('#switchDatabaseModal').modal('show');

        Ladda.create(document.querySelector('#btnConnectSwitchedDatabase')).start();

        Meteor.call('listDatabases', Meteor.default_connection._lastSessionId, function (err, result) {
            if (err || result.error) {
                Helper.showMeteorFuncError(err, result, "Couldn't fetch databases");
            }
            else {
                result.result.databases.sort(function (a, b) {
                    if (a.name < b.name)
                        return -1;
                    else if (a.name > b.name)
                        return 1;
                    else
                        return 0;
                });

                populateSwitchDatabaseTable(result.result.databases);
                Ladda.stopAll();
            }
        });

    },

    'click #btnConnectionList' () {
        if (!Session.get(Helper.strSessionConnection)) {
            populateConnectionsTable();

            $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
            $('#btnConnect').prop('disabled', true);
        }
    },

    'click #btnConnectSwitchedDatabase' () {
        let selector = $('#inputDatabaseNameToSwitch');
        if (!selector.val()) {
            toastr.error('Please enter a database name or choose one from the list');
            return;
        }

        Ladda.create(document.querySelector('#btnConnectSwitchedDatabase')).start();
        let connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
        connection.databaseName = selector.val();
        Meteor.call('saveConnection', connection);

        connect(false);
    },

    // Toggle left navigation
    /*'click #navbar-minimalize' (event) {
     event.preventDefault();

     let body = $('body');
     let sideMenu = $('#side-menu');
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
     // Remove all inline style from jquery fadeIn  to reset menu state
     sideMenu.removeAttr('style');
     }
     },*/

    'click #btnConnect' () {
        // loading button
        Ladda.create(document.querySelector('#btnConnect')).start();
        connect(false);
    },

    'click #btnDisconnect' (e) {
        e.preventDefault();

        Meteor.call('disconnect', Meteor.default_connection._lastSessionId);
        Helper.clearSessions();

        FlowRouter.go('/databaseStats');
    },

    'click #anchorTab1'  () {
        if (!$('#anchorTab1').attr('data-toggle')) {
            toastr.warning('Disable URI connection to use this tab');
        }
    },

    'click #anchorTab2'  () {
        if (!$('#anchorTab2').attr('data-toggle')) {
            toastr.warning('Disable URI connection to use this tab');
        }
    }
});