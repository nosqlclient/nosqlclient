import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
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

  Communicator.call({
    methodName: 'reIndex',
    args: { selectedCollection },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'reIndex', {}, (!historyParams));
    }
  });
};

Template.reIndex.renderQuery = function () {
};
