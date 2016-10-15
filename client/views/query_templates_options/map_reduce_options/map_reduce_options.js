/**
 * Created by RSercan on 3.1.2016.
 */
Template.out.onRendered(function () {
    Template.initializeCodeMirror($('#divOut'), 'txtOut');
});

Template.scope.onRendered(function () {
    Template.initializeCodeMirror($('#divScope'), 'txtScope');
});

Template.finalize.onRendered(function () {
    Template.initializeCodeMirror($('#divFinalize'), 'txtFinalize');
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


Template.mapReduceOptions.getOptions = function () {
    var result = {};
    Template.checkAndAddOption("OUT", $('#divOut'), result, MAP_REDUCE_OPTIONS);
    Template.checkCodeMirrorSelectorForOption("QUERY", result, MAP_REDUCE_OPTIONS);
    Template.checkAndAddOption("SORT", $('#divSort'), result, MAP_REDUCE_OPTIONS);
    Template.checkAndAddOption("SCOPE", $('#divScope'), result, MAP_REDUCE_OPTIONS);

    if ($.inArray("FINALIZE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var finalize = Template.getCodeMirrorValue($('#divFinalize'));
        if (finalize.parseFunction() == null) {
            result["ERROR"] = "Syntax Error on finalize, not a valid function";
            return;
        }
    }

    if ($.inArray("LIMIT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var limit = $('#inputLimit').val();
        if (limit) {
            result[MAP_REDUCE_OPTIONS.LIMIT] = parseInt(limit);
        }
    }


    if ($.inArray("VERBOSE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var verBose = $('#divVerbose').iCheck('update')[0].checked;
        if (verBose) {
            result[MAP_REDUCE_OPTIONS.VERBOSE] = verBose;
        }
    }

    if ($.inArray("BYPASS_DOCUMENT_VALIDATION", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var byPassDocValidation = $('#divBypassDocumentValidation').iCheck('update')[0].checked;
        if (byPassDocValidation) {
            result[MAP_REDUCE_OPTIONS.BYPASS_DOCUMENT_VALIDATION] = byPassDocValidation;
        }
    }

    return result;
};