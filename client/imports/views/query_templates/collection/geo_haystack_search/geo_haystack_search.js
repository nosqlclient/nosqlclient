import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getOptions} from '/client/imports/views/query_templates_options/geo_haystack_search_options/geo_haystack_search_options';

import './geo_haystack_search.html';

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.geoHaystackSearch.onRendered(function () {
    initializeOptions();
});

const initializeOptions = function () {
    const cmb = $('#cmbGeoHaystackSearchOptions');
    $.each(Helper.sortObjectByKey(Enums.GEO_HAYSTACK_SEARCH_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.geoHaystackSearch.executeQuery = function (historyParams) {
    initExecuteQuery();
    const selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    let xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
    if (xAxis) {
        xAxis = parseInt(xAxis);
    }

    let yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
    if (yAxis) {
        yAxis = parseInt(yAxis);
    }

    const options = historyParams ? historyParams.options : getOptions();

    if (options["ERROR"]) {
        toastr.error("Syntax error: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    const params = {
        xAxis: xAxis,
        yAxis: yAxis,
        options: options
    };

    Meteor.call("geoHaystackSearch", selectedCollection, xAxis, yAxis, options, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "geoHaystackSearch", params, (!historyParams));
    });
};


Template.geoHaystackSearch.renderQuery = function (query) {
    if (query.queryParams) {
        // let all stuff initialize
        if (query.queryParams.xAxis && query.queryParams.yAxis) {
            Meteor.setTimeout(function () {
                $('#inputXAxis').val(query.queryParams.xAxis);
                $('#inputYAxis').val(query.queryParams.yAxis);
            }, 100);
        }

        if (query.queryParams.options) {
            let optionsArray = [];
            for (let property in query.queryParams.options) {
                if (query.queryParams.options.hasOwnProperty(property) && (_.invert(Enums.GEO_HAYSTACK_SEARCH_OPTIONS))[property]) {
                    optionsArray.push((_.invert(Enums.GEO_HAYSTACK_SEARCH_OPTIONS))[property]);
                }
            }

            Meteor.setTimeout(function () {
                $('#cmbGeoHaystackSearchOptions').val(optionsArray).trigger('chosen:updated');
                Session.set(Helper.strSessionSelectedOptions, optionsArray);

            }, 100);

            // options load
            Meteor.setTimeout(function () {
                for (let i = 0; i < optionsArray.length; i++) {
                    let option = optionsArray[i];
                    let inverted = (_.invert(Enums.GEO_HAYSTACK_SEARCH_OPTIONS));
                    if (option === inverted.search) {
                        Helper.setCodeMirrorValue($('#divSearch'), JSON.stringify(query.queryParams.options.search, null, 1));
                    }
                    if (option === inverted.maxDistance) {
                        $('#inputMaxDistance').val(query.queryParams.options.maxDistance);
                    }
                    if (option === inverted.limit) {
                        $('#inputLimit').val(query.queryParams.options.limit);
                    }

                }
            }, 200);
        }

    }
};
