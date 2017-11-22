import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, Notification, UIComponents } from '/client/imports/modules';
import './upload_file.html';

Template.uploadFile.onRendered(() => {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) FlowRouter.go('/databaseStats');
});

Template.uploadFile.events({
  'click #btnUpload': function (event) {
    event.preventDefault();
    const blob = $('#inputFile')[0].files[0];
    if (blob) {
      Notification.modal({
        title: 'Are you sure ?',
        text: 'Are you sure to continue uploading file ?',
        type: 'warning',
        cancelButtonText: 'No',
        callback: (isConfirm) => {
          if (isConfirm) {
            const modal = $('#fileInfoModal');
            modal.on('shown.bs.modal', () => {
              UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divMetadata'), txtAreaId: 'txtMetadata' });
            });
            modal.modal('show');
          }
        }
      });
    }
  }
});
