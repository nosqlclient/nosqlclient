import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

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