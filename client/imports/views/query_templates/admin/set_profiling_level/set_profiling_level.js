import { Template } from 'meteor/templating';
import { Communicator } from '/client/imports/facades';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';

import './set_profiling_level.html';

const initializeOptions = function () {
  const cmb = $('#cmbLevel');
  $.each(Helper.sortObjectByKey(Enums.PROFILING_LEVELS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', value)
      .text(key));
  });

  cmb.chosen();
};

Template.setProfilingLevel.onRendered(() => {
  initializeOptions();
  Helper.changeRunOnAdminOptionVisibility(false);
});

Template.setProfilingLevel.executeQuery = function () {
  initExecuteQuery();
  const level = $('#cmbLevel').val();

  Communicator.call({
    methodName: 'setProfilingLevel',
    args: { level },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
