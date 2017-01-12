/**
 * Created by sercan on 09.12.2016.
 */
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';
import {$} from 'meteor/jquery';

import '/client/imports/views/query_templates_options/limit/limit.html';
import '/client/imports/views/query_templates_options/skip/skip.html';
import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms';

import './count_options.html';

export const getCountOptions = function () {
    const result = {};

    if ($.inArray("MAX_TIME_MS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const maxTimeMsVal = $('#inputMaxTimeMs').val();
        if (maxTimeMsVal) {
            result[Enums.COUNT_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMsVal);
        }
    }

    if ($.inArray("SKIP", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const skipVal = $('#inputSkip').val();
        if (skipVal) {
            result[Enums.COUNT_OPTIONS.SKIP] = parseInt(skipVal);
        }
    }

    if ($.inArray("LIMIT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[Enums.COUNT_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }
    return result;
};