import { Meteor } from 'meteor/meteor';
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
  const { filterModal, addCollectionModal, convertToCappedModal, renameModal, validationRulesModal } = CollectionUtil.prepareContextMenuModals();

  $.contextMenu({
    selector: '.navCollection, .navCollectionTop',
    build(trigger) {
      const items = CollectionUtil.prepareContextMenuItems(addCollectionModal, convertToCappedModal, renameModal, validationRulesModal, filterModal);

      if (trigger.hasClass('navCollectionTop')) {
        delete items.manage_collection;
        delete items.sep1;
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
    Meteor.setTimeout(() => {
      const sideMenu = $('#side-menu');
      sideMenu.removeData('mm');
      sideMenu.metisMenu();
    }, 100);
  },

  filtered() {
    return CollectionFilter.isFiltered();
  },

  getCollectionNames() {
    const collectionNames = SessionManager.get(SessionManager.strSessionCollectionNames);
    if (collectionNames) {
      const result = [];
      collectionNames.forEach((collectionName) => {
        if (CollectionFilter.filterRegex.get() && !collectionName.name.match(new RegExp(CollectionFilter.filterRegex.get(), 'i'))) return;
        if ($.inArray(collectionName.name, CollectionFilter.excludedCollectionsByFilter.get()) !== -1) return;

        if (!collectionName.name.startsWith('system')) result.push(collectionName);
      });

      return result;
    }

    return collectionNames;
  },

  getSystemCollectionNames() {
    const collectionNames = SessionManager.get(SessionManager.strSessionCollectionNames);
    if (collectionNames) {
      const result = [];
      collectionNames.forEach((collectionName) => {
        if (CollectionFilter.filterRegex.get() && !collectionName.name.match(new RegExp(CollectionFilter.filterRegex.get(), 'i'))) return;
        if ($.inArray(collectionName.name, CollectionFilter.excludedCollectionsByFilter.get()) !== -1) return;

        if (collectionName.name.startsWith('system')) result.push(collectionName);
      });

      return result;
    }

    return collectionNames;
  },
});
