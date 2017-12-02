import {ErrorHandler, Notification, SessionManager} from "../../modules";
import {Communicator} from "../../facades";

const UsermanagemenetHelper = function () {

};

UsermanagemenetHelper.prototype = {
  proceedDroppingRoleOrUser(notificationButton, command ){
    if (!SessionManager.get(SessionManager.strSessionUsermanagementUser)) return;

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
                this.initUsers();
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