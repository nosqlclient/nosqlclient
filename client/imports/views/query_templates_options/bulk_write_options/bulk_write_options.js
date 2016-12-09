/**
 * Created by sercan on 09.12.2016.
 */
import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';
import Enums from '/lib/imports/enums';
import {Session} from 'meteor/session';

import '/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation';

import './bulk_write_options.html';

Template.ordered.onRendered(function () {
    $('#divOrdered').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

export const getBulkWriteOptions = function () {
    var result = {};

    if ($.inArray("BYPASS_DOCUMENT_VALIDATION", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var byPassDocValidation = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
        if (byPassDocValidation) {
            result[Enums.BULK_WRITE_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = byPassDocValidation;
        }
    }

    if ($.inArray("ORDERED", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        // default true
        result[Enums.BULK_WRITE_OPTIONS.ORDERED] = $('#divOrdered').iCheck('update')[0].checked;
    }

    return result;
};