import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { Aggregate } from '/client/imports/ui';
import './aggregate_histories.html';

Template.aggregateHistories.onRendered(() => {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  UIComponents.DataTable.initiateDatatable({
    selector: $('#tblAggregateHistories'),
    sessionKey: SessionManager.strSessionSelectedAggregateHistory,
    clickCallback: () => { $('#btnUseHistoricalPipeline').prop('disabled', false); },
    noDeleteEvent: true
  });
});

Template.aggregateHistories.events({
  'click #btnUseHistoricalPipeline': function (event) {
    event.preventDefault();
    const history = SessionManager.get(SessionManager.strSessionSelectedAggregateHistory);
    if (history) Aggregate.renderQuery({ queryInfo: history.collection, queryParams: history.pipeline });
  },
});
