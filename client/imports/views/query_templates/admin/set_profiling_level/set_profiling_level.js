import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {initExecuteQuery} from "/client/imports/views/pages/admin_queries/admin_queries";

import "./set_profiling_level.html";

/**
 * Created by RSercan on 10.1.2016.
 */
Template.setProfilingLevel.onRendered(function () {
    initializeOptions();
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.setProfilingLevel.executeQuery = function () {
    initExecuteQuery();
    const level = $('#cmbLevel').val();

    Meteor.call("setProfilingLevel", level, Meteor.default_connection._lastSessionId, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};

const initializeOptions = function () {
    const cmb = $('#cmbLevel');
    $.each(Helper.sortObjectByKey(Enums.PROFILING_LEVELS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", value)
            .text(key));
    });

    cmb.chosen();
};
