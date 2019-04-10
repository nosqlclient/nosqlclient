import { ErrorHandler, Notification, SessionManager, UIComponents } from '/client/imports/modules';
import { Communicator, ReactivityProvider } from '../../facades';
import $ from 'jquery';

const setPipelineJsonIfExist = function (result, viewName) {
  Notification.stop();

  let found = false;
  if (result.result) {
    result.result.forEach((col) => {
      if (col.name === viewName) {
        found = true;
        if (col.options && col.options.pipeline) {
          $('#jsonEditorOfViewPipeline').data('jsoneditor').set(col.options.pipeline);
        }
      }
    });
  }

  if (!found) {
    Notification.warning('collection-not-found', null, { name: viewName });
    $('#updateViewPipelineModal').modal('hide');
  }
};

const ViewPipelineUpdater = function () {
};

ViewPipelineUpdater.prototype = {
  initialize() {
    Notification.start('#btnSaveViewPipeline');

    UIComponents.Combobox.initializeCollectionsCombobox($('#cmbCollectionsUpdateViewPipeline'));

    const viewName = $('#updateViewPipelineModal').data('viewName');
    const connection = ReactivityProvider.findOne(ReactivityProvider.types.Connections, { _id: SessionManager.get(SessionManager.strSessionConnection)._id });
    Communicator.call({
      methodName: 'listCollectionNames',
      args: { dbName: connection.databaseName },
      callback: (err, result) => {
        if (err || result.error) {
          ErrorHandler.showMeteorFuncError(err, result);
          $('#updateViewPipelineModal').modal('hide');
        } else setPipelineJsonIfExist(result, viewName);
      }
    });
  },

  resetForm() {
    const jsonEditor = UIComponents.Editor.initializeJSONEditor({ selector: 'jsonEditorOfViewPipeline' });
    jsonEditor.set([]);
    $('#viewName').html($('#updateViewPipelineModal').data('viewName'));
  },

  updateViewPipeline() {
    Notification.start('#btnSaveViewPipeline');

    const modal = $('#updateViewPipelineModal');
    const viewOn = $('#cmbCollectionsUpdateViewPipeline').val();
    const command = { collMod: modal.data('viewName'), pipeline: $('#jsonEditorOfViewPipeline').data('jsoneditor').get() };
    if (viewOn) command.viewOn = viewOn;

    Communicator.call({
      methodName: 'command',
      args: { command },
      callback: (err, result) => {
        if (err || result.error) {
          ErrorHandler.showMeteorFuncError(err, result);
        } else {
          Notification.success('saved-successfully');
          modal.modal('hide');
        }
      }
    });
  }
};

export default new ViewPipelineUpdater();
