import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';
import {getOptions} from '/client/imports/views/query_templates_options/geo_near_options/geo_near_options';

import './geo_near.html';

var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by RSercan on 3.1.2016.
 */
Template.geoNear.onRendered(function () {
    initializeOptions();
    Helper.changeConvertOptionsVisibility(false);
});

const initializeOptions = function () {
    var cmb = $('#cmbGeoNearOptions');
    $.each(Helper.sortObjectByKey(Enums.GEO_NEAR_OPTIONS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Helper.setOptionsComboboxChangeEvent(cmb);
};

Template.geoNear.executeQuery = function (historyParams) {
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

    Meteor.call("geoNear", selectedCollection, xAxis, yAxis, options, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, false, "geoNear", params, (historyParams ? false : true));
    });
};