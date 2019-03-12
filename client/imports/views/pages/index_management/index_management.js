import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { IndexManagement } from '/client/imports/ui';
import { SessionManager, UIComponents, Notification } from '/client/imports/modules';
import Helper from '/client/imports/helpers/helper';
import './add_index/add_index';
import './view_raw/view_raw';
import './index_management.html';

Template.indexManagement.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  $('#addIndexModal').on('shown.bs.modal', () => { IndexManagement.prepareFormForView(); });
  $('#viewRawModal').on('shown.bs.modal', () => { IndexManagement.initViewRaw(); });

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  this.autorun(() => {
    if (settings.ready() && connections.ready()) {
      UIComponents.initializeCollectionsCombobox($('#cmbCollectionsIndexManagement'));
      UIComponents.Checkbox.init($('#inputUnique, #inputBackground'));
    }
  });
});

Template.indexManagement.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'index_management' });
  }
});

Template.indexManagement.events({
  'click #btnAddIndex': function () {
    if (!$('#cmbCollectionsIndexManagement').val()) {
      Notification.warning('select_collection');
      return;
    }

    const addIndexModal = $('#addIndexModal');
    addIndexModal.data('collection', '');
    addIndexModal.data('index', '');
    addIndexModal.modal('show');
  },

  'click .editor_raw': function (event) {
    const rawModal = $('#viewRawModal');
    rawModal.data('collection', $('#cmbCollectionsIndexManagement').val());
    rawModal.data('index', event.currentTarget.id);
    rawModal.modal('show');
  },

  'click #btnRefreshIndexes': function () {
    IndexManagement.initIndexes();
  },

  'change #cmbCollectionsIndexManagement': function () {
    IndexManagement.initIndexes();
  },

  'click .editor_view': function (event) {
    const addIndexModal = $('#addIndexModal');
    addIndexModal.data('collection', $('#cmbCollectionsIndexManagement').val());
    addIndexModal.data('index', event.currentTarget.id);
    addIndexModal.modal('show');
  },

  'click .editor_remove': function (event) {
    event.preventDefault();
    const indexName = event.currentTarget.id;
    IndexManagement.remove(indexName);
  },
});
