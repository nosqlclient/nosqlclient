import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './profiling_info.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.profilingInfo.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.profilingInfo.executeQuery = function () {
  initExecuteQuery();
  Meteor.call('profilingInfo', Meteor.default_connection._lastSessionId, (err, result) => {
    Helper.renderAfterQueryExecution(err, result, true);
  });
};
