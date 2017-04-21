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
    settings.dbStatsScheduler = $("#inputDBStatsScheduler").val();
    settings.showDBStats = $('#divShowDBStats').iCheck('update')[0].checked;
    settings.showLiveChat = $('#divShowLiveChat').iCheck('update')[0].checked;
    settings.dumpPath = $('#inputDumpPath').val();
    settings.singleTabResultSets = $('#divUseSingleTab').iCheck('update')[0].checked;
    settings.maxLiveChartDataPoints = $('#inputMaxChartPoints').val();
    return settings;
};

Template.settings.onRendered(function () {
    $('#divAutoCompleteFields, #divShowDBStats, #divShowLiveChat, #divUseSingleTab').iCheck({
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

        Ladda.create(document.querySelector('#btnSaveSettings')).start();

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
    const inputDBStatsScheduler = $('#inputDBStatsScheduler');
    const inputAutoCompleteFields = $('#inputAutoCompleteFields');
    const inputShowLiveChat = $('#inputShowLiveChat');
    const inputShowDBStats = $('#inputShowDBStats');
    const inputDumpPath = $('#inputDumpPath');
    const inputUseSingleTab = $('#inputUseSingleTab');
    const inputMaxLiveChartDataPoints = $('#inputMaxChartPoints');

    cmbScale.val(settings.scale);
    cmbScale.trigger("chosen:updated");

    cmbResultView.val(settings.defaultResultView);
    cmbResultView.trigger("chosen:updated");

    inputDumpPath.val(settings.dumpPath ? settings.dumpPath : '');
    inputMaxAllowedFetchSize.val(settings.maxAllowedFetchSize ? settings.maxAllowedFetchSize : 0);
    inputMaxLiveChartDataPoints.val(settings.maxLiveChartDataPoints ? settings.maxLiveChartDataPoints : 15);
    inputSocketTimeout.val(settings.socketTimeoutInSeconds ? settings.socketTimeoutInSeconds : 0);
    inputConnectionTimeout.val(settings.connectionTimeoutInSeconds ? settings.connectionTimeoutInSeconds : 0);
    inputDBStatsScheduler.val(settings.dbStatsScheduler ? settings.dbStatsScheduler : 3000);
    inputAutoCompleteFields.iCheck(settings.autoCompleteFields ? 'check' : 'uncheck');
    inputShowLiveChat.iCheck(settings.showLiveChat ? 'check' : 'uncheck');
    inputUseSingleTab.iCheck(settings.singleTabResultSets ? 'check' : 'uncheck');
    inputShowDBStats.iCheck(settings.showDBStats ? 'check' : 'uncheck');
};