import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

import '/client/imports/views/query_templates_options/max/max';
import '/client/imports/views/query_templates_options/project/project';
import '/client/imports/views/query_templates_options/min/min';
import '/client/imports/views/query_templates_options/sort/sort';
import '/client/imports/views/query_templates_options/limit/limit.html';
import '/client/imports/views/query_templates_options/skip/skip.html';

import './cursor_options.html';

/**
 * Created by sercan on 31.12.2015.
 */

export const getCursorOptions = function () {
    var result = {};
    Helper.checkAndAddOption("PROJECT", $('#divProject'), result, Enums.CURSOR_OPTIONS);
    Helper.checkAndAddOption("MAX", $('#divMax'), result, Enums.CURSOR_OPTIONS);
    Helper.checkAndAddOption("MIN", $('#divMin'), result, Enums.CURSOR_OPTIONS);
    Helper.checkAndAddOption("SORT", $('#divSort'), result, Enums.CURSOR_OPTIONS);

    if ($.inArray("SKIP", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var skipVal = $('#inputSkip').val();
        if (skipVal) {
            result[Enums.CURSOR_OPTIONS.SKIP] = parseInt(skipVal);
        }
    }

    if ($.inArray("LIMIT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[Enums.CURSOR_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }

    return result;
};