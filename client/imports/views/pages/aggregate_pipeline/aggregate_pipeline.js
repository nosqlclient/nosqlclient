import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { SessionManager, UIComponents } from '/client/imports/modules';
import { Aggregate } from '/client/imports/ui';
import Helper from '/client/imports/helpers/helper';
import '/client/imports/views/query_templates_options/aggregate_options/aggregate_options';
import './aggregate_histories/aggregate_histories';
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

      UIComponents.Combobox.init({ selector: $('#cmbStageQueries'), empty: false, options: {} });
      UIComponents.Combobox.initializeCollectionsCombobox($('#cmbCollectionsAggregate'));
      Aggregate.init();
    }
  });
});

Template.aggregatePipeline.helpers({
  getPageHeading() {
    return Helper.translate({ key: 'aggregate' });
  }
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

  'click #remove-stage-element': function (event) {
    event.preventDefault();
    const stageId = `#stage${$(event.target).data('number')}`;
    $(stageId).remove();
  },

  'click #btnShowFinalizedQuery': function (event) {
    event.preventDefault();
    Aggregate.showFinalizedQuery();
  },
});
