/**
 * Created by sercan on 31.12.2015.
 */
Template.max.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceMax');
});

Template.min.onRendered(function () {
    Template.cursorOptions.initializeAceEditor('aceMin');
});

Template.cursorOptions.initializeAceEditor = function (id) {
    // find and findOne templates uses same cursor options so clarify ENTER key event on SELECTOR.
    // disable Enter Shift-Enter keys and bind to executeQuery for corresponding template
    var parentTemplateName = Template.getParentTemplateName(2);
    if (parentTemplateName == QUERY_TYPES.FIND) {
        Template.initializeAceEditor(id, Template.find.executeQuery);
    }
    else if (parentTemplateName == QUERY_TYPES.FINDONE) {
        Template.initializeAceEditor(id, Template.findOne.executeQuery);
    }

};

Template.cursorOptions.getCursorOptions = function () {
    var result = {};
    Template.checkAceEditorOption("PROJECT", "aceProject", result, CURSOR_OPTIONS);
    Template.checkAceEditorOption("MAX", "aceMax", result, CURSOR_OPTIONS);
    Template.checkAceEditorOption("MIN", "aceMin", result, CURSOR_OPTIONS);
    Template.checkAceEditorOption("SORT", "aceSort", result, CURSOR_OPTIONS);

    if ($.inArray("SKIP", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var skipVal = $('#inputSkip').val();
        if (skipVal) {
            result[CURSOR_OPTIONS.SKIP] = parseInt(skipVal);
        }
    }

    if ($.inArray("LIMIT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[CURSOR_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }

    return result;
};