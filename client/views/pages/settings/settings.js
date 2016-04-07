/**
 * Created by RSercan on 9.1.2016.
 */
Template.settings.onRendered(function () {
    $('#divAutoCompleteFields').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#divShowDBStats').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#cmbScale').chosen();
    $('#cmbResultView').chosen();

    Template.settings.load();
});

Template.settings.events({
    'click #btnSaveSettings': function (e) {
        e.preventDefault();
        Template.warnDemoApp();
    }
});

Template.settings.getSettingsFromForm = function () {
    var settings = {};
    settings.autoCompleteFields = $('#divAutoCompleteFields').iCheck('update')[0].checked;
    settings.scale = $("#cmbScale").chosen().val();
    settings.defaultResultView = $("#cmbResultView").chosen().val();
    settings.maxAllowedFetchSize = $("#inputMaxAllowedFetchSize").val();
    settings.socketTimeoutInSeconds = $("#inputSocketTimeout").val();
    settings.connectionTimeoutInSeconds = $("#inputConnectionTimeout").val();
    settings.showDBStats = $('#divShowDBStats').iCheck('update')[0].checked;
    settings.dumpPath = $('#divDumpPath').val();
    return settings;
};

Template.settings.load = function () {
    // since we are using some external plugins such as chosen, icheck we can't load settings directly via meteor
    var settings = Settings.findOne();
    var cmbScale = $('#cmbScale');
    var cmbResultView = $('#cmbResultView');
    var inputMaxAllowedFetchSize = $('#inputMaxAllowedFetchSize');
    var inputSocketTimeout = $('#inputSocketTimeout');
    var inputConnectionTimeout = $('#inputConnectionTimeout');
    var inputAutoCompleteFields = $('#inputAutoCompleteFields');
    var inputShowDBStats = $('#inputShowDBStats');
    var inputDumpPath = $('#inputDumpPath');

    cmbScale.val(settings.scale);
    cmbScale.trigger("chosen:updated");

    cmbResultView.val(settings.defaultResultView);
    cmbResultView.trigger("chosen:updated");

    if (settings.dumpPath) {
        inputDumpPath.val(settings.dumpPath);
    }

    if (settings.maxAllowedFetchSize) {
        inputMaxAllowedFetchSize.val(settings.maxAllowedFetchSize);
    } else {
        inputMaxAllowedFetchSize.val(0);
    }

    if (settings.socketTimeoutInSeconds) {
        inputSocketTimeout.val(settings.socketTimeoutInSeconds);
    } else {
        inputSocketTimeout.val(0);
    }

    if (settings.connectionTimeoutInSeconds) {
        inputConnectionTimeout.val(settings.connectionTimeoutInSeconds);
    } else {
        inputConnectionTimeout.val(0);
    }

    if (settings.autoCompleteFields) {
        inputAutoCompleteFields.iCheck('check');
    } else {
        inputAutoCompleteFields.iCheck('uncheck');
    }

    if (settings.showDBStats) {
        inputShowDBStats.iCheck('check');
    } else {
        inputShowDBStats.iCheck('uncheck');
    }
};