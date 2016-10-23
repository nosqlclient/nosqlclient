import {Template} from 'meteor/templating';
import Helper from '/client/helper';
import Enums from '/lib/enums';
import {Session} from 'meteor/session';

/**
 * Created by RSercan on 3.1.2016.
 */
Template.out.onRendered(function () {
    Helper.initializeCodeMirror($('#divOut'), 'txtOut');
});

Template.scope.onRendered(function () {
    Helper.initializeCodeMirror($('#divScope'), 'txtScope');
});

Template.finalize.onRendered(function () {
    Helper.initializeCodeMirror($('#divFinalize'), 'txtFinalize');
});

Template.verbose.onRendered(function () {
    $('#divVerbose').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.bypassDocumentValidation.onRendered(function () {
    $('#divBypassDocumentValidation').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});


export const getOptions = function () {
    var result = {};
    Helper.checkAndAddOption("OUT", $('#divOut'), result, Enums.MAP_REDUCE_OPTIONS);
    Helper.checkCodeMirrorSelectorForOption("QUERY", result, Enums.MAP_REDUCE_OPTIONS);
    Helper.checkAndAddOption("SORT", $('#divSort'), result, Enums.MAP_REDUCE_OPTIONS);
    Helper.checkAndAddOption("SCOPE", $('#divScope'), result, Enums.MAP_REDUCE_OPTIONS);

    if ($.inArray("FINALIZE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var finalize = Helper.getCodeMirrorValue($('#divFinalize'));
        if (finalize.parse() == null) {
            result["ERROR"] = "Syntax Error on finalize, not a valid ";
            return;
        }
    }

    if ($.inArray("LIMIT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var limit = $('#inputLimit').val();
        if (limit) {
            result[Enums.MAP_REDUCE_OPTIONS.LIMIT] = parseInt(limit);
        }
    }


    if ($.inArray("VERBOSE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var verBose = $('#divVerbose').iCheck('update')[0].checked;
        if (verBose) {
            result[Enums.MAP_REDUCE_OPTIONS.VERBOSE] = verBose;
        }
    }

    if ($.inArray("BYPASS_DOCUMENT_VALIDATION", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        var byPassDocValidation = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
        if (byPassDocValidation) {
            result[Enums.MAP_REDUCE_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = byPassDocValidation;
        }
    }

    return result;
};