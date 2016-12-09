import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {getOptions} from '/client/imports/views/query_templates_options/insert_many_options/insert_many_options';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './insert_many.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.insertMany.onRendered(function () {
    Helper.initializeCodeMirror($('#divDocs'), 'txtDocs');
    initializeOptions();
});

const initializeOptions = function () {
    var cmb = $('#cmbInsertManyOptions');
    $.each(Helper.sortObjectByKey(Enums.INSERT_MANY_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};


Template.insertMany.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var docs = historyParams ? JSON.stringify(historyParams.docs) : Helper.getCodeMirrorValue($('#divDocs'));
    var options = historyParams ? historyParams.options : getOptions();

    docs = Helper.convertAndCheckJSON(docs);
    if (docs["ERROR"]) {
        toastr.error("Syntax error on docs: " + docs["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        docs: docs,
        options: options
    };

    Meteor.call("insertMany", selectedCollection, docs, options, function (err, result) {
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