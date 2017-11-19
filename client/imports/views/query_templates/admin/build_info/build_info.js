import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './build_info.html';

Template.buildInfo.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.buildInfo.executeQuery = function () {
  initExecuteQuery();

  Communicator.call({
    methodName: 'buildInfo',
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
