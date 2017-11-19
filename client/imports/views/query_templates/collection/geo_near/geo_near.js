import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Communicator } from '/client/imports/facades';
import { Session } from 'meteor/session';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/browse_collection/browse_collection';
import { getOptions } from '/client/imports/views/query_templates_options/geo_near_options/geo_near_options';

import './geo_near.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
/* global _ */
Template.geoNear.onRendered(() => {
  initializeOptions();
});

const initializeOptions = function () {
  const cmb = $('#cmbGeoNearOptions');
  $.each(Helper.sortObjectByKey(Enums.GEO_NEAR_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.geoNear.executeQuery = function (historyParams) {
  initExecuteQuery();
  const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
  let xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
  if (xAxis) {
    xAxis = parseInt(xAxis);
  }

  let yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
  if (yAxis) {
    yAxis = parseInt(yAxis);
  }

  const options = historyParams ? historyParams.options : getOptions();
  if (options.ERROR) {
    toastr.error(`Syntax error: ${options.ERROR}`);
    Ladda.stopAll();
    return;
  }

  const params = {
    xAxis,
    yAxis,
    options,
  };

  Communicator.call({
    methodName: 'geoNear',
    args: { selectedCollection, xAxis, yAxis, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, false, 'geoNear', params, (!historyParams));
    }
  });
};

Template.geoNear.renderQuery = function (query) {
  if (query.queryParams) {
    // let all stuff initialize
    if (query.queryParams.xAxis && query.queryParams.yAxis) {
      Meteor.setTimeout(() => {
        $('#inputXAxis').val(query.queryParams.xAxis);
        $('#inputYAxis').val(query.queryParams.yAxis);
      }, 100);
    }

    if (query.queryParams.options) {
      const optionsArray = [];
      for (const property in query.queryParams.options) {
        if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.GEO_NEAR_OPTIONS))[property]) {
          optionsArray.push((_.invert(Enums.GEO_NEAR_OPTIONS))[property]);
        }
      }

      Meteor.setTimeout(() => {
        $('#cmbGeoNearOptions').val(optionsArray).trigger('chosen:updated');
        Session.set(Helper.strSessionSelectedOptions, optionsArray);
      }, 100);

      // options load
      Meteor.setTimeout(() => {
        for (let i = 0; i < optionsArray.length; i++) {
          const option = optionsArray[i];
          const inverted = (_.invert(Enums.GEO_NEAR_OPTIONS));
          if (option === inverted.query) {
            Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.options.query, null, 1));
          }
          if (option === inverted.maxDistance) {
            $('#inputMaxDistance').val(query.queryParams.options.maxDistance);
          }
          if (option === inverted.minDistance) {
            $('#inputMinDistance').val(query.queryParams.options.minDistance);
          }
          if (option === inverted.num) {
            $('#inputMaxNumber').val(query.queryParams.options.num);
          }
          if (option === inverted.distanceMultiplier) {
            $('#inputDistanceMultiplier').val(query.queryParams.options.distanceMultiplier);
          }
          if (option === inverted.spherical) {
            $('#divSpherical').iCheck(query.queryParams.options.spherical ? 'check' : 'uncheck');
          }
          if (option === inverted.uniqueDocs) {
            $('#divUniqueDocs').iCheck(query.queryParams.options.uniqueDocs ? 'check' : 'uncheck');
          }
          if (option === inverted.includeLocs) {
            $('#inputIncludeLocs').iCheck(query.queryParams.options.includeLocs ? 'check' : 'uncheck');
          }
        }
      }, 200);
    }
  }
};
