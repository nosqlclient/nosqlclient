import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

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

    if ($.inArray("UPSERT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[Enums.FINDONE_MODIFY_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};