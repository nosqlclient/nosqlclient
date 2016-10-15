var toastr = require('toastr');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.customData.onRendered(function () {
    Template.initializeCodeMirror($('#divCustomData'), 'txtCustomData');
});

Template.roles.onRendered(function () {
    Template.initializeCodeMirror($('#divRoles'), 'txtRoles');
});

Template.addUserOptions.getOptions = function () {
    var result = {};
    Template.checkAndAddOption("CUSTOM_DATA", $('#divCustomData'), result, ADD_USER_OPTIONS);
    Template.checkAndAddOption("ROLES", $('#divRoles'), result, ADD_USER_OPTIONS);

    if (result.roles == null || result.roles == "" || Object.keys(result.roles).length == 0) {
        toastr.info('Creating a user without roles is deprecated in MongoDB >= 2.6');
    }

    return result;
};