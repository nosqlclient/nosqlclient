import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { StoredFunctions } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import './stored_functions.html';

Template.storedFunctions.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }
  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  StoredFunctions.prepareEditModal();
  UIComponents.DataTable.initiateDatatable({ selector: $('#tblStoredFunctions'), sessionKey: SessionManager.strSessionSelectedStoredFunction, noDeleteEvent: true });

  this.autorun(() => {
    if (settings.ready() && connections.ready()) {
      StoredFunctions.init();
    }
  });
});

Template.storedFunctions.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'stored_functions' });
  }
});

Template.storedFunctions.events({
  'click #btnRefreshStoredFunctions': function () {
    StoredFunctions.init(true);
  },

  'click #btnSaveStoredFunction': function () {
    StoredFunctions.save();
  },

  'click #btnAddNewStoredFunction': function () {
    const modal = $('#editStoredFunctionModal');
    modal.data('selected', null);
    modal.modal('show');
  },

  'click .editor_edit': function () {
    const data = SessionManager.get(SessionManager.strSessionSelectedStoredFunction);
    if (data) {
      const modal = $('#editStoredFunctionModal');
      modal.data('selected', data);
      modal.modal('show');
    }
  },

  'click .editor_delete': function (event) {
    event.preventDefault();
    StoredFunctions.delete();
  }

});
