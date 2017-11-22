import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { UIComponents, SessionManager } from '/client/imports/modules';
import './shell_histories.html';

Template.shellHistories.onRendered(() => {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  UIComponents.DataTable.initiateDatatable({
    selector: $('#tblShellHistories'),
    sessionKey: SessionManager.strSessionSelectedShellHistory,
    clickCallback: () => { $('#btnUseHistoricalShellQuery').prop('disabled', false); },
    noDeleteEvent: true
  });
});

Template.shellHistories.events({
  'click #btnUseHistoricalShellQuery': function (event) {
    event.preventDefault();
    const history = SessionManager.get(SessionManager.strSessionSelectedShellHistory);
    if (history) UIComponents.Editor.setCodeMirrorValue($('#divShellCommand'), history.command);
  },
});
