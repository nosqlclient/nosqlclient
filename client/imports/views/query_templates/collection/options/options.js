import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './options.html';

/**
 * Created by RSercan on 5.1.2016.
 */
Template.options.onRendered(function () {
});

Template.options.executeQuery = function (historyParams) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

    Meteor.call("options", selectedCollection,Meteor.default_connection._lastSessionId, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "options", {}, (!historyParams));
    });
};

Template.options.renderQuery = function () {
};