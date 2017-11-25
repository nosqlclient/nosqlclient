import { Notification, ErrorHandler } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import { CollectionUtil } from '/client/imports/ui';

const CollectionRename = function () {
};

CollectionRename.prototype = {
  resetForm() {
    $('#spanCollectionNameRename').html($('#renameCollectionModal').data('collection'));
    $('#inputRenameName').val('');
    $('#divDropTarget').iCheck('uncheck');
  },

  rename() {
    Notification.start('#btnRenameCollection');

    const newName = $('#inputRenameName').val();
    const selectedCollection = $('#renameCollectionModal').data('collection');
    const options = { dropTarget: $('#divDropTarget').iCheck('update')[0].checked };

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
          CollectionUtil.renderCollectionNames();
        }
      }
    });
  }
};

export default new CollectionRename();
