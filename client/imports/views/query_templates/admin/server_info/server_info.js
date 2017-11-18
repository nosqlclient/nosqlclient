import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './server_info.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverInfo.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.serverInfo.executeQuery = function () {
  initExecuteQuery();

  Communicator.call({
    methodName: 'serverInfo',
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
