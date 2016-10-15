/**
 * Created by sercan on 31.12.2015.
 */

Template.cursorOptions.getCursorOptions = function () {
    var result = {};
    Template.checkAndAddOption("PROJECT", $('#divProject'), result, CURSOR_OPTIONS);
    Template.checkAndAddOption("MAX", $('#divMax'), result, CURSOR_OPTIONS);
    Template.checkAndAddOption("MIN", $('#divMin'), result, CURSOR_OPTIONS);
    Template.checkAndAddOption("SORT", $('#divSort'), result, CURSOR_OPTIONS);

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