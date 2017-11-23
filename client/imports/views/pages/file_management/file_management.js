import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { FileManagement } from '/client/imports/ui';
import '/client/imports/views/query_templates_options/selector/selector';
import './upload_file/upload_file';
import './file_info/file_info';
import './file_management.html';

Template.fileManagement.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  this.autorun(() => {
    if (settings.ready() && connections.ready()) {
      FileManagement.initFilesInformation();
      UIComponents.DataTable.initiateDatatable({ selector: $('#tblFiles'), sessionKey: SessionManager.strSessionSelectedFile, noDeleteEvent: true });
    }
  });
});

Template.fileManagement.events({
  'click #btnDeleteFiles': function () {
    FileManagement.deleteFiles();
  },

  'click #btnReloadFiles': function () {
    FileManagement.initFilesInformation();
  },

  'click .editor_download': function (event) {
    event.preventDefault();
    FileManagement.download();
  },

  'click .editor_delete': function (event) {
    event.preventDefault();
    FileManagement.delete();
  },

  'click #btnUpdateMetadata': function (event) {
    event.preventDefault();
    FileManagement.updateMetadata();
  },

  'click .editor_show_metadata': function (event) {
    event.preventDefault();
    FileManagement.showMetadata();
  },

});
