import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';

import './index_information.html';

/**
 * Created by RSercan on 3.1.2016.
 */
Template.indexInformation.onRendered(() => {
  $('#divFullInformation').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.indexInformation.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  const fullVal = historyParams ? historyParams.full : $('#divFullInformation').iCheck('update')[0].checked;

  const params = {
    full: fullVal,
  };

  Communicator.call({
    methodName: 'indexInformation',
    args: { selectedCollection, isFull: fullVal },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'indexInformation', params, (!historyParams));
    }
  });
};

Template.indexInformation.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    Meteor.setTimeout(() => {
      $('#divFullInformation').iCheck(query.queryParams.full ? 'check' : 'uncheck');
    }, 100);
  }
};
