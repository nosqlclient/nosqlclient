import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getOptions} from '/client/imports/views/query_templates_options/map_reduce_options/map_reduce_options';

import './map_reduce.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
/*global _*/

Template.mapReduce.onRendered(function () {
    Helper.initializeCodeMirror($('#divMap'), 'txtMap');
    Helper.initializeCodeMirror($('#divReduce'), 'txtReduce');
    initializeOptions();
});

const initializeOptions = function () {
    const cmb = $('#cmbMapReduceOptions');
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
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    const options = historyParams ? historyParams.options : getOptions();
    const map = historyParams ? JSON.stringify(historyParams.map) : Helper.getCodeMirrorValue($('#divMap'));
    const reduce = historyParams ? JSON.stringify(historyParams.reduce) : Helper.getCodeMirrorValue($('#divReduce'));


    if (map.parseFunction() == null) {
        toastr.error("Syntax error on map, not a valid function");
        Ladda.stopAll();
        return;
    }

    if (reduce.parseFunction() == null) {
        toastr.error("Syntax error on reduce, not a valid function");
        Ladda.stopAll();
        return;
    }

    if (options["ERROR"]) {
        toastr.error(options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    const params = {
        map: map,
        reduce: reduce,
        options: options
    };

    Meteor.call("mapReduce", selectedCollection, map, reduce, options, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "mapReduce", params, (!historyParams));
    });
};


Template.mapReduce.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.map) {
            Meteor.setTimeout(function () {
                let str = JSON.stringify(query.queryParams.map, null, 1).replace(/\\n/g, '\n');
                Helper.setCodeMirrorValue($('#divMap'), str.substring(1, str.length - 1));
            }, 100);
        }

        if (query.queryParams.reduce) {
            Meteor.setTimeout(function () {
                let str = JSON.stringify(query.queryParams.reduce, null, 1).replace(/\\n/g, '\n');
                Helper.setCodeMirrorValue($('#divReduce'), str.substring(1, str.length - 1));
            }, 100);
        }

        if (query.queryParams.options) {
            let optionsArray = [];
            for (let property in query.queryParams.options) {
                if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.MAP_REDUCE_OPTIONS))[property]) {
                    optionsArray.push((_.invert(Enums.MAP_REDUCE_OPTIONS))[property]);
                }
            }

            Meteor.setTimeout(function () {
                $('#cmbMapReduceOptions').val(optionsArray).trigger('chosen:updated');
                Session.set(Helper.strSessionSelectedOptions, optionsArray);

            }, 100);

            // options load
            Meteor.setTimeout(function () {
                for (let i = 0; i < optionsArray.length; i++) {
                    let option = optionsArray[i];
                    let inverted = (_.invert(Enums.MAP_REDUCE_OPTIONS));
                    if (option === inverted.out) {
                        Helper.setCodeMirrorValue($('#divOut'), JSON.stringify(query.queryParams.options.out, null, 1));
                    }
                    if (option === inverted.query) {
                        Helper.setCodeMirrorValue($('#divSelector'), JSON.stringify(query.queryParams.options.query, null, 1));
                    }
                    if (option === inverted.sort) {
                        Helper.setCodeMirrorValue($('#divSort'), JSON.stringify(query.queryParams.options.sort, null, 1));
                    }
                    if (option === inverted.scope) {
                        Helper.setCodeMirrorValue($('#divScope'), JSON.stringify(query.queryParams.options.scope, null, 1));
                    }
                    if (option === inverted.finalize) {
                        Helper.setCodeMirrorValue($('#divFinalize'), JSON.stringify(query.queryParams.options.finalize, null, 1));
                    }
                    if (option === inverted.limit) {
                        $('#inputLimit').val(query.queryParams.options.limit);
                    }
                    if (option === inverted.verbose) {
                        $('#divVerbose').iCheck(query.queryParams.options.verbose ? 'check' : 'uncheck');
                    }
                    if (option === inverted.keeptemp) {
                        $('#divKeepTemp').iCheck(query.queryParams.options.keeptemp ? 'check' : 'uncheck');
                    }
                    if (option === inverted.bypassDocumentValidation) {
                        $('#divBypassDocumentValidation').iCheck(query.queryParams.options.bypassDocumentValidation ? 'check' : 'uncheck');
                    }
                }
            }, 200);
        }

    }
};