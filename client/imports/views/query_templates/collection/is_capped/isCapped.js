import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";
import Helper from "/client/imports/helper";
import {initExecuteQuery} from "/client/imports/views/pages/browse_collection/browse_collection";

import "./is_capped.html";

/**
 * Created by RSercan on 3.1.2016.
 */
Template.isCapped.onRendered(function () {
});

Template.isCapped.executeQuery = function (historyParams) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);

    Meteor.call("isCapped", selectedCollection, Meteor.default_connection._lastSessionId, function (err, result) {
        if (!result.result) {
            result.result = false;
        }
        Helper.renderAfterQueryExecution(err, result, false, "isCapped", {}, (!historyParams));
    });
};


Template.isCapped.renderQuery = function () {
};