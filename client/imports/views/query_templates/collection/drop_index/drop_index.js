import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';

import './drop_index.html';

/**
 * Created by RSercan on 2.1.2016.
 */
Template.dropIndex.onRendered(() => {
});
Template.dropIndex.events({
  'keypress #inputIndexName': function (event) {
    if (event.keyCode == 13) {
      Template.dropIndex.executeQuery();
      return false;
    }
  },
});

Template.dropIndex.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  const indexName = historyParams ? historyParams.indexName : $('#inputIndexName').val();

  const params = {
    indexName,
  };

  Communicator.call({
    methodName: 'dropIndex',
    args: { selectedCollection, indexName },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'dropIndex', params, (!historyParams));
    }
  });
};

Template.dropIndex.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.indexName) {
      Meteor.setTimeout(() => {
        $('#inputIndexName').val(query.queryParams.indexName);
      }, 100);
    }
  }
};
