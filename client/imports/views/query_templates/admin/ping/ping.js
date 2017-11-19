import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './ping.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.ping.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.ping.executeQuery = function () {
  initExecuteQuery();

  Communicator.call({
    methodName: 'ping',
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
