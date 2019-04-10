import { ErrorHandler, Notification, UIComponents } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import { Connection } from '../index';

const validateRename = function (selectedCollection, newName) {
  let result = true;
  if (!newName) {
    Notification.warning('name-required');
    result = false;
  }
  if (newName === selectedCollection) {
    Notification.warning('name-same-with-old');
    result = false;
  }
  if (!selectedCollection) {
    Notification.warning('collection-not-found');
    result = false;
  }

  return result;
};

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

    if (!validateRename(selectedCollection, newName)) return;

    Communicator.call({
      methodName: 'rename',
      args: { selectedCollection, newName, options: { dropTarget: UIComponents.Checkbox.getState($('#inputDropTarget')) } },
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
