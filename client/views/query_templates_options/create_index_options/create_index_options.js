/**
 * Created by RSercan on 2.1.2016.
 */
Template.unique.onRendered(function () {
    $('#divUnique').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.sparse.onRendered(function () {
    $('#divSparse').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.background.onRendered(function () {
    $('#divBackground').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
});

Template.createIndexOptions.getOptions = function () {
    var result = {};
    Template.checkAndAddOption("MAX", $('#divMax'), result, CURSOR_OPTIONS);
    Template.checkAndAddOption("MIN", $('#divMin'), result, CURSOR_OPTIONS);

    if ($.inArray("UNIQUE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var uniqueVal = $('#divUnique').iCheck('update')[0].checked;
        if (uniqueVal) {
            result[CREATE_INDEX_OPTIONS.UNIQUE] = uniqueVal;
        }
    }

    if ($.inArray("SPARSE", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var sparseVal = $('#divSparse').iCheck('update')[0].checked;
        if (sparseVal) {
            result[CREATE_INDEX_OPTIONS.SPARSE] = sparseVal;
        }
    }

    if ($.inArray("BACKGROUND", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var backgroundVal = $('#divBackground').iCheck('update')[0].checked;
        if (backgroundVal) {
            result[CREATE_INDEX_OPTIONS.BACKGROUND] = backgroundVal;
        }
    }

    return result;
};