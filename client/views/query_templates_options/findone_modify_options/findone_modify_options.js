/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneModifyOptions.getOptions = function () {
    var result = {};
    Template.checkAndAddOption("PROJECTION", $('#divProject'), result, FINDONE_MODIFY_OPTIONS);
    Template.checkAndAddOption("SORT", $('#divSort'), result, FINDONE_MODIFY_OPTIONS);

    if ($.inArray("RETURN_ORIGINAL", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var returnOrgVal = $('#divReturnOriginal').iCheck('update')[0].checked;
        if (returnOrgVal) {
            result[FINDONE_MODIFY_OPTIONS.RETURN_ORIGINAL] = returnOrgVal;
        }
    }

    if ($.inArray("UPSERT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var upsertVal = $('#divUpsert').iCheck('update')[0].checked;
        if (upsertVal) {
            result[FINDONE_MODIFY_OPTIONS.UPSERT] = upsertVal;
        }
    }

    return result;
};