import { Template } from 'meteor/templating';
import { Shell } from '/client/imports/ui';
import { SessionManager } from '/client/imports/modules';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './mc_shell.html';

Template.mcShell.events({
  'click #btnClearShell': function () {
    Shell.clear();
  },

  'click #btnShowShellHistories': function () {
    $('#shellHistoriesModal').modal('show');
  },
});

Template.mcShell.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  this.subscribe('connections');
  this.subscribe('shell_commands');

  this.autorun(() => {
    if (settings.ready()) Shell.initializeCommandCodeMirror();
  });

  Shell.init();
});
