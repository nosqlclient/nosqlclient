import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import {FlowRouter} from "meteor/kadira:flow-router";
import Helper from "/client/imports/helper";
import {connect, populateConnectionsTable} from "/client/imports/views/layouts/top_navbar/connections/connections";
import "/client/imports/views/layouts/top_navbar/connections/connections";
import "./top_navbar.html";

const toastr = require('toastr');
const Ladda = require('ladda');
const packageJson = require('/package.json');

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

    $('#versionText').html(packageJson.version);
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
        Helper.warnDemoApp();
    },

    'click #btnRefreshCollections2'() {
        connect(true);
    },

    'click #btnExportMongoclient' (e) {
        e.preventDefault();
        Helper.warnDemoApp();
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
        Helper.warnDemoApp();
    },

    // Toggle left navigation
    'click #navbar-minimalize' (event) {
        event.preventDefault();

        let body = $('body');
        let sideMenu = $('#side-menu');
        const nav = $('.navbar-static-side');
        const pageWrapper = $('#page-wrapper');

        // Toggle special class
        body.toggleClass("mini-navbar");

        // Enable smoothly hide/show menu
        if (!body.hasClass('mini-navbar') || body.hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            console.log('1');
            sideMenu.hide();
            // For smoothly turn on menu
            setTimeout(function () {
                sideMenu.fadeIn(400);
            }, 200);
        } else if (body.hasClass('fixed-sidebar')) {
            console.log('2');
            sideMenu.hide();
            setTimeout(function () {
                sideMenu.fadeIn(400);
            }, 100);
        } else {
            // Remove all inline style from jquery fadeIn  to reset menu state
            sideMenu.removeAttr('style');
        }

        setTimeout(function () {
            nav.removeAttr('style');
            if (nav.css('display') === 'block') pageWrapper.css('margin', '0 0 0 ' + nav.width() + 'px');
            if (nav.css('display') === 'none') pageWrapper.css('margin', '0');
        }, 300);
    },

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