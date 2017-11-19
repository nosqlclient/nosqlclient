import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import { getOptions } from '/client/imports/views/query_templates_options/insert_many_options/insert_many_options';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import './insert_many.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(() => {
  Helper.initializeCodeMirror($('#divDocs'), 'txtDocs');
  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbInsertManyOptions');
  $.each(Helper.sortObjectByKey(Enums.INSERT_MANY_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};


Template.insertMany.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let docs = historyParams ? JSON.stringify(historyParams.docs) : Helper.getCodeMirrorValue($('#divDocs'));
  const options = historyParams ? historyParams.options : getOptions();

  docs = Helper.convertAndCheckJSON(docs);
  if (docs.ERROR) {
    toastr.error(`Syntax error on docs: ${docs.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const params = {
    docs,
    options,
  };

  Communicator.call({
    methodName: 'insertMany',
    args: { selectedCollection, docs, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'insertMany', params, (!historyParams));
    }
  });
};

Template.insertMany.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.docs) {
      Meteor.setTimeout(() => {
        Helper.setCodeMirrorValue($('#divDocs'), JSON.stringify(query.queryParams.docs, null, 1));
      }, 100);
    }

    if (query.queryParams.options) {
      const optionsArray = [];
      for (const property in query.queryParams.options) {
        if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.INSERT_MANY_OPTIONS))[property]) {
          optionsArray.push((_.invert(Enums.INSERT_MANY_OPTIONS))[property]);
        }
      }

      Meteor.setTimeout(() => {
        $('#cmbInsertManyOptions').val(optionsArray).trigger('chosen:updated');
        Session.set(Helper.strSessionSelectedOptions, optionsArray);
      }, 100);

      // options load
      Meteor.setTimeout(() => {
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray[i];
          const inverted = (_.invert(Enums.INSERT_MANY_OPTIONS));
          if (option === inverted.bypassDocumentValidation) {
            $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
          }
          if (option === inverted.serializeFunctions) {
            $('#divSerializeFunctions').iCheck(query.queryParams.options.serializeFunctions ? 'check' : 'uncheck');
          }
        }
      }, 200);
    }
  }
};
