/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOneAndUpdate.onRendered(function () {
    // set ace editor
    Template.initializeAceEditor('preSelector', Template.findOneAndUpdate.executeQuery);
    Template.findOneAndUpdate.initializeOptions();
});

Template.findOneAndUpdate.initializeOptions = function () {
    var cmb = $('#cmbFindOneModifyOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
        // dont add limit, it will be 1 already
        if (value != CURSOR_OPTIONS.LIMIT) {
            cmb.append($("<option></option>")
                .attr("value", key)
                .text(value));
        }
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.findOneAndUpdate.executeQuery = function () {

};