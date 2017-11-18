import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';

import './is_capped.html';

/**
 * Created by RSercan on 3.1.2016.
 */
Template.isCapped.onRendered(() => {
});

Template.isCapped.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

  Communicator.call({
    methodName: 'isCapped',
    args: { selectedCollection },
    callback: (err, result) => {
      if (!result.result) {
        result.result = false;
      }
      Helper.renderAfterQueryExecution(err, result, false, 'isCapped', {}, (!historyParams));
    }
  });
};


Template.isCapped.renderQuery = function () {
};
