import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';
import { initExecuteQuery } from '/client/imports/views/pages/admin_queries/admin_queries';
import { Communicator } from '/client/imports/facades';
import '/client/imports/views/query_templates_options/username/username.html';
import './remove_user.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.removeUser.onRendered(() => {
  Helper.changeRunOnAdminOptionVisibility(true);
});

Template.removeUser.executeQuery = function () {
  initExecuteQuery();
  const username = $('#inputAddUserUsername').val();

  if (!username || username.length === 0) {
    toastr.error('Username can not be empty');
    Ladda.stopAll();
    return;
  }

  const runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

  Communicator.call({
    methodName: 'removeUser',
    args: { username, runOnAdminDB },
    callback: (err, result) => {
      Helper.renderAfterQueryExecution(err, result, true);
    }
  });
};
