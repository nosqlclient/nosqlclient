import { Communicator } from '/client/imports/facades';
import { ErrorHandler, Notification } from '/client/imports/modules';

const CollectionHelper = function () {

};

CollectionHelper.prototype = {
  executeCommand(command, modalToHideSelector) {
    if (!command) return;

    Communicator.call({
      methodName: 'command',
      args: { command },
      callback: (err, result) => {
        if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
        else {
          Notification.success('saved-successfully');
          if (modalToHideSelector) $(`#${modalToHideSelector}`).modal('hide');
        }
      }
    });
  }
};

export default new CollectionHelper();
