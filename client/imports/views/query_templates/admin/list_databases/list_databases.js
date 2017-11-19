import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';
import { Communicator } from '/client/imports/facades';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './list_databases.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.listDatabases.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.listDatabases.executeQuery = function () {
  initExecuteQuery();

  Communicator.call({
    methodName: 'listDatabases',
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
