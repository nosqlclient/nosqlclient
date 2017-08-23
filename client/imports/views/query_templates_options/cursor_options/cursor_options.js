import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {Session} from "meteor/session";
import {$} from "meteor/jquery";
import "/client/imports/views/query_templates_options/max/max";
import "/client/imports/views/query_templates_options/project/project";
import "/client/imports/views/query_templates_options/min/min";
import "/client/imports/views/query_templates_options/sort/sort";
import "/client/imports/views/query_templates_options/limit/limit.html";
import "/client/imports/views/query_templates_options/skip/skip.html";
import "./cursor_options.html";

/**
 * Created by sercan on 31.12.2015.
 */

export const getCursorOptions = function () {
    let result = {};

    Helper.checkAndAddOption("PROJECT", $('#divProject'), result, Enums.CURSOR_OPTIONS);
    Helper.checkAndAddOption("MAX", $('#divMax'), result, Enums.CURSOR_OPTIONS);
    Helper.checkAndAddOption("MIN", $('#divMin'), result, Enums.CURSOR_OPTIONS);
    Helper.checkAndAddOption("SORT", $('#divSort'), result, Enums.CURSOR_OPTIONS);

    if ($.inArray("MAX_TIME_MS", Session.get(Helper.strSessionSelectedOptions)) !== -1) {
        const maxTimeMs = $('#inputMaxTimeMs').val();
        if (maxTimeMs) {
            result[Enums.CURSOR_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMs);
        }
    }

    if ($.inArray("SKIP", Session.get(Helper.strSessionSelectedOptions)) !== -1) {
        const skipVal = $('#inputSkip').val();
        if (skipVal) {
            result[Enums.CURSOR_OPTIONS.SKIP] = parseInt(skipVal);
        }
    }

    if ($.inArray("LIMIT", Session.get(Helper.strSessionSelectedOptions)) !== -1) {
        const limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[Enums.CURSOR_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }

    return result;
};