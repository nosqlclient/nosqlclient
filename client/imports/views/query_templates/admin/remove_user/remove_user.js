import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/admin_queries/admin_queries';

import '/client/imports/views/query_templates_common/username/username.html';
import './remove_user.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 10.1.2016.
 */
Template.removeUser.onRendered(function () {
    Helper.changeRunOnAdminOptionVisibility(true);
});

Template.removeUser.executeQuery = function () {
    initExecuteQuery();
    var username = $('#inputAddUserUsername').val();

    if (username == null || username.length === 0) {
        toastr.error('Username can not be empty');
        Ladda.stopAll();
        return;
    }

    var runOnAdminDB = $('#aRunOnAdminDB').iCheck('update')[0].checked;

    Meteor.call("removeUser", username, runOnAdminDB, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};