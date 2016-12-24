/**
 * Created by sercan on 09.12.2016.
 */
import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';

import './insert_many_options.html';

Template.serializeFunctions.onRendered(function () {
    $('#divSerializeFunctions').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

export const getOptions = function () {
    const result = {};

    if ($.inArray("BYPASS_DOCUMENT_VALIDATION", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const byPassDocValidation = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
        if (byPassDocValidation) {
            result[Enums.INSERT_MANY_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = byPassDocValidation;
        }
    }

    if ($.inArray("SERIALIZE_FUNCTIONS", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const serializeFunctions = $('#divSerializeFunctions').iCheck('update')[0].checked;
        if (serializeFunctions) {
            result[Enums.INSERT_MANY_OPTIONS.SERIALIZE_FUNCTIONS] = serializeFunctions;
        }
    }

    return result;
};