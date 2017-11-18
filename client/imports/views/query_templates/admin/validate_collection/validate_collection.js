import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './validate_collection.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.validateCollection.onRendered(() => {
  Helper.initializeCodeMirror($('#divOptions'), 'txtOptions');
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.validateCollection.executeQuery = function () {
  initExecuteQuery();
  const collectionName = $('#inputValidateCollection').val();
  let options = Helper.getCodeMirrorValue($('#divOptions'));

  if (!collectionName || collectionName.length === 0) {
    toastr.error('CollectionName can not be empty');
    Ladda.stopAll();
    return;
  }

  options = Helper.convertAndCheckJSON(options);
  if (options.ERROR) {
    toastr.error(`Syntax error on options: ${options.ERROR}`);
    Ladda.stopAll();
    return;
  }

  Communicator.call({
    methodName: 'validateCollection',
    args: { collectionName, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
