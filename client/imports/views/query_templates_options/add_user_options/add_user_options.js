import { Template } from 'meteor/templating';
import Helper from '/client/imports/helpers/helper';
import Enums from '/lib/imports/enums';


import './add_user_options.html';

const toastr = require('toastr');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.customData.onRendered(() => {
  Helper.initializeCodeMirror($('#divCustomData'), 'txtCustomData');
});

Template.roles.onRendered(() => {
  Helper.initializeCodeMirror($('#divRoles'), 'txtRoles');
});

export const getOptions = function () {
  const result = {};
  Helper.checkAndAddOption('CUSTOM_DATA', $('#divCustomData'), result, Enums.ADD_USER_OPTIONS);
  Helper.checkAndAddOption('ROLES', $('#divRoles'), result, Enums.ADD_USER_OPTIONS);

  if (result.roles == null || result.roles == '' || Object.keys(result.roles).length == 0) {
    toastr.info('Creating a user without roles is deprecated in MongoDB >= 2.6');
  }

  return result;
};
