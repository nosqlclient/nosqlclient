import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';

import './re_index.html';

/**
 * Created by RSercan on 5.1.2016.
 */
Template.reIndex.onRendered(function () {
    Helper.changeConvertOptionsVisibility(false);
});

Template.reIndex.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);

    Meteor.call("reIndex", selectedCollection, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "reIndex", {}, (historyParams ? false : true));
    });
};