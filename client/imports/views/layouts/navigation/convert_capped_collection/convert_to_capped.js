import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import './convert_to_capped.html';

const toastr = require('toastr');
const Ladda = require('ladda');

export const resetForm = function () {
  $('#spanCollectionNameConvertToCapped').html($('#convertToCappedModal').data('collection'));
  $('#inputConvertToCappedSize').val('');
};

Template.convertToCapped.events({
  'click #btnConvertToCapped': function () {
    Ladda.create(document.querySelector('#btnConvertToCapped')).start();

    const size = $('#inputConvertToCappedSize').val();
    const collection = $('#convertToCappedModal').data('collection');

    if (!size) {
      toastr.warning('Size is required !');
      Ladda.stopAll();
      return;
    }

    const command = {
      convertToCapped: collection,
      size: parseInt(size, 10),
    };

    Communicator.call({
      methodName: 'command',
      args: { command },
      callback: (err, result) => {
        if (err || result.error) {
          Helper.showMeteorFuncError(err, result, "Couldn't convert");
        } else {
          toastr.success('Successfully converted to capped');
          $('#convertToCappedModal').modal('hide');
        }

        Ladda.stopAll();
      }
    });
  },
});
