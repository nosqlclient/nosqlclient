/**
 * Created by RSercan on 9.1.2016.
 */
Template.settings.onRendered(function () {
    $('#divAutoCompleteFields').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#cmbScale').chosen();
    $('#cmbResultView').chosen();

    Template.settings.load();
});

Template.settings.events({
    'click #btnSaveSettings': function (e) {
        e.preventDefault();
        var laddaButton = $('#btnSaveSettings').ladda();
        laddaButton.ladda('start');

        Meteor.call('updateSettings', Template.settings.getSettingsFromForm());
        toastr.success('Successfuly saved !');

        Ladda.stopAll();
    }
});

Template.settings.getSettingsFromForm = function () {
    var settings = {};
    settings.autoCompleteFields = $('#divAutoCompleteFields').iCheck('update')[0].checked;
    settings.scale = $("#cmbScale").chosen().val();
    settings.defaultResultView = $("#cmbResultView").chosen().val();
    return settings;
};

Template.settings.load = function () {
    var settings = Settings.findOne();
    var cmbScale = $('#cmbScale');
    var cmbResultView = $('#cmbResultView');

    cmbScale.val(settings.scale);
    cmbScale.trigger("chosen:updated");

    cmbResultView.val(settings.defaultResultView);
    cmbResultView.trigger("chosen:updated");

    if (settings.autoCompleteFields) {
        $('#inputAutoCompleteFields').iCheck('check');
    } else {
        $('#inputAutoCompleteFields').iCheck('uncheck');
    }
};