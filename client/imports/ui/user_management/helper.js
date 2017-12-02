import { ErrorHandler, Notification } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';

const UsermanagemenetHelper = function () {
};

UsermanagemenetHelper.prototype = {
  proceedDroppingRoleOrUser(notificationButton, command, successCallback) {
    Notification.modal({
      title: 'are-you-sure',
      text: 'recover-not-possible',
      type: 'warning',
      callback: (isConfirm) => {
        if (isConfirm) {
          Notification.start(notificationButton);

          const runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

          Communicator.call({
            methodName: 'command',
            args: { command, runOnAdminDB },
            callback: (err, result) => {
              if (err || result.error) ErrorHandler.showMeteorFuncError(err, result);
              else {
                successCallback();
                Notification.success('deleted-successfully');
              }
            }
          });
        }
      }
    });
  }
};

export default new UsermanagemenetHelper();
