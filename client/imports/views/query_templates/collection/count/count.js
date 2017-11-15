import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import Helper from '/client/imports/helper';
import { Session } from 'meteor/session';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getSelectorValue } from '/client/imports/views/query_templates_options/selector/selector';
import { getCountOptions } from '/client/imports/views/query_templates_options/count_options/count_options';
import './count.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.count.onRendered(() => {
  initializeOptions();
});


const initializeOptions = function () {
  const cmb = $('#cmbCountOptions');
  $.each(Helper.sortObjectByKey(Enums.COUNT_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.count.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();
  const options = historyParams ? historyParams.options : getCountOptions();

  selector = Helper.convertAndCheckJSON(selector);
  if (selector.ERROR) {
    toastr.error(`Syntax error on selector: ${  selector.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const params = {
    selector,
    options,
  };

  Meteor.call('count', selectedCollection, selector, options, Meteor.default_connection._lastSessionId, (err, result) => {
    Helper.renderAfterQueryExecution(err, result, false, 'count', params, (!historyParams));
  },
  );
};

Template.count.renderQuery = function (query) {
  if (query.queryParams && query.queryParams.selector) {
    // let codemirror initialize
    Meteor.setTimeout(() => {
      Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
    }, 100);
  }

  if (query.queryParams.options) {
    const optionsArray = [];
    for (const property in query.queryParams.options) {
      if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.COUNT_OPTIONS))[property]) {
        optionsArray.push((_.invert(Enums.COUNT_OPTIONS))[property]);
      }
    }

    Meteor.setTimeout(() => {
      $('#cmbCountOptions').val(optionsArray).trigger('chosen:updated');
      Session.set(Helper.strSessionSelectedOptions, optionsArray);
    }, 100);

    // options load
    Meteor.setTimeout(() => {
      for (let i = 0; i < optionsArray.length; i++) {
        let option = optionsArray[i];
        let inverted = (_.invert(Enums.COUNT_OPTIONS));
        if (option === inverted.maxTimeMS) {
          $('#inputMaxTimeMs').val(query.queryParams.options.maxTimeMS);
        }
        if (option === inverted.limit) {
          $('#inputLimit').val(query.queryParams.options.limit);
        }
        if (option === inverted.skip) {
          $('#inputSkip').val(query.queryParams.options.skip);
        }
      }
    }, 200);
  }
};
