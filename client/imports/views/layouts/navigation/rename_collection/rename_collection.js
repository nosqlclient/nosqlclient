import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';
import { Communicator } from '/client/imports/facades';
import './rename_collection.html';
import { renderCollectionNames } from '../navigation';

const toastr = require('toastr');
const Ladda = require('ladda');

export const resetForm = function () {
  $('#spanCollectionNameRename').html($('#renameCollectionModal').data('collection'));
  $('#inputRenameName').val('');
  $('#divDropTarget').iCheck('uncheck');
};

Template.renameCollection.events({
  'click #btnRenameCollection': function () {
    Ladda.create(document.querySelector('#btnRenameCollection')).start();

    const newName = $('#inputRenameName').val();
    const selectedCollection = $('#renameCollectionModal').data('collection');
    const options = { dropTarget: $('#divDropTarget').iCheck('update')[0].checked };

    if (!newName) {
      toastr.warning('Name is required !');
      Ladda.stopAll();
      return;
    }
    if (newName == selectedCollection) {
      toastr.warning('Can not use same name as target name !');
      Ladda.stopAll();
      return;
    }

    Communicator.call({
      methodName: 'rename',
      args: { selectedCollection, newName, options },
      callback: (err, result) => {
        if (err || result.error) {
          Helper.showMeteorFuncError(err, result, "Couldn't rename");
        } else {
          toastr.success(`Successfully renamed to: ${newName}`);
          $('#renameCollectionModal').modal('hide');
          renderCollectionNames();
        }

        Ladda.stopAll();
      }
    });
  },
});
