import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/helper';
import {initExecuteQuery} from '/client/views/pages/admin_queries/admin_queries';

Template.buildInfo.onRendered(function()  {
    Helper.changeConvertOptionsVisibility(false);
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.buildInfo.executeQuery = function() {
    initExecuteQuery();

    Meteor.call("buildInfo", function(err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};