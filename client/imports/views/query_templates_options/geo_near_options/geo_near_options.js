import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import '/client/imports/views/query_templates_options/max_distance/max_distance.html';
import '/client/imports/views/query_templates_options/selector/selector';
import './geo_near_options.html';

/**
 * Created by RSercan on 3.1.2016.
 */
Template.spherical.onRendered(() => {
  $('#divSpherical').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.uniqueDocs.onRendered(() => {
  $('#divUniqueDocs').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

Template.includeLocs.onRendered(() => {
  $('#divIncludeLocs').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});

export const getOptions = function () {
  const result = {};
  Helper.checkCodeMirrorSelectorForOption('QUERY', result, Enums.GEO_NEAR_OPTIONS);

  if ($.inArray('MAX_DISTANCE', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    const maxDistanceValue = $('#inputMaxDistance').val();
    if (maxDistanceValue) {
      result[Enums.GEO_NEAR_OPTIONS.MAX_DISTANCE] = parseInt(maxDistanceValue);
    }
  }

  if ($.inArray('MIN_DISTANCE', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    const minDistanceValue = $('#inputMinDistance').val();
    if (minDistanceValue) {
      result[Enums.GEO_NEAR_OPTIONS.MIN_DISTANCE] = parseInt(minDistanceValue);
    }
  }

  if ($.inArray('MAX_NUMBER', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    const num = $('#inputMaxNumber').val();
    if (num) {
      result[Enums.GEO_NEAR_OPTIONS.MAX_NUMBER] = parseInt(num);
    }
  }

  if ($.inArray('DISTANCE_MULTIPLIER', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    const distMultiplier = $('#inputDistanceMultiplier').val();
    if (distMultiplier) {
      result[Enums.GEO_NEAR_OPTIONS.DISTANCE_MULTIPLIER] = parseInt(distMultiplier);
    }
  }

  if ($.inArray('SPHERICAL', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.GEO_NEAR_OPTIONS.SPHERICAL] = $('#divSpherical').iCheck('update')[0].checked;
  }

  if ($.inArray('UNIQUE_DOCS', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.GEO_NEAR_OPTIONS.UNIQUE_DOCS] = $('#divUniqueDocs').iCheck('update')[0].checked;
  }

  if ($.inArray('INCLUDE_LOCS', Session.get(Helper.strSessionSelectedOptions)) != -1) {
    result[Enums.GEO_NEAR_OPTIONS.INCLUDE_LOCS] = $('#divIncludeLocs').iCheck('update')[0].checked;
  }

  return result;
};
