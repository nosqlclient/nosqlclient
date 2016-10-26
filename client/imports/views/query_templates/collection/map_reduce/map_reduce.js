import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';
import {getOptions} from '/client/views/query_templates_options/map_reduce_options/map_reduce_options';

import './map_reduce.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.mapReduce.onRendered(function () {
    Helper.initializeCodeMirror($('#divMap'), 'txtMap');
    Helper.initializeCodeMirror($('#divReduce'), 'txtReduce');
    initializeOptions();
    Helper.changeConvertOptionsVisibility(false);
});

const initializeOptions = function () {
    var cmb = $('#cmbMapReduceOptions');
    $.each(Helper.sortObjectByKey(Enums.MAP_REDUCE_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.mapReduce.executeQuery = function (historyParams) {
    initExecuteQuery();
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var options = historyParams ? historyParams.options : getOptions();
    var map = historyParams ? JSON.stringify(historyParams.map) : Helper.getCodeMirrorValue($('#divMap'));
    var reduce = historyParams ? JSON.stringify(historyParams.reduce) : Helper.getCodeMirrorValue($('#divReduce'));


    if (map.parseFunction() == null) {
        toastr.error("Syntax error on map, not a valid  ");
        Ladda.stopAll();
        return;
    }

    if (reduce.parseFunction() == null) {
        toastr.error("Syntax error on reduce, not a valid  ");
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        map: map,
        reduce: reduce,
        options: options
    };

    Meteor.call("mapReduce", selectedCollection, map, reduce, options, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "mapReduce", params, (historyParams ? false : true));
    });
};