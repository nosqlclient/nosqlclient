import { Template } from 'meteor/templating';
import { FileManagement } from '/client/imports/ui';
import './file_info.html';

Template.fileInfo.events({
  'click #btnAddAlias': function (event) {
    event.preventDefault();
    const input = $('#inputAlias');
    const inputVal = input.val();
    if (inputVal) {
      $('#selectAliases').append($('<option>', {
        value: inputVal,
        text: inputVal,
      }));
      input.val('');
    }
  },

  'click #btnRemoveAlias': function (event) {
    event.preventDefault();
    $('#selectAliases').find('option:selected').remove();
  },

  'click #btnKeepUploading': function (event) {
    event.preventDefault();
    FileManagement.keepUploading();
  },
});
