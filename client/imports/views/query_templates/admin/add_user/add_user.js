import { Template } from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import { Communicator } from '/client/imports/facades';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';
import { getOptions } from '/client/imports/views/query_templates_options/add_user_options/add_user_options';

import '/client/imports/views/query_templates_options/username/username.html';
import './add_user.html';


const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 9.1.2016.
 */
Template.addUser.onRendered(() => {
  initializeOptions();
  Helper.changeRunOnAdminOptionVisibility(true);
});

const initializeOptions = function () {
  const cmb = $('#cmbAddUserOptions');
  $.each(Helper.sortObjectByKey(Enums.ADD_USER_OPTIONS), (key, value) => {
    cmb.append($('<option></option>')
      .attr('value', key)
      .text(value));
  });

  cmb.chosen();
  Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.addUser.executeQuery = function () {
  initExecuteQuery();
  const options = getOptions();
  const username = $('#inputAddUserUsername').val();
  const password = $('#inputAddUserPassword').val();

  if (username == null || username.length === 0) {
    toastr.error('Username can not be empty');
    Ladda.stopAll();
    return;
  }

  if (password == null || password.length === 0) {
    toastr.error('Password can not be empty');
    Ladda.stopAll();
    return;
  }

  if (options.ERROR) {
    toastr.error(options.ERROR);
    Ladda.stopAll();
    return;
  }

  const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

  Communicator.call({
    methodName: 'addUser',
    args: { username, password, runOnAdminDB, options },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
