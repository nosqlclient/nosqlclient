import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { $ } from 'meteor/jquery';

import './stats.html';

/**
 * Created by sercan on 06.01.2016.
 */
/* global _ */
const getOptions = function () {
  const result = {};

  if ($.inArray('SCALE', Session.get(Helper.strSessionSelectedOptions)) !== -1) {
    const scale = $('#inputScale').val();
    if (scale) {
      result[Enums.STATS_OPTIONS.SCALE] = parseInt(scale);
    }
  }

  return result;
};

const initializeOptions = function () {
  const cmb = $('#cmbStatsOptions');
  $.each(Helper.sortObjectByKey(Enums.STATS_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.stats.onRendered(() => {
  initializeOptions();
});

Template.scale.onRendered(() => {
  $('#divScale').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.stats.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  const options = historyParams ? historyParams.options : getOptions();

  const params = {
    options,
  };

  Communicator.call({
    methodName: 'stats',
    args: { selectedCollection, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'stats', params, (!historyParams));
    }
  });
};

Template.stats.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.options) {
      const optionsArray = [];
      for (const property in query.queryParams.options) {
        if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.STATS_OPTIONS))[property]) {
          optionsArray.push((_.invert(Enums.STATS_OPTIONS))[property]);
        }
      }

      Meteor.setTimeout(() => {
        $('#cmbStatsOptions').val(optionsArray).trigger('chosen:updated');
        Session.set(Helper.strSessionSelectedOptions, optionsArray);
      }, 100);

      // options load
      Meteor.setTimeout(() => {
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray[i];
          const inverted = (_.invert(Enums.STATS_OPTIONS));
          if (option === inverted.scale) {
            $('#inputScale').val(query.queryParams.options.scale);
          }
        }
      }, 200);
    }
  }
};
