var toastr = require('toastr');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.customData.onRendered(function () {
    Template.initializeAceEditor('aceCustomData', Template.addUser.executeQuery);
});

Template.roles.onRendered(function () {
    Template.initializeAceEditor('aceRoles', Template.addUser.executeQuery);
});

Template.addUserOptions.getOptions = function () {
    var result = {};
    Template.checkAceEditorOption("CUSTOM_DATA", "aceCustomData", result, ADD_USER_OPTIONS);
    Template.checkAceEditorOption("ROLES", "aceRoles", result, ADD_USER_OPTIONS);

    if (result.roles == null || result.roles == "" || Object.keys(result.roles).length == 0) {
        toastr.info('Creating a user without roles is deprecated in MongoDB >= 2.6');
    }

    return result;
};