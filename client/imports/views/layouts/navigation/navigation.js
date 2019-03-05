import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactivityProvider } from '/client/imports/facades';
import { Enums, Notification, SessionManager } from '/client/imports/modules';
import { CollectionUtil, CollectionFilter, Connection } from '/client/imports/ui';
import $ from 'jquery';
import './add_collection/add_collection';
import './convert_capped_collection/convert_to_capped';
import './rename_collection/rename_collection';
import './validation_rules/validation_rules';
import './filter_collection/filter_collection';
import './update_view_pipeline/update_view_pipeline';
import './navigation.html';

Template.navigation.events({
  'click .anchor-skin': function (event) {
    const body = $('body');
    const skin = event.currentTarget.id;
    localStorage.setItem(Enums.LOCAL_STORAGE_KEYS.MONGOCLIENT_SKIN, skin);
    body.removeClass('skin-1');
    body.removeClass('skin-2');
    body.removeClass('skin-3');
    if (skin !== 'skin-default') body.addClass(skin);
  },

  'click #anchorShell': function (event) {
    event.preventDefault();
    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });

    if (connection.ssl && connection.ssl.enable) {
      Notification.info('not-allowed-for-ssl-connections');
      return;
    }

    FlowRouter.go('/shell');
    CollectionUtil.showMongoBinaryInfo();
  },

  'click #anchorSchemaAnalyzer': function () {
    CollectionUtil.showMongoBinaryInfo();
  },

  'click #anchorDatabaseDumpRestore': function () {
    CollectionUtil.showMongoBinaryInfo();
  },

  'click #btnRefreshCollections': function (event) {
    event.preventDefault();
    Connection.connect(true);
  },

  'click #btnSwitchDatabase2': function (event) {
    event.preventDefault();
    Connection.showSwitchDatabaseModal();
  },

  'click #btnDropAllCollections': function (event) {
    event.preventDefault();
    CollectionUtil.dropAllCollections();
  },

  'click #btnDropDatabase': function (event) {
    event.preventDefault();
    CollectionUtil.dropDatabase();
  },


  'click .aNavigations': function () {
    CollectionUtil.handleNavigationAndSessions();
  },

  'click .navCollection': function (event) {
    if (event.target.id === 'btnDropCollection') return;
    CollectionUtil.setSessionForNavigation(this.name);
  },
});

Template.navigation.onRendered(() => {
  const modals = CollectionUtil.prepareContextMenuModals();

  $.contextMenu({
    selector: '.navCollection, .navCollectionTop .navView',
    build(trigger) {
      const items = CollectionUtil.prepareContextMenuItems(modals);

      if (trigger.hasClass('navCollectionTop')) {
        delete items.manage_collection;
        delete items.sep1;
      }

      if (!trigger.hasClass('navView')) {
        delete items.update_view_pipeline;
      }

      if (!CollectionFilter.isFiltered()) delete items.clear_filter;

      return { items };
    }
  });
});

Template.navigation.helpers({
  equals(a, b) {
    return a === b;
  },

  getServerList() {
    let result = '';
    if (SessionManager.get(SessionManager.strSessionConnection)) {
      const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
      if (connection) connection.servers.forEach((server) => { result += `${server.host}:${server.port}<br/>`; });
    }

    return result;
  },

  initializeMetisMenu() {
    setTimeout(() => {
      const sideMenu = $('#side-menu');
      sideMenu.removeData('mm');
      sideMenu.metisMenu();
    }, 100);
  },

  filtered() {
    return CollectionFilter.isFiltered();
  },

  getCollectionNames() {
    return CollectionUtil.getCollectionNames();
  },

  getSystemCollectionNames() {
    return CollectionUtil.getCollectionNames(true);
  },
});
