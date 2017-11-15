import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './build_info.html';

Template.buildInfo.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.buildInfo.executeQuery = function () {
  initExecuteQuery();

  Meteor.call('buildInfo', Meteor.default_connection._lastSessionId, (err, result) => {
    Helper.renderAfterQueryExecution(err, result, true);
  });
};
