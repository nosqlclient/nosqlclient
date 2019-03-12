import { Notification, ErrorHandler, UIComponents } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import { Connection } from '../index';

const CollectionRename = function () {
};

CollectionRename.prototype = {
  resetForm() {
    $('#spanCollectionNameRename').html($('#renameCollectionModal').data('collection'));
    $('#inputRenameName').val('');
    UIComponents.Checkbox.toggleState($('#inputDropTarget'), 'uncheck');
  },

  rename() {
    Notification.start('#btnRenameCollection');

    const newName = $('#inputRenameName').val();
    const selectedCollection = $('#renameCollectionModal').data('collection');
    const options = { dropTarget: UIComponents.Checkbox.getState($('#inputDropTarget')) };

    if (!newName) {
      Notification.warning('name-required');
      return;
    }
    if (newName === selectedCollection) {
      Notification.warning('name-same-with-old');
      return;
    }

    Communicator.call({
      methodName: 'rename',
      args: { selectedCollection, newName, options },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          Notification.success('collection-renamed-successfully', null, { name: newName });
          $('#renameCollectionModal').modal('hide');
          Connection.connect(false);
        }
      }
    });
  }
};

export default new CollectionRename();
