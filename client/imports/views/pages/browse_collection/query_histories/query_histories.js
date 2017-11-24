import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactivityProvider } from '/client/imports/facades';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { QueryRender } from '/client/imports/ui';
import './query_histories.html';

Template.queryHistories.onRendered(() => {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  UIComponents.DataTable.initiateDatatable({
    selector: $('#tblQueryHistories'),
    clickCallback: (table, row) => {
      const selectedId = row.data()._id;
      SessionManager.set(SessionManager.strSessionSelectedQueryHistory, ReactivityProvider.findOne(ReactivityProvider.types.QueryHistory, { _id: selectedId }));
      $('#btnExecuteAgain').prop('disabled', false);
    },
    noDeleteEvent: true
  });
});

Template.queryHistories.events({
  'click #btnExecuteAgain': function (event) {
    event.preventDefault();
    const history = SessionManager.get(SessionManager.strSessionSelectedQueryHistory);
    if (history) QueryRender.renderQuery(Object.assign({ queryInfo: history.queryName, queryParams: JSON.parse(history.params) }), history);
  },
});
