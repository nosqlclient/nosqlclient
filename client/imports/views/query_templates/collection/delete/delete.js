import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import { Session } from 'meteor/session';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getSelectorValue } from '/client/imports/views/query_templates_options/selector/selector';

import './delete.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.delete.onRendered(() => {
});

Template.delete.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

  selector = Helper.convertAndCheckJSON(selector);
  if (selector.ERROR) {
    toastr.error(`Syntax error on selector: ${selector.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const params = {
    selector,
  };

  Communicator.call({
    methodName: 'delete',
    args: { selectedCollection, selector },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'delete', params, (!historyParams));
    }
  });
};

Template.delete.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.selector) {
      Meteor.setTimeout(() => {
        Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
      }, 100);
    }
  }
};
