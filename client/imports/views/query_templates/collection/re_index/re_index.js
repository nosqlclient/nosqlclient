import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';

import './re_index.html';

/**
 * Created by RSercan on 5.1.2016.
 */
Template.reIndex.onRendered(() => {
});

Template.reIndex.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

  Meteor.call('reIndex', selectedCollection, Meteor.default_connection._lastSessionId, (err, result) => {
    Helper.renderAfterQueryExecution(err, result, false, 'reIndex', {}, (!historyParams));
  });
};

Template.reIndex.renderQuery = function () {
};
