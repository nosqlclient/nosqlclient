import { Template } from 'meteor/templating';
import { UIComponents, Notification, SessionManager } from '/client/imports/modules';
import { MongoclientData, Connection } from '/client/imports/ui';
import $ from 'jquery';
import './connections/connections';
import './top_navbar.html';

require('bootstrap-filestyle');

const packageJson = require('/package.json');

Template.topNavbar.onRendered(function () {
  this.subscribe('connections');
  $('.filestyle').filestyle({});

  UIComponents.DataTable.initiateDatatable({
    selector: $('#tblSwitchDatabases'),
    clickCallback: (table, row) => { $('#inputDatabaseNameToSwitch').val(row.data().name); },
    noDeleteEvent: true
  });

  Connection.prepareColorizeModal();
  $('#versionText').html(packageJson.version);
});

const toggleSideMenu = function (sideMenu) {
  sideMenu.hide();
  // For smoothly turn on menu
  setTimeout(() => {
    sideMenu.fadeIn(400);
  }, 200);
};

Template.topNavbar.events({
  'click #btnProceedImportExport': function (event) {
    event.preventDefault();
    MongoclientData.proceedImportExport();
  },

  'change .filestyle': function (event) {
    const inputSelector = $(`#${event.currentTarget.id}`);
    const blob = inputSelector[0].files[0];
    const fileInput = inputSelector.siblings('.bootstrap-filestyle').children('input');

    if (blob) fileInput.val(blob.name);
    else fileInput.val('');
  },

  'click #btnRefreshCollections2': function () {
    Connection.connect(true);
  },

  'click #btnExportMongoclient': function (event) {
    event.preventDefault();
    window.open('exportMongoclient');
  },

  'click #btnImportMongoclient': function (event) {
    event.preventDefault();
    MongoclientData.prepareImportModal();
  },

  'click #btnAboutMongoclient': function (event) {
    event.preventDefault();
    $('#aboutModal').modal('show');
  },

  'click #btnSwitchDatabase': function (event) {
    event.preventDefault();
    Connection.showSwitchDatabaseModal();
  },

  'click #btnConnectionList': function () {
    if (!SessionManager.get(SessionManager.strSessionConnection)) {
      Connection.populateConnectionsTable();
      Connection.prepareContextMenu();

      $('#tblConnection').DataTable().$('tr.selected').removeClass('selected');
      $('#btnConnect').prop('disabled', true);
    }
  },

  'click #btnSaveColor': function () {
    Connection.colorize();
  },

  'click #btnConnectSwitchedDatabase': function () {
    Connection.switchDatabase();
  },

  // Toggle left navigation
  'click #navbar-minimalize': function (event) {
    event.preventDefault();

    const body = $('body');
    const sideMenu = $('#side-menu');
    const nav = $('.navbar-static-side');
    const pageWrapper = $('#page-wrapper');

    // Toggle special class
    body.toggleClass('mini-navbar');

    // Enable smoothly hide/show menu
    if (!body.hasClass('mini-navbar') || body.hasClass('body-small')) toggleSideMenu(sideMenu);
    else if (body.hasClass('fixed-sidebar')) toggleSideMenu(sideMenu);
    else sideMenu.removeAttr('style');

    setTimeout(() => {
      nav.removeAttr('style');
      if (nav.css('display') === 'block') pageWrapper.css('margin', `0 0 0 ${nav.width()}px`);
      if (nav.css('display') === 'none') pageWrapper.css('margin', '0');
    }, 300);
  },

  'click #btnConnect': function () {
    // loading button
    Notification.start('#btnConnect');
    Connection.connect(false);
  },

  'click #btnDisconnect': function (event) {
    event.preventDefault();
    Connection.disconnect();
  },

  'click #anchorTab1': function () {
    if (!$('#anchorTab1').attr('data-toggle')) Notification.warning('disable-uri-to-use');
  },

  'click #anchorTab2': function () {
    if (!$('#anchorTab2').attr('data-toggle')) Notification.warning('disable-uri-to-use');
  },
});
