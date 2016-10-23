import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/helper';
import {initExecuteQuery} from '/client/views/pages/admin_queries/admin_queries';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.profilingInfo.onRendered(function () {
    Helper.changeConvertOptionsVisibility(false);
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.profilingInfo.executeQuery = function () {
    initExecuteQuery();
    Meteor.call("profilingInfo", function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};