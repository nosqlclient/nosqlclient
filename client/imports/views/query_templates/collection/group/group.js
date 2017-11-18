/**
 * Created by Sercan on 10.12.2016.
 */
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import './group.html';

const toastr = require('toastr');
const Ladda = require('ladda');

Template.group.onRendered(() => {
  Helper.initializeCodeMirror($('#divKeys'), 'txtKeys');
  Helper.initializeCodeMirror($('#divCondition'), 'txtCondition');
  Helper.initializeCodeMirror($('#divInitial'), 'txtInitial');
  Helper.initializeCodeMirror($('#divReduce'), 'txtReduce');
  Helper.initializeCodeMirror($('#divFinalize'), 'txtFinalize');

  $('#divCommand').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.group.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let keys = historyParams ? JSON.stringify(historyParams.keys) : Helper.getCodeMirrorValue($('#divKeys'));
  let condition = historyParams ? JSON.stringify(historyParams.condition) : Helper.getCodeMirrorValue($('#divCondition'));
  let initial = historyParams ? JSON.stringify(historyParams.initial) : Helper.getCodeMirrorValue($('#divInitial'));
  const reduce = historyParams ? JSON.stringify(historyParams.reduce) : Helper.getCodeMirrorValue($('#divReduce'));
  const finalize = historyParams ? JSON.stringify(historyParams.finalize) : Helper.getCodeMirrorValue($('#divFinalize'));
  const command = $('#inputCommand').iCheck('update')[0].checked;

  if (keys.startsWith('function')) {
    if (keys.parseFunction() == null) {
      toastr.error('Syntax error on keys, not a valid function, you can provide object or array as well');
      Ladda.stopAll();
      return;
    }
  } else {
    keys = Helper.convertAndCheckJSON(keys);
    if (keys.ERROR) {
      toastr.error(`Syntax error on keys: ${keys.ERROR}`);
      Ladda.stopAll();
      return;
    }
  }

  condition = Helper.convertAndCheckJSON(condition);
  if (condition.ERROR) {
    toastr.error(`Syntax error on condition: ${condition.ERROR}`);
    Ladda.stopAll();
    return;
  }

  initial = Helper.convertAndCheckJSON(initial);
  if (initial.ERROR) {
    toastr.error(`Syntax error on initial: ${initial.ERROR}`);
    Ladda.stopAll();
    return;
  }

  if (reduce.parseFunction() == null) {
    toastr.error('Syntax error on reduce, not a valid function');
    Ladda.stopAll();
    return;
  }

  if (finalize.parseFunction() == null) {
    toastr.error('Syntax error on finalize, not a valid function');
    Ladda.stopAll();
    return;
  }

  const params = {
    keys,
    condition,
    initial,
    reduce,
    finalize,
    command,
  };

  Communicator.call({
    methodName: 'group',
    args: { selectedCollection, keys, condition, initial, reduce, finalize, command },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'group', params, (!historyParams));
    }
  });
};


Template.group.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.keys) {
      Meteor.setTimeout(() => {
        if (query.queryParams.keys.startsWith('function')) {
          Helper.setCodeMirrorValue($('#divKeys'), query.queryParams.keys);
        } else {
          const str = JSON.stringify(query.queryParams.keys, null, 1).replace(/\\n/g, '\n');
          Helper.setCodeMirrorValue($('#divKeys'), str.substring(1, str.length - 1));
        }
      }, 100);
    }

    if (query.queryParams.condition) {
      Meteor.setTimeout(() => {
        const str = JSON.stringify(query.queryParams.condition, null, 1).replace(/\\n/g, '\n');
        Helper.setCodeMirrorValue($('#divCondition'), str.substring(1, str.length - 1));
      }, 100);
    }

    if (query.queryParams.initial) {
      Meteor.setTimeout(() => {
        const str = JSON.stringify(query.queryParams.initial, null, 1).replace(/\\n/g, '\n');
        Helper.setCodeMirrorValue($('#divInitial'), str.substring(1, str.length - 1));
      }, 100);
    }

    if (query.queryParams.reduce) {
      Meteor.setTimeout(() => {
        const str = JSON.stringify(query.queryParams.reduce, null, 1).replace(/\\n/g, '\n');
        Helper.setCodeMirrorValue($('#divReduce'), str.substring(1, str.length - 1));
      }, 100);
    }

    if (query.queryParams.finalize) {
      Meteor.setTimeout(() => {
        const str = JSON.stringify(query.queryParams.finalize, null, 1).replace(/\\n/g, '\n');
        Helper.setCodeMirrorValue($('#divFinalize'), str.substring(1, str.length - 1));
      }, 100);
    }

    if (query.queryParams.command) {
      Meteor.setTimeout(() => {
        $('#divCommand').iCheck(query.queryParams.options.command ? 'check' : 'uncheck');
      }, 100);
    }
  }
};
