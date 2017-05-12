import {Template} from "meteor/templating";
import Helper from "/client/imports/helper";
import {Settings} from "/lib/imports/collections/settings";
import {loadFile} from "/client/imports/views/layouts/top_navbar/top_navbar";
import "./settings.html";

const toastr = require('toastr');

Template.settings.onRendered(function () {
    $('#divAutoCompleteFields, #divShowDBStats, #divShowLiveChat, #divUseSingleTab').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });
    $('.filestyle').filestyle({});
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

    cmbScale.val(settings.scale);
    cmbScale.trigger("chosen:updated");

    cmbResultView.val(settings.defaultResultView);
    cmbResultView.trigger("chosen:updated");

    $('#inputDumpPath').val(settings.dumpPath || '');
    $('#inputMaxAllowedFetchSize').val(settings.maxAllowedFetchSize || 0);
    $('#inputSocketTimeout').val(settings.socketTimeoutInSeconds || 0);
    $('#inputConnectionTimeout').val(settings.connectionTimeoutInSeconds || 0);
    $('#inputDBStatsScheduler').val(settings.dbStatsScheduler || 3000);
    $('#inputAutoCompleteFields').iCheck(settings.autoCompleteFields ? 'check' : 'uncheck');
    $('#inputShowLiveChat').iCheck(settings.showLiveChat ? 'check' : 'uncheck');
    $('#inputUseSingleTab').iCheck(settings.singleTabResultSets ? 'check' : 'uncheck');
    $('#inputShowDBStats').iCheck(settings.showDBStats ? 'check' : 'uncheck');
    $('#inputMongoExecutable').siblings('.bootstrap-filestyle').children('input').val(settings.mongoBinaryName || 'mongo');

};