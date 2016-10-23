import {Template} from 'meteor/templating';
import Helper from '/client/helper';
import Enums from '/lib/enums';

var toastr = require('toastr');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.customData.onRendered(function () {
    Helper.initializeCodeMirror($('#divCustomData'), 'txtCustomData');
});

Template.roles.onRendered(function () {
    Helper.initializeCodeMirror($('#divRoles'), 'txtRoles');
});

export const getOptions = function () {
    var result = {};
    Helper.checkAndAddOption("CUSTOM_DATA", $('#divCustomData'), result, Enums.ADD_USER_OPTIONS);
    Helper.checkAndAddOption("ROLES", $('#divRoles'), result, Enums.ADD_USER_OPTIONS);

    if (result.roles == null || result.roles == "" || Object.keys(result.roles).length == 0) {
        toastr.info('Creating a user without roles is deprecated in MongoDB >= 2.6');
    }

    return result;
};