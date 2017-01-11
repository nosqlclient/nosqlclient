import {Template} from "meteor/templating";
import {Meteor} from "meteor/meteor";
import {Settings} from "/lib/imports/collections/settings";
import "./settings.html";

const toastr = require('toastr');
const Ladda = require('ladda');
/**
 * Created by RSercan on 9.1.2016.
 */

const getSettingsFromForm = function () {
    const settings = {};
    settings.autoCompleteFields = $('#divAutoCompleteFields').iCheck('update')[0].checked;
    settings.scale = $("#cmbScale").chosen().val();
    settings.defaultResultView = $("#cmbResultView").chosen().val();
    settings.maxAllowedFetchSize = $("#inputMaxAllowedFetchSize").val();
    settings.socketTimeoutInSeconds = $("#inputSocketTimeout").val();
    settings.connectionTimeoutInSeconds = $("#inputConnectionTimeout").val();
    settings.showDBStats = $('#divShowDBStats').iCheck('update')[0].checked;
    settings.showLiveChat = $('#divShowLiveChat').iCheck('update')[0].checked;
    settings.dumpPath = $('#inputDumpPath').val();
    return settings;
};

Template.settings.onRendered(function () {
    $('#divAutoCompleteFields, #divShowDBStats, #divShowLiveChat').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $('#cmbScale, #cmbResultView').chosen();

    let settings = this.subscribe('settings');
    let connections = this.subscribe('connections');

    this.autorun(() => {
        if (settings.ready() && connections.ready()) {
            load();
        }
    });
});

Template.settings.events({
    'click #btnSaveSettings' (e) {
        e.preventDefault();

        const laddaButton = Ladda.create(document.querySelector('#btnSaveSettings'));
        laddaButton.start();

        Meteor.call('updateSettings', getSettingsFromForm());
        toastr.success('Successfuly saved !');


        Ladda.stopAll();
    }
});

const load = function () {
    // since we are using some external plugins such as chosen, icheck we can't load settings directly via meteor
    const settings = Settings.findOne();
    const cmbScale = $('#cmbScale');
    const cmbResultView = $('#cmbResultView');
    const inputMaxAllowedFetchSize = $('#inputMaxAllowedFetchSize');
    const inputSocketTimeout = $('#inputSocketTimeout');
    const inputConnectionTimeout = $('#inputConnectionTimeout');
    const inputAutoCompleteFields = $('#inputAutoCompleteFields');
    const inputShowLiveChat = $('#inputShowLiveChat');
    const inputShowDBStats = $('#inputShowDBStats');
    const inputDumpPath = $('#inputDumpPath');

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

    if (settings.showLiveChat) {
        inputShowLiveChat.iCheck('check');
    } else {
        inputShowLiveChat.iCheck('uncheck');
    }

    if (settings.showDBStats) {
        inputShowDBStats.iCheck('check');
    } else {
        inputShowDBStats.iCheck('uncheck');
    }
};