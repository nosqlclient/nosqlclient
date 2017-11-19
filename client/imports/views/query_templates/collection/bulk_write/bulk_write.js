import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getBulkWriteOptions } from '/client/imports/views/query_templates_options/bulk_write_options/bulk_write_options';
import './bulk_write.html';

/**
 * Created by RSercan on 15.10.2016.
 */

const toastr = require('toastr');
const Ladda = require('ladda');

Template.bulkWrite.onRendered(() => {
  Helper.initializeCodeMirror($('#divBulkWrite'), 'txtBulkWrite');
  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbBulkWriteOptions');
  $.each(Helper.sortObjectByKey(Enums.BULK_WRITE_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};


Template.bulkWrite.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let operations = historyParams ? JSON.stringify(historyParams.selector) : Helper.getCodeMirrorValue($('#divBulkWrite'));
  const options = historyParams ? historyParams.options : getBulkWriteOptions();

  operations = Helper.convertAndCheckJSON(operations);
  if (operations.ERROR) {
    toastr.error(`Syntax error on operations: ${operations.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const params = {
    selector: operations,
    options,
  };

  Communicator.call({
    methodName: 'bulkWrite',
    args: { selectedCollection, operations, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'bulkWrite', params, (!historyParams));
    }
  });
};


Template.bulkWrite.renderQuery = function (query) {
  if (query.queryParams && query.queryParams.selector) {
    // let codemirror initialize
    Meteor.setTimeout(() => {
      Helper.setCodeMirrorValue($('#divBulkWrite'), JSON.stringify(query.queryParams.selector, null, 1));
    }, 100);
  }

  if (query.queryParams.options) {
    const optionsArray = [];
    for (const property in query.queryParams.options) {
      if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.BULK_WRITE_OPTIONS))[property]) {
        optionsArray.push((_.invert(Enums.BULK_WRITE_OPTIONS))[property]);
      }
    }

    Meteor.setTimeout(() => {
      $('#cmbBulkWriteOptions').val(optionsArray).trigger('chosen:updated');
      Session.set(Helper.strSessionSelectedOptions, optionsArray);
    }, 100);

    // options load
    Meteor.setTimeout(() => {
      for (let i = 0; i < optionsArray.length; i++) {
        const option = optionsArray[i];
        const inverted = (_.invert(Enums.BULK_WRITE_OPTIONS));
        if (option === inverted.ordered) {
          $('#inputOrdered').val(query.queryParams.options.ordered);
        }
        if (option === inverted.bypassDocumentValidation) {
          $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
        }
      }
    }, 200);
  }
};
