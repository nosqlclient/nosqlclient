import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import { $ } from 'meteor/jquery';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getSelectorValue } from '/client/imports/views/query_templates_options/selector/selector';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import './distinct.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.distinct.onRendered(() => {
  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbDistinctOptions');
  $.each(Helper.sortObjectByKey(Enums.DISTINCT_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.distinct.events({
  'keypress #inputField': function (event) {
    if (event.keyCode == 13) {
      Template.distinct.executeQuery();
      return false;
    }
  },
});

Template.distinct.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
  const fieldName = historyParams ? historyParams.fieldName : $('#inputField').val();
  const options = historyParams ? historyParams.options : {};

  if ($.inArray('MAX_TIME_MS', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    const maxTimeMsVal = $('#inputMaxTimeMs').val();
    if (maxTimeMsVal) {
      options[Enums.DISTINCT_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMsVal);
    }
  }

  selector = Helper.convertAndCheckJSON(selector);
  if (selector.ERROR) {
    toastr.error(`Syntax error on selector: ${selector.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const params = {
    selector,
    fieldName,
    options,
  };

  Communicator.call({
    methodName: 'distinct',
    args: { selectedCollection, selector, fieldName, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'distinct', params, (!historyParams));
    }
  });
};

Template.distinct.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.selector) {
      Meteor.setTimeout(() => {
        Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
      }, 100);
    }

    if (query.queryParams.fieldName) {
      Meteor.setTimeout(() => {
        $('#inputField').val(query.queryParams.fieldName);
      }, 100);
    }

    if (query.queryParams.options) {
      const optionsArray = [];
      for (const property in query.queryParams.options) {
        if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.DISTINCT_OPTIONS))[property]) {
          optionsArray.push((_.invert(Enums.DISTINCT_OPTIONS))[property]);
        }
      }

      Meteor.setTimeout(() => {
        $('#cmbDistinctOptions').val(optionsArray).trigger('chosen:updated');
        Session.set(Helper.strSessionSelectedOptions, optionsArray);
      }, 100);

      // options load
      Meteor.setTimeout(() => {
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray[i];
          const inverted = (_.invert(Enums.DISTINCT_OPTIONS));
          if (option === inverted.maxTimeMS) {
            $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
          }
        }
      }, 200);
    }
  }
};
