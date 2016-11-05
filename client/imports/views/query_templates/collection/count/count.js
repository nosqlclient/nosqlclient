import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/imports/helper';
import {Session} from 'meteor/session';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getSelectorValue} from '/client/imports/views/query_templates_common/selector/selector';

import './count.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.count.onRendered(function () {
});

Template.count.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var selector = historyParams ? JSON.stringify(historyParams.selector) : getSelectorValue();

    selector = Helper.convertAndCheckJSON(selector);
    if (selector["ERROR"]) {
        toastr.error("Syntax error on selector: " + selector["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        selector: selector
    };

    Meteor.call("count", selectedCollection, selector, function (err, result) {
            Helper.renderAfterQueryExecution(err, result, false, "count", params, (historyParams ? false : true));
        }
    );
};

Template.count.renderQuery = function (query) {
    if (query.queryParams && query.queryParams.selector) {
        // let codemirror initialize
        Meteor.setTimeout(function () {
            Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.selector, null, 1));
        }, 100);
    }
};
