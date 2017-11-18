import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './server_status.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverStatus.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.serverStatus.executeQuery = function () {
  initExecuteQuery();

  Communicator.call({
    methodName: 'serverStatus',
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
