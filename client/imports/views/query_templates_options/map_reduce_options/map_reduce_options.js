import {Template} from "meteor/templating";
import Helper from "/client/imports/helper";
import Enums from "/lib/imports/enums";
import {Session} from "meteor/session";
import {$} from "meteor/jquery";
import "/client/imports/views/query_templates_options/sort/sort";
import "/client/imports/views/query_templates_options/limit/limit.html";
import "/client/imports/views/query_templates_options/selector/selector";
import "/client/imports/views/query_templates_options/bypass_document_validation/bypass_document_validation";
import "./map_reduce_options.html";
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

Template.jsMode.onRendered(function () {
    $('#divJsMode').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.keepTemp.onRendered(function () {
    $('#divKeepTemp').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.verbose.onRendered(function () {
    $('#divVerbose').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

export const getOptions = function () {
    const result = {};
    Helper.checkAndAddOption("OUT", $('#divOut'), result, Enums.MAP_REDUCE_OPTIONS);
    Helper.checkCodeMirrorSelectorForOption("QUERY", result, Enums.MAP_REDUCE_OPTIONS);
    Helper.checkAndAddOption("SORT", $('#divSort'), result, Enums.MAP_REDUCE_OPTIONS);
    Helper.checkAndAddOption("SCOPE", $('#divScope'), result, Enums.MAP_REDUCE_OPTIONS);

    if ($.inArray("FINALIZE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const finalize = Helper.getCodeMirrorValue($('#divFinalize'));
        if (finalize.parseFunction() == null) {
            result["ERROR"] = "Syntax Error on finalize, not a valid ";
            return;
        }
    }

    if ($.inArray("LIMIT", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        const limit = $('#inputLimit').val();
        if (limit) {
            result[Enums.MAP_REDUCE_OPTIONS.LIMIT] = parseInt(limit);
        }
    }


    if ($.inArray("VERBOSE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        result[Enums.MAP_REDUCE_OPTIONS.VERBOSE] = $('#divVerbose').iCheck('update')[0].checked;
    }

    if ($.inArray("KEEP_TEMP", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        result[Enums.MAP_REDUCE_OPTIONS.KEEP_TEMP] = $('#divKeepTemp').iCheck('update')[0].checked;
    }

    if ($.inArray("JS_MODE", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        result[Enums.MAP_REDUCE_OPTIONS.JS_MODE] = $('#divJsMode').iCheck('update')[0].checked;
    }

    if ($.inArray("BYPASS_DOCUMENT_VALIDATION", Session.get(Helper.strSessionSelectedOptions)) != -1) {
        result[Enums.MAP_REDUCE_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
    }

    return result;
};