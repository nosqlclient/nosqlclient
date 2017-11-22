import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { Aggregate } from '/client/imports/ui';
import './aggregate_pipeline.html';

Template.aggregatePipeline.onRendered(function () {
  if (!SessionManager.get(SessionManager.strSessionCollectionNames)) {
    FlowRouter.go('/databaseStats');
    return;
  }

  const settings = this.subscribe('settings');
  const connections = this.subscribe('connections');

  this.autorun(() => {
    if (connections.ready() && settings.ready()) {
      $('#stages').sortable({
        connectWith: '.connectList',
      });

      $('#cmbStageQueries').chosen();
      UIComponents.initializeCollectionsCombobox();
      Aggregate.init();
    }
  });
});

Template.aggregatePipeline.events({
  'click #btnAggregateHistory': function () {
    $('#aggregateHistoriesModal').modal('show');
  },

  'click #btnExecuteAggregatePipeline': function (event) {
    event.preventDefault();
    Aggregate.execute();
  },

  'change #cmbStageQueries': function () {
    Aggregate.addStageElement();
  },

  'click #remove-stage-element': function (e) {
    e.preventDefault();
    const stageId = `#stage${$(e.target).data('number')}`;
    $(stageId).remove();
  },
});
