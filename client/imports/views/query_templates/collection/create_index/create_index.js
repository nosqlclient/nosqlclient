import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import { Session } from 'meteor/session';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getOptions } from '/client/imports/views/query_templates_options/create_index_options/create_index_options';
import './create_index.html';


const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
/* global _ */
Template.createIndex.onRendered(() => {
  Helper.initializeCodeMirror($('#divFields'), 'txtFields');
  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbCreateIndexOptions');
  $.each(Helper.sortObjectByKey(Enums.CREATE_INDEX_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.createIndex.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  const options = historyParams ? historyParams.options : getOptions();
  let fields = historyParams ? JSON.stringify(historyParams.fields) : Helper.getCodeMirrorValue($('#divFields'));

  fields = Helper.convertAndCheckJSON(fields);
  if (fields.ERROR) {
    toastr.error(`Syntax error on index field: ${fields.ERROR}`);
    Ladda.stopAll();
    return;
  }

  if (options.ERROR) {
    toastr.error(options.ERROR);
    Ladda.stopAll();
    return;
  }

  const params = {
    fields,
    options,
  };

  Communicator.call({
    methodName: 'createIndex',
    args: { selectedCollection, fields, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'createIndex', params, (!historyParams));
    }
  });
};

Template.createIndex.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.fields) {
      Meteor.setTimeout(() => {
        Helper.setCodeMirrorValue($('#divFields'), JSON.stringify(query.queryParams.fields, null, 1));
      }, 100);
    }

    if (query.queryParams.options) {
      const optionsArray = [];
      for (const property in query.queryParams.options) {
        if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.CREATE_INDEX_OPTIONS))[property]) {
          optionsArray.push((_.invert(Enums.CREATE_INDEX_OPTIONS))[property]);
        }
      }

      Meteor.setTimeout(() => {
        $('#cmbCreateIndexOptions').val(optionsArray).trigger('chosen:updated');
        Session.set(Helper.strSessionSelectedOptions, optionsArray);
      }, 100);

      // options load
      Meteor.setTimeout(() => {
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray[i];
          const inverted = (_.invert(Enums.CREATE_INDEX_OPTIONS));
          if (option === inverted.collation) {
            Helper.setCodeMirrorValue($('#divCollation'), JSON.stringify(query.queryParams.options.collation, null, 1));
          }
          if (option === inverted.max) {
            Helper.setCodeMirrorValue($('#divMax'), JSON.stringify(query.queryParams.options.max, null, 1));
          }
          if (option === inverted.min) {
            Helper.setCodeMirrorValue($('#divMin'), JSON.stringify(query.queryParams.options.min, null, 1));
          }
          if (option === inverted.unique) {
            $('#divUnique').iCheck(query.queryParams.options.unique ? 'check' : 'uncheck');
          }
          if (option === inverted.dropDups) {
            $('#divDropDups').iCheck(query.queryParams.options.dropDups ? 'check' : 'uncheck');
          }
          if (option === inverted.sparse) {
            $('#divSparse').iCheck(query.queryParams.options.sparse ? 'check' : 'uncheck');
          }
          if (option === inverted.background) {
            $('#divBackground').iCheck(query.queryParams.options.background ? 'check' : 'uncheck');
          }
          if (option === inverted.name) {
            $('#inputIndexName').val(query.queryParams.options.name);
          }
          if (option === inverted.expireAfterSeconds) {
            $('#inputExpireAfterSeconds').val(query.queryParams.options.expireAfterSeconds);
          }
        }
      }, 200);
    }
  }
};
