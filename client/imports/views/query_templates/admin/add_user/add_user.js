import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/admin_queries/admin_queries';
import {getOptions} from '/client/imports/views/query_templates_options/add_user_options/add_user_options';

import '/client/imports/views/query_templates_common/username/username.html'
import './add_user.html';


var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 9.1.2016.
 */
Template.addUser.onRendered(function () {
    initializeOptions();
    Helper.changeConvertOptionsVisibility(false);
    Helper.changeRunOnAdminOptionVisibility(true);
});

const initializeOptions = function () {
    var cmb = $('#cmbAddUserOptions');
    $.each(Helper.sortObjectByKey(Enums.ADD_USER_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.addUser.executeQuery = function () {
    initExecuteQuery();
    var options = getOptions();
    var username = $('#inputAddUserUsername').val();
    var password = $('#inputAddUserPassword').val();

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

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

    Meteor.call("addUser", username, password, options, runOnAdminDB, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};