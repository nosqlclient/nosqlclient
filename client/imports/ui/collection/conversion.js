import { Notification } from '/client/imports/modules';
import CollectionHelper from './helper';

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

    CollectionHelper.executeCommand({ convertToCapped: collection, size: parseInt(size, 10) }, 'convertToCappedModal');
  }
};

export default new CollectionConversion();
