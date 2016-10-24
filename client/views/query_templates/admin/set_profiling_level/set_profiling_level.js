import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import Helper from '/client/helper';
import Enums from '/lib/enums';
import {initExecuteQuery} from '/client/views/pages/admin_queries/admin_queries';

/**
 * Created by RSercan on 10.1.2016.
 */
Template.setProfilingLevel.onRendered(function () {
    initializeOptions();
    Helper.changeConvertOptionsVisibility(false);
    Helper.changeRunOnAdminOptionVisibility(false);
});

Template.setProfilingLevel.executeQuery = function () {
    initExecuteQuery();
    var level = $('#cmbLevel').val();

    Meteor.call("setProfilingLevel", level, function (err, result) {
        Helper.renderAfterQueryExecution(err, result, true);
    });
};

const initializeOptions = function () {
    var cmb = $('#cmbLevel');
    $.each(Helper.sortObjectByKey(Enums.PROFILING_LEVELS), function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", value)
            .text(key));
    });

    cmb.chosen();
};
