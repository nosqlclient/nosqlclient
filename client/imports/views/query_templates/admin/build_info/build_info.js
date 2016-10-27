import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/admin_queries/admin_queries';

import './build_info.html';

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