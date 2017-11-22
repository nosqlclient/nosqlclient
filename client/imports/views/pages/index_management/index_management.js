import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { IndexManagement } from '/client/imports/ui';
import { SessionManager, UIComponents, Notification } from '/client/imports/modules';
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
      UIComponents.initializeCollectionsCombobox();
      $('#divUnique, #divBackground').iCheck({
        checkboxClass: 'icheckbox_square-green',
      });
    }
  });
});

Template.indexManagement.events({
  'click #btnAddIndex': function () {
    if (!$('#cmbCollections').val()) {
      Notification.warning('Please select a collection first !');
      return;
    }

    const addIndexModal = $('#addIndexModal');
    addIndexModal.data('collection', '');
    addIndexModal.data('index', '');
    addIndexModal.modal('show');
  },

  'click .editor_raw': function (event) {
    const rawModal = $('#viewRawModal');
    rawModal.data('collection', $('#cmbCollections').val());
    rawModal.data('index', event.currentTarget.id);
    rawModal.modal('show');
  },

  'click #btnRefreshIndexes': function () {
    IndexManagement.initIndexes();
  },

  'change #cmbCollections': function () {
    IndexManagement.initIndexes();
  },

  'click .editor_view': function (event) {
    const addIndexModal = $('#addIndexModal');
    addIndexModal.data('collection', $('#cmbCollections').val());
    addIndexModal.data('index', event.currentTarget.id);
    addIndexModal.modal('show');
  },

  'click .editor_remove': function (event) {
    event.preventDefault();
    const indexName = event.currentTarget.id;
    IndexManagement.remove(indexName);
  },
});
