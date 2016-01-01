/**
 * Created by RSercan on 1.1.2016.
 */
Template.findOne.onRendered(function () {
    // set ace editor
    Template.find.initializeAceEditor();
    Template.findOne.initializeOptions();
    Template.find.initializeSessionVariable();
});

Template.findOne.initializeOptions = function () {
    var cmb = $('#cmbCursorOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
        // dont add limit, it will be 1 already
        if (value != CURSOR_OPTIONS.LIMIT) {
            cmb.append($("<option></option>")
                .attr("value", key)
                .text(value));
        }
    });

    cmb.chosen();
    Template.find.setCursorOptionsChangeEvent(cmb);
};

Template.findOne.executeQuery = function () {
    Template.find.executeQuery('findOne');
}