import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './insert_many.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(function () {
    Helper.initializeCodeMirror($('#divDocs'), 'txtDocs');
});

Template.insertMany.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var docs = historyParams ? JSON.stringify(historyParams.docs) : Helper.getCodeMirrorValue($('#divDocs'));

    docs = Helper.convertAndCheckJSON(docs);
    if (docs["ERROR"]) {
        toastr.error("Syntax error on docs: " + docs["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        docs: docs
    };

    Meteor.call("insertMany", selectedCollection, docs, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "insertMany", params, (historyParams ? false : true));
    });
};

Template.insertMany.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.docs) {
            Meteor.setTimeout(function () {
                Helper.setCodeMirrorValue($('#divDocs'), JSON.stringify(query.queryParams.docs, null, 1));
            }, 100);
        }
    }
};