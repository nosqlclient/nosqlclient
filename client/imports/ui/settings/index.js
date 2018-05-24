import { Communicator, ReactivityProvider } from '/client/imports/facades';
import { ErrorHandler, Notification } from '/client/imports/modules';

const Settings = function () {};

Settings.prototype = {
  proceedSavingSettings() {
    Notification.start('#btnSaveSettings');

    const settings = {};
    settings.autoCompleteSamplesCount = $('#inputAutoCompleteSamplesCount').val();
    settings.autoCompleteShortcut = $('#inputAutocompleteShortcut').val();
    settings.scale = $('#cmbScale').val();
    settings.defaultResultView = $('#cmbResultView').val();
    settings.socketTimeoutInSeconds = $('#inputSocketTimeout').val();
    settings.connectionTimeoutInSeconds = $('#inputConnectionTimeout').val();
    settings.dbStatsScheduler = $('#inputDBStatsScheduler').val();
    settings.showDBStats = $('#divShowDBStats').iCheck('update')[0].checked;
    settings.mongoBinaryPath = $('#inputMongoExecutable').val() || '';
    settings.singleTabResultSets = $('#divUseSingleTab').iCheck('update')[0].checked;
    settings.maxLiveChartDataPoints = $('#inputMaxChartPoints').val();
    settings.language = $('#cmbMongoclientLanguage').val();

    Communicator.call({
      methodName: 'updateSettings',
      args: { settings },
      callback: (err) => {
        if (err) ErrorHandler.showMeteorFuncError(err);
        else Notification.success('saved-successfully');
      }
    });
  },

  init() {
    // since we are using some external plugins such as chosen, icheck we can't load settings directly via meteor
    const settings = ReactivityProvider.findOne(ReactivityProvider.types.Settings);
    if (!settings) return;

    const cmbScale = $('#cmbScale');
    cmbScale.val(settings.scale);
    cmbScale.trigger('chosen:updated');

    const cmbResultView = $('#cmbResultView');
    cmbResultView.val(settings.defaultResultView);
    cmbResultView.trigger('chosen:updated');

    const cmbLang = $('#cmbMongoclientLanguage');
    cmbLang.val(settings.language || 'en');

    $('#inputSocketTimeout').val(settings.socketTimeoutInSeconds || 0);
    $('#inputConnectionTimeout').val(settings.connectionTimeoutInSeconds || 0);
    $('#inputDBStatsScheduler').val(settings.dbStatsScheduler || 3000);
    $('#inputAutoCompleteSamplesCount').val(settings.autoCompleteSamplesCount || 50);
    $('#inputUseSingleTab').iCheck(settings.singleTabResultSets ? 'check' : 'uncheck');
    $('#inputShowDBStats').iCheck(settings.showDBStats ? 'check' : 'uncheck');
    $('#inputMongoExecutable').val(settings.mongoBinaryPath || '');
    $('#inputMaxChartPoints').val(settings.maxLiveChartDataPoints || 15);
    $('#inputAutocompleteShortcut').val(settings.autoCompleteShortcut || 'Ctrl-Space');
  }
};

export default new Settings();
