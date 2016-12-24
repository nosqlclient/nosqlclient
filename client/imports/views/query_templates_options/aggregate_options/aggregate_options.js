/**
 * Created by sercan on 09.12.2016.
 */
import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

import '/client/imports/views/query_templates_options/collation/collation';
import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms';
import '/client/imports/views/query_templates_options/explain/explain';

import './aggregate_options.html';

Template.allowDiskUse.onRendered(function () {
    $('#divAllowDiskUse').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

export const getAggregateOptions = function () {
    const result = {};
    Helper.checkAndAddOption("COLLATION", $('#divCollation'), result, Enums.AGGREGATE_OPTIONS);

    if ($.inArray("BYPASS_DOCUMENT_VALIDATION", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const byPassDocValidation = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
        if (byPassDocValidation) {
            result[Enums.AGGREGATE_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = byPassDocValidation;
        }
    }

    if ($.inArray("MAX_TIME_MS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const maxTimeMsVal = $('#inputMaxTimeMs').val();
        if (maxTimeMsVal) {
            result[Enums.AGGREGATE_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMsVal);
        }
    }

    if ($.inArray("ALLOW_DISK_USE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const allowDiskUse = $('#divAllowDiskUse').iCheck('update')[0].checked;
        if (allowDiskUse) {
            result[Enums.AGGREGATE_OPTIONS.ALLOW_DISK_USE] = allowDiskUse;
        }
    }

    if ($.inArray("EXPLAIN", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const explain = $('#divExecuteExplain').iCheck('update')[0].checked;
        if (explain) {
            result[Enums.AGGREGATE_OPTIONS.EXPLAIN] = explain;
        }
    }

    return result;
};