import { Template } from 'meteor/templating';
import { Settings } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import './settings.html';
import { UIComponents } from '../../../modules';

Template.settings.onRendered(function () {
  UIComponents.Checkbox.init($('#inputShowDBStats, #inputUseSingleTab, #inputToggleUpdates'));
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
