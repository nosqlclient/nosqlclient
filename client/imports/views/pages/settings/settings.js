import { Template } from 'meteor/templating';
import { Settings } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import './settings.html';

Template.settings.onRendered(function () {
  $('#divShowDBStats, #divShowLiveChat, #divUseSingleTab').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
  $('#cmbScale, #cmbResultView').chosen();

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  this.autorun(() => {
    if (settings.ready() && connections.ready()) Settings.init();
  });
});

Template.settings.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'settings' });
  }
});

Template.settings.events({
  'click #btnSaveSettings': function (event) {
    event.preventDefault();
    Settings.proceedSavingSettings();
  },
});
