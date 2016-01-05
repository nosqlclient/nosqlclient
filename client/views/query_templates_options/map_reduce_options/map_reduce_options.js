/**
 * Created by RSercan on 3.1.2016.
 */
Template.out.onRendered(function () {
    Template.initializeAceEditor('aceOut', Template.mapReduce.executeQuery);
});

Template.scope.onRendered(function () {
    Template.initializeAceEditor('aceScope', Template.mapReduce.executeQuery);
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

Template.finalize.onRendered(function () {
    AceEditor.instance('aceFinalize', {
        mode: "javascript",
        theme: 'dawn'
    }, function (editor) {
        editor.$blockScrolling = Infinity;
        editor.getSession().setOption("useWorker", false);
        editor.setOptions({
            fontSize: "11pt",
            showPrintMargin: false
        });
    });
});

Template.mapReduceOptions.getOptions = function () {
    var result = {};
    Template.checkAceEditorOption("OUT", "aceOut", result, MAP_REDUCE_OPTIONS);
    Template.checkAceEditorOption("QUERY", "aceSelector", result, MAP_REDUCE_OPTIONS);
    Template.checkAceEditorOption("SORT", "aceSort", result, MAP_REDUCE_OPTIONS);
    Template.checkAceEditorOption("SCOPE", "aceScope", result, MAP_REDUCE_OPTIONS);

    if ($.inArray("FINALIZE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var finalize = ace.edit("aceFinalize").getSession().getValue();
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