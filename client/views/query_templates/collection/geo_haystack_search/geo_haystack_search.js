import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/helper';
import Enums from '/lib/enums';
import {initExecuteQuery} from '/client/views/pages/browse_collection/browse_collection';
import {getOptions} from '/client/views/query_templates_options/geo_haystack_search_options/geo_haystack_search_options';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 2.1.2016.
 */
Template.geoHaystackSearch.onRendered(function () {
    initializeOptions();
    Helper.changeConvertOptionsVisibility(false);
});

const initializeOptions = function () {
    var cmb = $('#cmbGeoHaystackSearchOptions');
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
    var selectedCollection = Session.get(Helper.strSessionSelectedCollection);
    var xAxis = historyParams ? historyParams.xAxis : $('#inputXAxis').val();
    if (xAxis) {
        xAxis = parseInt(xAxis);
    }

    var yAxis = historyParams ? historyParams.yAxis : $('#inputYAxis').val();
    if (yAxis) {
        yAxis = parseInt(yAxis);
    }

    var options = historyParams ? historyParams.options : getOptions();

    if (options["ERROR"]) {
        toastr.error("Syntax error: " + options["ERROR"]);
        Ladda.stopAll();
        return;
    }

    var params = {
        xAxis: xAxis,
        yAxis: yAxis,
        options: options
    };

    Meteor.call("geoHaystackSearch", selectedCollection, xAxis, yAxis, options, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "geoHaystackSearch", params, (historyParams ? false : true));
    });
};