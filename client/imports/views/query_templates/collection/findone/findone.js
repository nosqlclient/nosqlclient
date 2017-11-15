import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getSelectorValue } from '/client/imports/views/query_templates_options/selector/selector';
import { getCursorOptions } from '/client/imports/views/query_templates_options/cursor_options/cursor_options';
import './findone.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 1.1.2016.
 */
/* global _ */
Template.findOne.onRendered(() => {
  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbFindOneCursorOptions');
  $.each(Helper.sortObjectByKey(Enums.CURSOR_OPTIONS), (key, value) => {
    // dont add limit, it will be 1 already
    if (value != Enums.CURSOR_OPTIONS.LIMIT) {
      cmb.append($('<option></option>')
        .attr('value', key)
        .text(value));
    }
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.findOne.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  const cursorOptions = historyParams ? historyParams.cursorOptions : getCursorOptions();
  let selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

  selector = Helper.convertAndCheckJSON(selector);
  if (selector.ERROR) {
    toastr.error(`Syntax error on selector: ${  selector.ERROR}`);
    Ladda.stopAll();
    return;
  }

  if (cursorOptions.ERROR) {
    toastr.error(cursorOptions.ERROR);
    Ladda.stopAll();
    return;
  }

  const params = {
    selector,
    cursorOptions,
  };

  Meteor.call('findOne', selectedCollection, selector, cursorOptions, Meteor.default_connection._lastSessionId, (err, result) => {
    Helper.renderAfterQueryExecution(err, result, false, 'findOne', params, (!historyParams));
  },
  );
};

Template.findOne.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.selector) {
      Meteor.setTimeout(() => {
        Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
      }, 100);
    }

    if (query.queryParams.cursorOptions) {
      const optionsArray = [];
      for (const property in query.queryParams.cursorOptions) {
        if (query.queryParams.cursorOptions.hasOwnProperty(property) && (_.invert(Enums.CURSOR_OPTIONS))[property]) {
          optionsArray.push((_.invert(Enums.CURSOR_OPTIONS))[property]);
        }
      }

      Meteor.setTimeout(() => {
        $('#cmbFindOneCursorOptions').val(optionsArray).trigger('chosen:updated');
        Session.set(Helper.strSessionSelectedOptions, optionsArray);
      }, 100);

      // options load
      Meteor.setTimeout(() => {
        for (let i = 0; i < optionsArray.length; i++) {
          let option = optionsArray[i];
          let inverted = (_.invert(Enums.CURSOR_OPTIONS));
          if (option === inverted.project) {
            Helper.setCodeMirrorValue($('#divProject'), JSON.stringify(query.queryParams.cursorOptions.project, null, 1));
          }
          if (option === inverted.skip) {
            $('#inputSkip').val(query.queryParams.cursorOptions.skip);
          }
          if (option === inverted.sort) {
            Helper.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.cursorOptions.sort, null, 1));
          }
          if (option === inverted.maxTimeMS) {
            $('#inputMaxTimeMs').val(query.queryParams.cursorOptions.maxTimeMS);
          }
          if (option === inverted.max) {
            Helper.setCodeMirrorValue($('#divMax'), JSON.stringify(query.queryParams.cursorOptions.max, null, 1));
          }
          if (option === inverted.min) {
            Helper.setCodeMirrorValue($('#divMin'), JSON.stringify(query.queryParams.cursorOptions.min, null, 1));
          }
        }
      }, 200);
    }
  }
};
