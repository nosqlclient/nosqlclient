import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './repl_set_get_status.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.replSetGetStatus.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.replSetGetStatus.executeQuery = function () {
  initExecuteQuery();

  Meteor.call('replSetGetStatus', Meteor.default_connection._lastSessionId, (err, result) => {
    Helper.renderAfterQueryExecution(err, result, true);
  });
};
