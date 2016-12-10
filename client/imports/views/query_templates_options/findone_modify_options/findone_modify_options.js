import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

import '/client/imports/views/query_templates_options/max_time_ms/max_time_ms.html';
import '/client/imports/views/query_templates_options/project/project';
import '/client/imports/views/query_templates_options/sort/sort';
import '/client/imports/views/query_templates_options/return_original/return_original';
import '/client/imports/views/query_templates_options/upsert/upsert';


import './findone_modify_options.html';

/**
 * Created by RSercan on 1.1.2016.
 */
export const getOptions = function () {
    var result = {};
    Helper.checkAndAddOption("PROJECTION", $('#divProject'), result, Enums.FINDONE_MODIFY_OPTIONS);
    Helper.checkAndAddOption("SORT", $('#divSort'), result, Enums.FINDONE_MODIFY_OPTIONS);

    if ($.inArray("RETURN_ORIGINAL", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var returnOrgVal = $('#divReturnOriginal').iCheck('update')[0].checked;
        if (returnOrgVal) {
            result[Enums.FINDONE_MODIFY_OPTIONS.RETURN_ORIGINAL] = returnOrgVal;
        }
    }

    if ($.inArray("MAX_TIME_MS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        let maxTimeMsVal = $('#inputMaxTimeMs').val();
        if (maxTimeMsVal) {
            result[Enums.FINDONE_MODIFY_OPTIONS.MAX_TIME_MS] = parseInt(maxTimeMsVal);
        }
    }

    if ($.inArray("UPSERT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[Enums.FINDONE_MODIFY_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};