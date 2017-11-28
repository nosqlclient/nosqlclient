import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, Notification, UIComponents } from '/client/imports/modules';
import './upload_file.html';

Template.uploadFile.onRendered(() => {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) FlowRouter.go('/databaseStats');

  $('#fileInfoModal').on('shown.bs.modal', () => {
    UIComponents.Editor.initializeCodeMirror({ divSelector: $('#divMetadata'), txtAreaId: 'txtMetadata' });
  });
});

Template.uploadFile.events({
  'click #btnUpload': function (event) {
    event.preventDefault();
    const blob = $('#inputFile')[0].files[0];
    if (!blob) Notification.warning('select-file');
    else $('#fileInfoModal').modal('show');
  }
});
