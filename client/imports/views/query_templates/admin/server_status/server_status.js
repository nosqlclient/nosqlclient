import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/admin_queries/admin_queries';

import './server_status.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverStatus.onRendered(function () {
    Helper.changeConvertOptionsVisibility(false);
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.serverStatus.executeQuery = function () {
    initExecuteQuery();

    Meteor.call("serverStatus", function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};