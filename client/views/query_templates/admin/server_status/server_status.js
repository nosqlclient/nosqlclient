import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/helper';
import {initExecuteQuery} from '/client/views/pages/admin_queries/admin_queries';

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