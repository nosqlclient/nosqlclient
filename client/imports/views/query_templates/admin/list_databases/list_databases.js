import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/views/pages/admin_queries/admin_queries';

import './list_databases.html';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.listDatabases.onRendered(function () {
    Helper.changeConvertOptionsVisibility(false);
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.listDatabases.executeQuery = function () {
    initExecuteQuery();

    Meteor.call("listDatabases", function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};