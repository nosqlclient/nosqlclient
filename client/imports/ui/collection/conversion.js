import { Notification, ErrorHandler } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';

const CollectionConversion = function () {
};

CollectionConversion.prototype = {
  resetForm() {
    $('#spanCollectionNameConvertToCapped').html($('#convertToCappedModal').data('collection'));
    $('#inputConvertToCappedSize').val('');
  },

  convertToCapped() {
    Notification.start('#btnConvertToCapped');

    const size = $('#inputConvertToCappedSize').val();
    const collection = $('#convertToCappedModal').data('collection');

    if (!size) {
      Notification.warning('size-required');
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
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          Notification.success('collection-converted-successfully');
          $('#convertToCappedModal').modal('hide');
        }
      }
    });
  }
};

export default new CollectionConversion();
