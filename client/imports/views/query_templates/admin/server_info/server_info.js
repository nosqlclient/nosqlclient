import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/admin_queries/admin_queries';

import './server_info.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.serverInfo.onRendered(function () {
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.serverInfo.executeQuery = function () {
    initExecuteQuery();

    Meteor.call("serverInfo",Meteor.default_connection._lastSessionId, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};