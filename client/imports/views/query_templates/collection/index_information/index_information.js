import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './index_information.html';

/**
 * Created by RSercan on 3.1.2016.
 */
Template.indexInformation.onRendered(function () {
    $('#divFullInformation').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
    Helper.changeConvertOptionsVisibility(false);
});

Template.indexInformation.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var fullVal = historyParams ? historyParams.full : $('#divFullInformation').iCheck('update')[0].checked;

    var params = {
        full: fullVal
    };

    Meteor.call("indexInformation", selectedCollection, fullVal, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "indexInformation", params, (historyParams ? false : true));
    });
};