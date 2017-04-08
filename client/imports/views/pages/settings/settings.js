import {Template} from "meteor/templating";
import Helper from "/client/imports/helper";
import {Settings} from "/lib/imports/collections/settings";
import "./settings.html";

const toastr = require('toastr');

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
        Helper.warnDemoApp();
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

    cmbScale.val(settings.scale);
    cmbScale.trigger("chosen:updated");

    cmbResultView.val(settings.defaultResultView);
    cmbResultView.trigger("chosen:updated");

    if (settings.dumpPath) inputDumpPath.val(settings.dumpPath);

    if (settings.maxAllowedFetchSize) inputMaxAllowedFetchSize.val(settings.maxAllowedFetchSize);
    else inputMaxAllowedFetchSize.val(0);

    if (settings.socketTimeoutInSeconds) inputSocketTimeout.val(settings.socketTimeoutInSeconds);
    else inputSocketTimeout.val(0);

    if (settings.connectionTimeoutInSeconds) inputConnectionTimeout.val(settings.connectionTimeoutInSeconds);
    else inputConnectionTimeout.val(0);

    if (settings.dbStatsScheduler) inputDBStatsScheduler.val(settings.dbStatsScheduler);
    else inputDBStatsScheduler.val(3000);

    if (settings.autoCompleteFields) inputAutoCompleteFields.iCheck('check');
    else inputAutoCompleteFields.iCheck('uncheck');

    if (settings.showLiveChat) inputShowLiveChat.iCheck('check');
    else inputShowLiveChat.iCheck('uncheck');

    if (settings.singleTabResultSets) inputUseSingleTab.iCheck('check');
    else inputUseSingleTab.iCheck('uncheck');

    if (settings.showDBStats) inputShowDBStats.iCheck('check');
    else inputShowDBStats.iCheck('uncheck');

};