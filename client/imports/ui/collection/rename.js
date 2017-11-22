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
      Notification.warning('Name is required !');
      return;
    }
    if (newName === selectedCollection) {
      Notification.warning('Can not use same name as target name !');
      return;
    }

    Communicator.call({
      methodName: 'rename',
      args: { selectedCollection, newName, options },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result, "Couldn't rename");
        else {
          Notification.success(`Successfully renamed to: ${newName}`);
          $('#renameCollectionModal').modal('hide');
          CollectionUtil.renderCollectionNames();
        }
      }
    });
  }
};

export default new CollectionRename();
